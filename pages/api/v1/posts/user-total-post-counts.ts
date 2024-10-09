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
import { TOTAL_PROPOSALS_AND_VOTES_COUNT_BY_ADDRESSES } from '~src/queries';
import getEncodedAddress from '~src/util/getEncodedAddress';
import getAddressesFromUserId from '~src/auth/utils/getAddressesFromUserId';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
interface Props {
	network: string;
	userId?: any;
	addresses?: string[];
}

export const getUserPostCount = async (params: Props) => {
	try {
		const { network, addresses, userId } = params;
		let discussionsCounts = 0;
		if (userId) {
			const discussionsRef = await postsByTypeRef(network, ProposalType.DISCUSSIONS).where('isDeleted', '==', false).where('user_id', '==', Number(userId)).get();
			discussionsCounts = discussionsRef.size;
		}
		let user_addresses: any[] = [];

		if ((!addresses?.length || !addresses) && userId) {
			user_addresses = await getAddressesFromUserId(userId);
			user_addresses = user_addresses.map((addr) => addr.address);
		}
		const subsquidRes = await fetchSubsquid({
			network,
			query: TOTAL_PROPOSALS_AND_VOTES_COUNT_BY_ADDRESSES,
			variables: {
				addresses: (addresses?.length ? addresses : user_addresses).map((address) => getEncodedAddress(address, network) || '')
			}
		});
		return {
			data: JSON.parse(
				JSON.stringify({
					discussions: discussionsCounts || 0,
					proposals: subsquidRes?.['data']?.['totalProposals']?.totalCount || 0,
					votes: subsquidRes?.['data']?.['totalVotes']?.totalCount || 0
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
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const { userId, addresses = [] } = req.body;
	if (!userId && userId !== 0 && !addresses.length) return res.status(403).json({ message: messages.INVALID_PARAMS });

	const { data, error, status } = await getUserPostCount({
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
