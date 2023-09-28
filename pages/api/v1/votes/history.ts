// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isProposalTypeValid, isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import { VOTES_LISTING_LIMIT } from '~src/global/listingLimit';
import { ProposalType, TSubsquidProposalType, VoteType, getSubsquidProposalType } from '~src/global/proposalType';
import {
	CONVICTION_VOTING_HISTORY_BY_VOTER_ADDRESS_AND_PROPOSAL_TYPE_AND_PROPOSAL_INDEX,
	MOONBEAM_VOTING_HISTORY_BY_VOTER_ADDRESS_AND_PROPOSAL_TYPE_AND_PROPOSAL_INDEX,
	VOTING_HISTORY_BY_VOTER_ADDRESS,
	VOTING_HISTORY_BY_VOTER_ADDRESS_AND_PROPOSAL_TYPE_AND_PROPOSAL_INDEX,
	VOTING_HISTORY_BY_VOTER_ADDRESS_MOONBEAM
} from '~src/queries';
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
	timestamp?: string | undefined;
	decision: EDecision;
	type: VoteType;
	blockNumber: number;
	index: number;
	proposalType: TSubsquidProposalType;
	balance?: {
		value?: string;
		nay?: string;
		aye?: string;
		abstain?: string;
	};
	createdAt?: string;
	createdAtBlock?: number;
	lockPeriod?: string;
	isDelegated?: boolean;
	removedAtBlock?: null | number;
	removedAt?: null | string;
	voter?: string;
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
	proposalType?: ProposalType | string | string[];
	proposalIndex?: string | string[] | number;
}
export async function getVotesHistory(params: IGetVotesHistoryParams): Promise<IApiResponse<IVotesHistoryResponse>> {
	try {
		const { voterAddress, network, listingLimit, page, proposalIndex, proposalType } = params;
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

		let query = network === 'moonbeam' ? VOTING_HISTORY_BY_VOTER_ADDRESS_MOONBEAM : VOTING_HISTORY_BY_VOTER_ADDRESS;
		let variables: any = {
			limit: numListingLimit,
			offset: numListingLimit * (numPage - 1),
			voter_eq: String(voterAddress)
		};

		if (typeof proposalType === 'string' && isProposalTypeValid(proposalType) && (proposalIndex || proposalIndex === 0) && !isNaN(Number(proposalIndex))) {
			variables = {
				...variables,
				index_eq: Number(proposalIndex),
				type_eq: getSubsquidProposalType(proposalType as any)
			};
			if (proposalType === ProposalType.REFERENDUM_V2 || proposalType === ProposalType.REFERENDUMS) {
				query = CONVICTION_VOTING_HISTORY_BY_VOTER_ADDRESS_AND_PROPOSAL_TYPE_AND_PROPOSAL_INDEX;
			} else {
				if (network === 'moonbeam') {
					query = MOONBEAM_VOTING_HISTORY_BY_VOTER_ADDRESS_AND_PROPOSAL_TYPE_AND_PROPOSAL_INDEX;
				} else {
					query = VOTING_HISTORY_BY_VOTER_ADDRESS_AND_PROPOSAL_TYPE_AND_PROPOSAL_INDEX;
				}
			}
		}
		const subsquidRes = await fetchSubsquid({
			network,
			query: query,
			variables: variables
		});
		const subsquidData = subsquidRes?.data;
		const isDataAbsent = proposalType === ProposalType.REFERENDUM_V2 ? !subsquidData?.convictionVotes : !subsquidData?.votes;
		if (!subsquidData || isDataAbsent) {
			throw apiErrorWithStatusCode(`Votes history of voter "${voterAddress}" is not found.`, 404);
		}

		const votes = proposalType === ProposalType.REFERENDUM_V2 ? subsquidData?.convictionVotes : subsquidData?.votes;
		const res: IVotesHistoryResponse = {
			count: 0,
			votes: []
		};
		const count = proposalType === ProposalType.REFERENDUM_V2 ? subsquidData?.convictionVotesConnection?.totalCount : subsquidData?.votesConnection?.totalCount;
		const numCount = Number(count);
		if (!isNaN(numCount)) {
			res.count = numCount;
		}
		if (votes && Array.isArray(votes)) {
			votes.forEach((vote) => {
				if (vote) {
					res.votes.push({
						proposalType: vote?.proposal?.type,
						...vote
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
async function handler(req: NextApiRequest, res: NextApiResponse<IVotesHistoryResponse | MessageType>) {
	const { listingLimit = VOTES_LISTING_LIMIT, page = 0, voterAddress, proposalType, proposalIndex } = req.query;

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });
	const { data, error, status } = await getVotesHistory({
		listingLimit,
		network,
		page,
		proposalIndex,
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
