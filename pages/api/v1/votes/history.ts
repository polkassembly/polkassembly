// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isProposalTypeValid, isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
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
import { network as AllNetworks } from '~src/global/networkConstants';
import { LISTING_LIMIT } from '~src/global/listingLimit';

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
	delegatedVotes?: Array<any>;
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
			throw apiErrorWithStatusCode(`Invalid address ${voterAddress}.`, 400);
		}
		const numPage = Number(page);

		if (isNaN(Number(proposalIndex))) {
			throw apiErrorWithStatusCode(`No proposal found for "${proposalIndex}." .`, 400);
		}
		if (!isProposalTypeValid(String(proposalType))) {
			throw apiErrorWithStatusCode(`Invalid proposal type "${proposalType}." .`, 400);
		}

		let query = VOTING_HISTORY_BY_VOTER_ADDRESS;

		if ([AllNetworks.MOONBEAM, AllNetworks.MOONBASE, AllNetworks.MOONRIVER].includes(network)) {
			query = VOTING_HISTORY_BY_VOTER_ADDRESS_MOONBEAM;
		}

		const variables = {
			index_eq: Number(proposalIndex),
			limit: Number(listingLimit),
			offset: Number(listingLimit) * (numPage - 1),
			type_eq: getSubsquidProposalType(proposalType as any),
			voter_eq: String(voterAddress)
		};

		if (proposalType === ProposalType.REFERENDUM_V2) {
			if (![AllNetworks.MOONBEAM, AllNetworks.MOONBASE, AllNetworks.MOONRIVER].includes(network)) {
				query = CONVICTION_VOTING_HISTORY_BY_VOTER_ADDRESS_AND_PROPOSAL_TYPE_AND_PROPOSAL_INDEX;
			}
		} else {
			if (network === AllNetworks.MOONBEAM) {
				query = MOONBEAM_VOTING_HISTORY_BY_VOTER_ADDRESS_AND_PROPOSAL_TYPE_AND_PROPOSAL_INDEX;
			} else {
				query = VOTING_HISTORY_BY_VOTER_ADDRESS_AND_PROPOSAL_TYPE_AND_PROPOSAL_INDEX;
			}
		}

		const subsquidRes = await fetchSubsquid({
			network,
			query,
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
					const currentVote = {
						isDelegated: vote?.isDelegated || vote?.delegatedVotes ? vote?.delegatedVotes?.length > 0 : false,
						proposalType: vote?.proposal?.type,
						...vote
					} as IVoteHistory;
					delete currentVote.delegatedVotes;
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
