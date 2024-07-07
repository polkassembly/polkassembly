// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import { CustomStatus } from '~src/components/Listing/Tracks/TrackListingCard';
import { getStatusesFromCustomStatus } from '~src/global/proposalType';
import { GET_BOUNTY_PROPOSALS, GET_BOUNTY_REWARDS_BY_IDS } from '~src/queries';
import { IBountyProposerResponse } from '~src/types';
import fetchSubsquid from '~src/util/fetchSubsquid';

export interface IBountyProposal {
	proposer: string;
	index: number;
	trackNumber: number;
	status: string;
	bountyId: number;
	reward: string;
}

const handler: NextApiHandler<IBountyProposerResponse | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const subsquidRes = await fetchSubsquid({
		network,
		query: GET_BOUNTY_PROPOSALS,
		variables: {
			status_in: getStatusesFromCustomStatus(CustomStatus.Voting)
		}
	});

	if (!subsquidRes?.data?.proposals?.length) return res.status(200).json({ message: 'No bounty data found' });

	const proposals = subsquidRes.data.proposals.map(
		({
			proposer,
			trackNumber,
			index,
			status,
			preimage: {
				proposedCall: {
					args: { bountyId }
				}
			}
		}: {
			proposer: string;
			trackNumber: string;
			index: number;
			status: string;
			preimage: {
				proposedCall: {
					args: { bountyId: number };
				};
			};
		}) => ({
			bountyId,
			index,
			proposer,
			status,
			trackNumber
		})
	);

	const bountyIds = proposals.map(({ bountyId }: { bountyId: number }) => bountyId);

	const rewardsRes = await fetchSubsquid({
		network,
		query: GET_BOUNTY_REWARDS_BY_IDS,
		variables: {
			index_in: bountyIds
		}
	});

	const rewards = rewardsRes?.data?.proposals?.reduce((acc: any, { index, reward }: { index: number; reward: string }) => {
		acc[index] = reward;
		return acc;
	}, {});

	const finalProposals = proposals.map((proposal: IBountyProposal) => ({
		...proposal,
		reward: rewards[proposal.bountyId] || null
	}));

	return res.status(200).json({
		proposals: finalProposals
	});
};

export default withErrorHandling(handler);
