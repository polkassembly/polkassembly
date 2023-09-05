// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { VOTES_LISTING_LIMIT } from '~src/global/listingLimit';
import { isVotesSortOptionsValid, votesSortValues } from '~src/global/sortOptions';
import {  GET_DELEGATED_CONVICTION_VOTES_LISTING_BY_VOTE_ID } from './query';
import fetchSubsquid from '~src/util/fetchSubsquid';

export interface IVotesResponse {
	yes: {
		count: number;
		votes: any[];
	};
	no: {
		count: number;
		votes: any[];
	};
	abstain: {
		count: number;
		votes: any[];
	};
}

// expects optional id, page, voteType and listingLimit
async function handler (req: NextApiRequest, res: NextApiResponse<IVotesResponse | { error: string }>) {
	const {
		postId = 0,
		page = 1,
		listingLimit = VOTES_LISTING_LIMIT,
		sortBy = votesSortValues.VOTING_POWER_DESC,
		decision,
		type,
		voter } = req.query;

	const network = String(req.headers['x-network']);
	if(!network || !isValidNetwork(network)) {
		res.status(400).json({ error: 'Invalid network in request header' });
	}

	const numListingLimit = Number(listingLimit);
	if (isNaN(numListingLimit)) {
		res.status(400).json({ error: `The listingLimit "${listingLimit}" is invalid.` });
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

	const getOrderBy = (sortByValue:string) => {
		switch (sortByValue){
		case votesSortValues.BALANCE_ASC:
			return ['balance_value_ASC', 'id_ASC'];
		case votesSortValues.BALANCE_DESC:
			return ['balance_value_DESC', 'id_DESC'];
		case votesSortValues.CONVICTION_ASC:
			return ['lockPeriod_ASC', 'id_ASC'];
		case votesSortValues.CONVICTION_DESC:
			return ['lockPeriod_DESC', 'id_DESC'];
		case votesSortValues.VOTING_POWER_ASC:
			return ['totalVotingPower_ASC', 'id_ASC'];
		case votesSortValues.VOTING_POWER_DESC:
			return ['totalVotingPower_DESC', 'id_DESC'];
		case votesSortValues.TIME_ASC:
			return ['timestamp_ASC', 'id_ASC'];
		default:
			return ['createdAtBlock_DESC', 'id_DESC'];
		}
	};
	if (!isVotesSortOptionsValid(strSortBy)) {
		return res.status(400).json({ error: `The sortBy "${sortBy}" is invalid.` });
	}
	const variables: any = {
		decision_eq: decision,
		index_eq: Number(postId),
		limit: numListingLimit,
		offset: numListingLimit * (numPage - 1),
		orderBy:getOrderBy(strSortBy),
		type_eq: type,
		voter_eq: voter
	};

	const votesQuery = GET_DELEGATED_CONVICTION_VOTES_LISTING_BY_VOTE_ID;

	const decisions = ['yes', 'no', 'abstain'];

	const promiseResults = await Promise.allSettled(decisions.map((decision) => {
		variables['decision_eq'] = decision;
		return fetchSubsquid({
			network,
			query: votesQuery,
			variables
		});
	}));

	const resObj: IVotesResponse = {
		abstain: {
			count: 0,
			votes: []
		},
		no: {
			count: 0,
			votes: []
		},
		yes: {
			count: 0,
			votes: []
		}
	};

	promiseResults.forEach((result, i) => {
		const decision = i === 0? 'yes': i === 1? 'no': 'abstain';
		if (result && result.status === 'fulfilled' && result.value) {
			const subsquidData = result.value?.data;
			resObj[decision].votes = subsquidData?.convictionVotes?.[0]?.delegatedVotes;
			resObj[decision].count = subsquidData?.convictionVotesConnection?.totalCount;
		}
	});
	res.status(200).json(resObj);
}

export default withErrorHandling(handler);