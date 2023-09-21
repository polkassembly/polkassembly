// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { VOTES_LISTING_LIMIT } from '~src/global/listingLimit';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { votesSortValues } from '~src/global/sortOptions';
import { GET_DELEGATED_CONVICTION_VOTES_LISTING_BY_VOTE_ID } from '~src/queries';
import { getOrderBy } from './utils/votesSorted';
import { voteTypes } from '~src/global/proposalType';

export interface IVotesResponse {
	count: number;
	votes: any[];
}

// expects optional id, page, voteType and listingLimit
async function handler(req: NextApiRequest, res: NextApiResponse<IVotesResponse | { error: string }>) {
	const { postId = 0, page = 1, listingLimit = VOTES_LISTING_LIMIT, decision, type, voter, sortBy = votesSortValues.VOTING_POWER_DESC } = req.query;

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) {
		return res.status(400).json({ error: 'Invalid network in request header' });
	}

	const numListingLimit = Number(listingLimit);
	if (isNaN(numListingLimit)) {
		return res.status(400).json({ error: `The listingLimit "${listingLimit}" is invalid.` });
	}

	const numPage = Number(page);
	if (isNaN(numPage) || numPage <= 0) {
		return res.status(400).json({ error: `The page "${page}" is invalid.` });
	}

	const numPostId = Number(postId);
	if (isNaN(numPostId) || numPostId < 0) {
		return res.status(400).json({ error: `The postId "${postId}" is invalid.` });
	}

	const strSortBy = String(sortBy);

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

	const variables: any = {
		decision: decision,
		index_eq: Number(postId),
		limit: numListingLimit,
		offset: numListingLimit * (numPage - 1),
		orderBy: getOrderBy(strSortBy, false, true),
		type_eq: type,
		voter_eq: voter
	};

	const votesQuery = GET_DELEGATED_CONVICTION_VOTES_LISTING_BY_VOTE_ID;

	const result = await fetchSubsquid({
		network,
		query: votesQuery,
		variables
	});

	const subsquidData = result?.data;
	res.status(200).json({
		count: subsquidData?.convictionDelegatedVotesConnection?.totalCount,
		votes: subsquidData?.convictionVotes?.[0]?.delegatedVotes
	});
}

export default withErrorHandling(handler);
