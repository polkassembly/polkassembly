// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { VoteType, voteTypes } from '~src/global/proposalType';
import { GET_ALL_NESTED_VOTES } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';

async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'GET') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	const { postId, voteType = VoteType.REFERENDUM_V2 } = req.query;

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

	const variables = {
		index_eq: numPostId,
		type_eq: voteType
	};

	const subsqidResponse = await fetchSubsquid({
		network,
		query: GET_ALL_NESTED_VOTES,
		variables
	});

	const allVotes = subsqidResponse?.data?.convictionVotes || [];
	const totalCount = subsqidResponse?.data?.convictionVotesConnection?.totalCount || 0;

	const result = {
		totalCount: totalCount || 0,
		votes: allVotes?.map((vote: any) => ({
			balance: vote?.balance?.value || vote?.balance?.abstain || '0',
			createdAt: vote?.createdAt,
			decision: vote?.decision || null,
			delegatedTo: vote?.delegatedTo || '',
			delegatedVotes:
				vote?.delegatedVotes?.map((delegatedVote: any) => ({
					balance: delegatedVote?.balance?.value || delegatedVote?.balance?.abstain || '0',
					createdAt: delegatedVote?.createdAt,
					decision: delegatedVote?.decision || null,
					delegatedTo: delegatedVote?.delegatedTo || '',
					delegatedVotingPower: '0',
					extrinsicIndex: delegatedVote?.extrinsicIndex,
					isDelegatedVote: true,
					lockPeriod: Number(delegatedVote?.lockPeriod) || 0.1,
					selfVotingPower: delegatedVote?.votingPower || '0',
					voter: delegatedVote?.voter
				})) || [],
			delegatedVotingPower: vote?.delegatedVotingPower || '0',
			extrinsicIndex: vote?.extrinsicIndex,
			isDelegatedVote: false,
			lockPeriod: Number(vote?.lockPeriod) || 0.1,
			selfVotingPower: vote?.selfVotingPower || '0',
			voter: vote?.voter
		}))
	};

	return res.status(200).json(result);
}

export default withErrorHandling(handler);
