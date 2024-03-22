// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import { isValidNetwork } from '~src/api-utils';
import { GET_CONVICTION_VOTES_WITH_REMOVED_IS_NULL, GET_TOTAL_CONVICTION_VOTES_COUNT } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { IProfileVoteHistoryRespose } from '../votesHistory/getVotesByVoter';
import { ProposalType, getSubsquidProposalType } from '~src/global/proposalType';

export interface IAllVotesType {
	data: IProfileVoteHistoryRespose[];
	totalCount: number;
}

async function handler(req: NextApiRequest, res: NextApiResponse<IAllVotesType | { error: string }>) {
	storeApiKeyUsage(req);

	const { postId } = req.body;

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) {
		return res.status(400).json({ error: 'Invalid network in request header' });
	}
	if (!['cere', 'equilibrium', 'amplitude', 'pendulum', 'polimec'].includes(network)) {
		return res.status(400).json({ error: 'Invalid network in request header' });
	}

	const numPostId = Number(postId);
	if (isNaN(numPostId) || numPostId < 0) {
		return res.status(400).json({ error: `The postId "${numPostId}" is invalid.` });
	}
	let variables: any = {
		index_eq: postId,
		type_eq: getSubsquidProposalType(ProposalType.REFERENDUMS)
	};

	const subsquidRes = await fetchSubsquid({
		network,
		query: GET_TOTAL_CONVICTION_VOTES_COUNT,
		variables
	});
	const totalCount = subsquidRes?.data?.convictionVotesConnection?.totalCount;

	if (totalCount) {
		variables = {
			...variables,
			limit: totalCount
		};
		const subsquidData = await fetchSubsquid({
			network,
			query: GET_CONVICTION_VOTES_WITH_REMOVED_IS_NULL,
			variables
		});

		return res.status(200).json({ data: subsquidData?.data?.convictionVotes, totalCount });
	} else {
		return res.status(400).json({ error: 'No Votes Found' });
	}
}

export default withErrorHandling(handler);
