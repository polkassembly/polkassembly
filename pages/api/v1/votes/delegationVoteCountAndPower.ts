// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { voteTypes } from '~src/global/proposalType';
import { GET_DELEGATED_CONVICTION_VOTES_COUNT } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';

export interface IVotesResponse {
	count: number;
	voteCapital: number;
}

async function handler(req: NextApiRequest, res: NextApiResponse<IVotesResponse | { error: string }>) {
	const { postId = 0, decision, type, voter } = req.query;

	if (!String(voter)) {
		return res.status(400).json({ error: `Invalid voter: "${voter}"` });
	}

	const strType = String(type);
	if (!voteTypes.includes(strType)) {
		return res.status(400).json({ error: `The type "${type}" is invalid.` });
	}

	if (!['yes', 'no', 'abstain'].includes(String(decision))) {
		return res.status(400).json({ error: `Invalid voter: "${decision}"` });
	}

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) {
		res.status(400).json({ error: 'Invalid network in request header' });
	}

	const numPostId = Number(postId);
	if (isNaN(numPostId) || numPostId < 0) {
		return res.status(400).json({ error: `The postId "${postId}" is invalid.` });
	}

	const variables: any = {
		decision: decision,
		index_eq: Number(postId),
		type_eq: type,
		voter_eq: voter
	};

	const result = await fetchSubsquid({
		network,
		query: GET_DELEGATED_CONVICTION_VOTES_COUNT,
		variables
	});

	const subsquidData = result?.data;
	console.log(subsquidData);
	const voteCapital = subsquidData?.convictionVotes?.[0]?.delegatedVotes.map((cap: any) => cap?.balance?.value).reduce((a: string, b: string) => Number(a) + Number(b), 0);
	return res.status(200).json({
		count: subsquidData?.convictionDelegatedVotesConnection?.totalCount,
		voteCapital
	});
}

export default withErrorHandling(handler);
