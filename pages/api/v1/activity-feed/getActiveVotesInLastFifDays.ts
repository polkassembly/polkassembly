// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { GET_ACTIVE_PROPOSAL_INDEXES_FOR_TIMESPAN, GET_VOTE_COUNT_FROM_PROPOSAL_INDEXES } from '~src/queries';
import { getStatusesFromCustomStatus, getSubsquidLikeProposalType, ProposalType } from '~src/global/proposalType';
import dayjs from 'dayjs';
import authServiceInstance from '~src/auth/auth';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import { CustomStatus } from '~src/components/Listing/Tracks/TrackListingCardAll';

const handler: NextApiHandler<{ totalVotes: number; activeProposals: number } | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

	const token = getTokenFromReq(req);
	if (!token) return res.status(401).json({ message: messages.INVALID_JWT });

	const user = await authServiceInstance.GetUser(token);
	if (!user || isNaN(user.id)) return res.status(403).json({ message: messages.UNAUTHORISED });

	const { addresses } = req.body;

	if (!addresses?.length) return res.status(400).json({ message: messages.INVALID_PARAMS });

	try {
		const subsquidRes = await fetchSubsquid({
			network,
			query: GET_ACTIVE_PROPOSAL_INDEXES_FOR_TIMESPAN,
			variables: {
				createdAt_gte: dayjs().subtract(15, 'days').toISOString(),
				status_in: getStatusesFromCustomStatus(CustomStatus.Active),
				type: getSubsquidLikeProposalType(ProposalType.REFERENDUM_V2)
			}
		});

		const allActiveProposals = subsquidRes?.data?.proposals || [];

		if (!allActiveProposals?.length) {
			return res.status(500).json({ message: messages.NO_ACTIVE_PROPOSAL_FOUND });
		}
		const activeProposalIndexes: number[] = allActiveProposals?.map((proposal: { index: number }) => proposal?.index) || [];

		const totalVotesCountRes = await fetchSubsquid({
			network,
			query: GET_VOTE_COUNT_FROM_PROPOSAL_INDEXES,
			variables: {
				proposalIndexes: activeProposalIndexes,
				type: getSubsquidLikeProposalType(ProposalType.REFERENDUM_V2),
				voter_in: addresses || []
			}
		});

		const totalVotesCount = totalVotesCountRes?.data?.flattenedConvictionVotesConnection?.totalCount || 0;

		return res.status(200).json({ activeProposals: activeProposalIndexes?.length, totalVotes: totalVotesCount });
	} catch (err) {
		return res.status(500).json({ message: err || messages.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
