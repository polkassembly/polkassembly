// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import { GET_ACTIVE_BOUNTIES_WITH_REWARDS, GET_CLAIMED_CHILD_BOUNTIES_PAYEES_AND_REWARD_FOR_PARENT_BOUNTY_INDICES } from '~src/queries';
import { IBountyUserActivity } from '~src/types';
import fetchSubsquid from '~src/util/fetchSubsquid';

const handler: NextApiHandler<{ data: IBountyUserActivity[] } | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const subsquidRes = await fetchSubsquid({
		network,
		query: GET_ACTIVE_BOUNTIES_WITH_REWARDS
	});

	if (!subsquidRes?.data?.proposals?.length) return res.status(200).json({ message: 'No bounty data found' });

	const activeBountyIndices = subsquidRes.data.proposals.map(({ index }: { index: string }) => index);

	// 1. get all claimed child bounties for these indices
	const claimedChildBounties = await fetchSubsquid({
		network,
		query: GET_CLAIMED_CHILD_BOUNTIES_PAYEES_AND_REWARD_FOR_PARENT_BOUNTY_INDICES,
		variables: { parentBountyIndex_in: activeBountyIndices }
	});

	if (!claimedChildBounties?.data?.proposals?.length) {
		return res.status(200).json({
			data: []
		});
	}

	const data: IBountyUserActivity[] = claimedChildBounties.data.proposals.map((childBountyData: any) => ({
		activity: 'claimed',
		address: childBountyData.payee,
		amount: childBountyData.reward,
		created_at: childBountyData.statusHistory[0].timestamp
	}));

	return res.status(200).json({
		data
	});
};

export default withErrorHandling(handler);
