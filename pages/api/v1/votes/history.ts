// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import { VOTES_LISTING_LIMIT } from '~src/global/listingLimit';
import { TSubsquidProposalType, VoteType } from '~src/global/proposalType';
import { VOTING_HISTORY_BY_VOTER_ADDRESS, VOTING_HISTORY_BY_VOTER_ADDRESS_MOONBEAM } from '~src/queries';
import { IApiResponse } from '~src/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import fetchSubsquid from '~src/util/fetchSubsquid';
import messages from '~src/util/messages';

export enum EDecision {
    YES = 'yes',
    NO = 'no',
    ABSTAIN = 'abstain'
}

export interface IVoteHistory {
    decision: EDecision;
    type: VoteType;
    blockNumber: number;
    index: number;
    proposalType: TSubsquidProposalType;
}

export interface IVotesHistoryResponse {
	count: number;
	votes: IVoteHistory[];
}
export interface IGetVotesHistoryParams {
    network: string;
    listingLimit?: string | string[] | number;
    page?: string | string[] | number;
    voterAddress?: string | string[];
}
export async function getVotesHistory(params: IGetVotesHistoryParams): Promise<IApiResponse<IVotesHistoryResponse>> {
	try {
		const { voterAddress, network, listingLimit, page } = params;
		if (!voterAddress) {
			throw apiErrorWithStatusCode(`Voter address ${voterAddress} can't be empty`, 400);
		}

		const numListingLimit = Number(listingLimit);
		if (isNaN(numListingLimit)) {
			throw apiErrorWithStatusCode(`The listingLimit "${listingLimit}" is invalid.`, 400);
		}

		const numPage = Number(page);
		if (isNaN(numPage) || numPage <= 0) {
			throw apiErrorWithStatusCode(`The page "${page}" is invalid.`, 400);
		}

		const subsquidRes = await fetchSubsquid({
			network,
			query: network === 'moonbeam' ? VOTING_HISTORY_BY_VOTER_ADDRESS_MOONBEAM : VOTING_HISTORY_BY_VOTER_ADDRESS,
			variables: {
				limit: numListingLimit,
				offset: numListingLimit * (numPage - 1),
				voter_eq: String(voterAddress)
			}
		});
		const subsquidData = subsquidRes?.data;
		if (!subsquidData || !subsquidData?.votes) {
			throw apiErrorWithStatusCode(`Votes history of voter "${voterAddress}" is not found.`, 404);
		}

		const votes = subsquidData.votes;
		const res: IVotesHistoryResponse = {
			count: 0,
			votes: []
		};
		const numCount = Number(subsquidData?.votesConnection?.totalCount);
		if (!isNaN(numCount)) {
			res.count = numCount;
		}
		if (votes && Array.isArray(votes)) {
			votes.forEach((vote) => {
				if (vote) {
					res.votes.push({
						blockNumber: vote.blockNumber,
						decision: vote.decision,
						index: vote?.proposal?.index,
						proposalType: vote?.proposal?.type,
						type: vote.type
					} as IVoteHistory);
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
async function handler (req: NextApiRequest, res: NextApiResponse<IVotesHistoryResponse | MessageType>) {
	const { listingLimit = VOTES_LISTING_LIMIT, page = 0, voterAddress } = req.query;

	const network = String(req.headers['x-network']);
	if(!network || !isValidNetwork(network)) res.status(400).json({ message: 'Invalid network in request header' });
	const { data, error, status } = await getVotesHistory({
		listingLimit,
		network,
		page,
		voterAddress
	});

	if(error || !data) {
		res.status(status).json({ message: error || messages.API_FETCH_ERROR });
	}else {
		res.status(status).json(data);
	}
}

export default withErrorHandling(handler);