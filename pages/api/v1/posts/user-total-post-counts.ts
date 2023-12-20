// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { MessageType } from '~src/auth/types';
import { ProposalType } from '~src/global/proposalType';
import messages from '~src/auth/utils/messages';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { TOTAL_PROPOSALS_COUNT_BY_ADDRESSES } from '~src/queries';
import getEncodedAddress from '~src/util/getEncodedAddress';
import getAddressesFromUserId from '~src/auth/utils/getAddressesFromUserId';
import { getOnChainUserPosts } from '../listing/get-on-chain-user-post';
import { isOpenGovSupported } from '~src/global/openGovNetworks';

interface Props {
	network: string;
	userId: any;
	addresses?: string[];
	address?: any;
}

export const getUserPostCount = async (params: Props) => {
	try {
		const { network, addresses, address, userId } = params;

		const discussionsRef = await postsByTypeRef(network, ProposalType.DISCUSSIONS).where('isDeleted', '==', false).where('user_id', '==', Number(userId)).get();
		const discussionsCounts = discussionsRef.size;
		let user_addresses: any[] = [];
		let totalUserPost;
		let totalProposal;
		let totalDiscussion;
		if (!userId) {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			totalUserPost = await getOnChainUserPosts({
				addresses: [address] || [],
				network
			});
			if (totalUserPost) {
				if (isOpenGovSupported(network)) {
					const treasuryProposals = totalUserPost?.data?.open_gov?.treasury;
					if (treasuryProposals) {
						totalProposal =
							treasuryProposals?.big_spender?.length +
							treasuryProposals?.small_spender?.length +
							treasuryProposals?.medium_spender?.length +
							treasuryProposals?.big_tipper?.length +
							treasuryProposals?.small_tipper?.length +
							treasuryProposals?.treasurer?.length;
					}
					totalDiscussion = totalUserPost?.data?.open_gov?.discussions?.posts?.length;
				} else {
					const treasuryProposals = totalUserPost?.data?.gov1?.treasury;
					if (treasuryProposals) {
						totalProposal = treasuryProposals?.bounties?.length + treasuryProposals?.tips?.length + treasuryProposals?.treasury_proposals?.length;
					}
					totalDiscussion = totalUserPost?.data?.gov1?.discussions?.posts?.length;
				}
				return {
					data: JSON.parse(
						JSON.stringify({
							discussions: totalDiscussion || 0,
							proposals: totalProposal || 0
						})
					),
					error: null,
					status: 200
				};
			} else {
				return {
					data: null,
					error: messages.INVALID_PARAMS,
					status: 500
				};
			}
		}
		if (!addresses?.length || !addresses) {
			user_addresses = await getAddressesFromUserId(userId);
			user_addresses = user_addresses.map((addr) => addr.address);
		}
		const subsquidRes = await fetchSubsquid({
			network,
			query: TOTAL_PROPOSALS_COUNT_BY_ADDRESSES,
			variables: {
				proposer_in: (addresses?.length ? addresses : user_addresses).map((address) => getEncodedAddress(address, network) || '')
			}
		});
		return {
			data: JSON.parse(
				JSON.stringify({
					discussions: discussionsCounts || 0,
					proposals: subsquidRes['data']['proposalsConnection']?.totalCount || 0
				})
			),
			error: null,
			status: 200
		};
	} catch (error) {
		return {
			data: null,
			error: error.message || messages.API_FETCH_ERROR,
			status: Number(error.name) || 500
		};
	}
};

const handler: NextApiHandler<{ discussions: number; proposals: number } | MessageType> = async (req, res) => {
	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const { userId, addresses = [], address } = req.body;
	if (userId !== 0 && !userId && isNaN(Number(userId)) && !address) return res.status(403).json({ message: messages.INVALID_PARAMS });

	const { data, error, status } = await getUserPostCount({
		address,
		addresses,
		network,
		userId
	});

	if (error || !data) {
		return res.status(status).json({ message: error || messages.API_FETCH_ERROR });
	} else {
		return res.status(status).json(data);
	}
};

export default withErrorHandling(handler);
