// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isProposalTypeValid, isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import { getSubsquidProposalType } from '~src/global/proposalType';
import { GET_VOTE_HISTORY_BY_VOTER_ADDRESS_AND_PROPOSAL_INDEX } from '~src/queries';
import { IApiResponse, IGetVotesHistoryParams, IVoteHistory, IVotesHistoryResponse } from '~src/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import fetchSubsquid from '~src/util/fetchSubsquid';
import messages from '~src/util/messages';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';

export async function getVotesHistory(params: IGetVotesHistoryParams): Promise<IApiResponse<IVotesHistoryResponse>> {
	try {
		const { voterAddress, network, listingLimit, page, proposalIndex, proposalType } = params;
		if (!voterAddress) {
			throw apiErrorWithStatusCode(`Invalid address ${voterAddress}.`, 400);
		}
		const numPage = Number(page);

		if (isNaN(Number(proposalIndex))) {
			throw apiErrorWithStatusCode(`No proposal found for "${proposalIndex}." .`, 400);
		}
		if (!isProposalTypeValid(String(proposalType)) || !['referendums', 'referendums_v2'].includes(String(proposalType))) {
			throw apiErrorWithStatusCode(`Invalid proposal type "${proposalType}." .`, 400);
		}

		const query = GET_VOTE_HISTORY_BY_VOTER_ADDRESS_AND_PROPOSAL_INDEX;

		const variables = {
			limit: Number(listingLimit),
			offset: Number(listingLimit) * (numPage - 1),
			proposalIndex: Number(proposalIndex),
			type_eq: getSubsquidProposalType(proposalType as any),
			voter_eq: String(voterAddress)
		};

		const subsquidRes = await fetchSubsquid({
			network,
			query,
			variables: variables
		});

		const subsquidData = subsquidRes?.data;
		const isDataAbsent = !subsquidData?.flattenedConvictionVotes;
		if (!subsquidData || isDataAbsent) {
			throw apiErrorWithStatusCode(`Votes history of voter "${voterAddress}" is not found.`, 404);
		}

		const votes = subsquidData?.flattenedConvictionVotes;

		const res: IVotesHistoryResponse = {
			count: 0,
			votes: []
		};

		const count = subsquidData?.flattenedConvictionVotesConnection?.totalCount;
		const numCount = Number(count);
		if (!isNaN(numCount)) {
			res.count = numCount;
		}
		if (votes && Array.isArray(votes)) {
			votes.forEach((vote) => {
				if (vote) {
					const currentVote = {
						delegatedVotingPower: vote?.parentVote.delegatedVotingPower || '0',
						isDelegated: vote?.isDelegated,
						proposalType: vote?.proposal?.type,
						selfVotingPower: vote?.parentVote?.selfVotingPower || '0',
						...vote
					} as IVoteHistory;
					delete currentVote.parentVote;
					res.votes.push(currentVote);
				}
			});
		}
		return {
			data: JSON.parse(JSON.stringify(res)),
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
}

async function handler(req: NextApiRequest, res: NextApiResponse<IVotesHistoryResponse | MessageType>) {
	storeApiKeyUsage(req);

	const { listingLimit = LISTING_LIMIT, page = 1, voterAddress, proposalType, proposalIndex } = req.body;

	const network = String(req.headers['x-network']);

	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const { data, error, status } = await getVotesHistory({
		listingLimit,
		network,
		page,
		proposalIndex: Number(proposalIndex),
		proposalType,
		voterAddress
	});

	if (error || !data) {
		return res.status(status).json({ message: error || messages.API_FETCH_ERROR });
	} else {
		return res.status(status).json(data);
	}
}

export default withErrorHandling(handler);
