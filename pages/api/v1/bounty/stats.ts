// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BN } from '@polkadot/util';
import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import { GET_ACTIVE_BOUNTIES_WITH_REWARDS, GET_AWARDED_CHILD_BOUNTIES_REWARDS_FOR_PARENT_BOUNTY_INDICES } from '~src/queries';
import { IBountyStats } from '~src/types';
import fetchSubsquid from '~src/util/fetchSubsquid';

const handler: NextApiHandler<IBountyStats | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const subsquidRes = await fetchSubsquid({
		network,
		query: GET_ACTIVE_BOUNTIES_WITH_REWARDS
	});

	if (!subsquidRes?.data?.proposals?.length) return res.status(200).json({ message: 'No bounty data found' });

	const activeBounties = String(subsquidRes.data.proposals.length);
	let totalBountyPool = subsquidRes.data.proposals.reduce((totalActive: BN, { reward }: { reward: string }) => totalActive.add(new BN(reward)), new BN(0));

	const activeBountyIndices = subsquidRes.data.proposals.map(({ index }: { index: string }) => index);

	// 1. get all claimed child bounties for these indices
	const allChildBounties = await fetchSubsquid({
		network,
		query: GET_AWARDED_CHILD_BOUNTIES_REWARDS_FOR_PARENT_BOUNTY_INDICES,
		variables: { parentBountyIndex_in: activeBountyIndices }
	});

	if (!allChildBounties?.data?.proposals?.length) {
		return res.status(200).json({
			activeBounties,
			availableBountyPool: 'N/A',
			peopleEarned: 'N/A',
			totalBountyPool: totalBountyPool.toString(),
			totalRewarded: 'N/A'
		});
	}

	// 2. calculate the total claimed amount (this will be the totalRewarded)
	totalBountyPool = allChildBounties.data.proposals.reduce((total: BN, { reward }: { reward: string }) => total.add(new BN(reward)), new BN(0));

	const awardedChildBounties = allChildBounties.data.proposals?.filter(
		(bounty: { statusHistory: { status: string }[] }) => bounty.statusHistory?.some((item: { status: string }) => item?.status === 'Awarded')
	);

	const totalRewarded = awardedChildBounties.reduce((total: BN, { reward }: { reward: string }) => total.add(new BN(reward)), new BN(0));

	return res.status(200).json({
		activeBounties,
		availableBountyPool: totalBountyPool.sub(totalRewarded).toString(),
		peopleEarned: String(allChildBounties.data.proposals.length),
		totalBountyPool: totalBountyPool.toString(),
		totalRewarded: totalRewarded.toString()
	});
};

export default withErrorHandling(handler);
