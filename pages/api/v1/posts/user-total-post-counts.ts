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

interface Props {
	network: string;
	userId: number;
	addresses: string[];
}

export const getUserPostCount = async (params: Props) => {
	try {
		const { network, userId, addresses } = params;

		const discussionsRef = await postsByTypeRef(network, ProposalType.DISCUSSIONS).where('isDeleted', '==', false).where('user_id', '==', Number(userId)).get();
		const discussionsCounts = discussionsRef.size;

		const subsquidRes = await fetchSubsquid({
			network,
			query: TOTAL_PROPOSALS_COUNT_BY_ADDRESSES,
			variables: {
				proposer_in: addresses.map((address) => getEncodedAddress(address, network) || '')
			}
		});
		return {
			data: JSON.parse(
				JSON.stringify({
					discussions: discussionsCounts || 0,
					proposals: subsquidRes['data']['proposalsConnection']?.totalCount
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

	const { userId, addresses } = req.body;
	if (isNaN(Number(userId))) return res.status(403).json({ message: messages.UNAUTHORISED });

	if (!Array.isArray(addresses) || !addresses.length) return res.status(403).json({ message: messages.INVALID_PARAMS });

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
