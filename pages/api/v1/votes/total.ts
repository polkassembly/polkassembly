// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { VoteType, voteTypes } from '~src/global/proposalType';
import { GET_TOTAL_VOTES_FOR_PROPOSAL } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { IProfileVoteHistoryRespose } from '../votesHistory/getVotesByVoter';

export interface IAllVotesType {
	data: IProfileVoteHistoryRespose[];
	totalCount: number;
}
const getIsSwapStatus = (statusHistory: string[]) => {
	const index = statusHistory.findIndex((v: any) => v.status === 'DecisionDepositPlaced');
	if (index >= 0) {
		const decidingIndex = statusHistory.findIndex((v: any) => v.status === 'Deciding');
		if (decidingIndex >= 0) {
			const obj = statusHistory[index];
			statusHistory.splice(index, 1);
			statusHistory.splice(decidingIndex, 0, obj);
			return true;
		}
	}
	return false;
};

async function handler(req: NextApiRequest, res: NextApiResponse<IAllVotesType | { error: string }>) {
	const { postId = 0, voteType = VoteType.REFERENDUM } = req.query;

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) {
		return res.status(400).json({ error: 'Invalid network in request header' });
	}

	const strVoteType = String(voteType);
	if (!voteTypes.includes(strVoteType)) {
		return res.status(400).json({ error: `The voteType "${voteType}" is invalid.` });
	}

	const numPostId = Number(postId);
	if (isNaN(numPostId) || numPostId < 0) {
		return res.status(400).json({ error: `The postId "${postId}" is invalid.` });
	}
	const variables: any = {
		index_eq: numPostId,
		type_eq: voteType
	};

	const query = GET_TOTAL_VOTES_FOR_PROPOSAL;

	const totalVotes = await fetchSubsquid({
		network,
		query,
		variables
	});

	const totalCount = totalVotes['data'].flattenedConvictionVotesConnection.totalCount || 0;
	const voteData: IProfileVoteHistoryRespose[] = totalVotes['data'].flattenedConvictionVotes?.map((vote: any) => {
		const { createdAt, index: id, proposer, statusHistory, type, trackNumber } = vote.proposal;

		let status = vote?.proposal.status;

		const isSwap: boolean = getIsSwapStatus(statusHistory);

		if (isSwap) {
			if (status === 'DecisionDepositPlaced') {
				status = 'Deciding';
			}
		}
		return {
			balance: vote?.balance?.value || vote?.balance?.abstain || '0',
			createdAt: vote?.createdAt,
			decision: vote?.decision || null,
			delegatedTo: vote?.delegatedTo || '',
			delegatedVotingPower: !vote?.isDelegated ? vote.parentVote?.delegatedVotingPower : 0,
			extrinsicIndex: vote?.parentVote?.extrinsicIndex,
			isDelegatedVote: vote?.isDelegated,
			lockPeriod: Number(vote?.lockPeriod) || 0.1,
			proposal: {
				createdAt,
				description: '',
				id,
				proposer,
				status,
				statusHistory,
				title: '',
				trackNumber,
				type
			},
			voter: vote?.voter
		};
	});

	return res.status(200).json({ data: voteData, totalCount });
}

export default withErrorHandling(handler);
