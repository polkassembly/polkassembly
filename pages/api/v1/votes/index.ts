// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { VOTES_LISTING_LIMIT } from '~src/global/listingLimit';
import { VoteType, voteTypes } from '~src/global/proposalType';
import { isVotesSortOptionsValid, votesSortValues } from '~src/global/sortOptions';
import { GET_CONVICTION_VOTES_FOR_ADDRESS_WITH_TXN_HASH_LISTING_BY_TYPE_AND_INDEX, GET_CONVICTION_VOTES_LISTING_BY_TYPE_AND_INDEX, GET_CONVICTION_VOTES_LISTING_FOR_ADDRESS_BY_TYPE_AND_INDEX, GET_CONVICTION_VOTES_WITH_TXN_HASH_LISTING_BY_TYPE_AND_INDEX, GET_VOTES_LISTING_BY_TYPE_AND_INDEX, GET_VOTES_LISTING_BY_TYPE_AND_INDEX_WITH_REMOVED_AT_BLOCK_ISNULL_TRUE, GET_VOTES_LISTING_FOR_ADDRESS_BY_TYPE_AND_INDEX, GET_VOTES_LISTING_FOR_ADDRESS_BY_TYPE_AND_INDEX_WITH_REMOVED_AT_BLOCK_ISNULL_TRUE } from '~src/queries';
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
	const { postId = 0, page = 1, voteType = VoteType.REFERENDUM, listingLimit = VOTES_LISTING_LIMIT, sortBy = votesSortValues.TIME, address } = req.query;

	const network = String(req.headers['x-network']);
	if(!network || !isValidNetwork(network)) {
		res.status(400).json({ error: 'Invalid network in request header' });
	}

	const numListingLimit = Number(listingLimit);
	if (isNaN(numListingLimit)) {
		res.status(400).json({ error: `The listingLimit "${listingLimit}" is invalid.` });
	}

	const strVoteType = String(voteType);
	if (!voteTypes.includes(strVoteType)) {
		return res.status(400).json({ error: `The voteType "${voteType}" is invalid.` });
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
	const isOpenGov = voteType === VoteType.REFERENDUM_V2;
	const isConvinctionSort = strSortBy === votesSortValues.CONVICTION;
	const isBalanceSort = strSortBy === votesSortValues.BALANCE;
	if (!isVotesSortOptionsValid(strSortBy)) {
		return res.status(400).json({ error: `The sortBy "${sortBy}" is invalid.` });
	}
	const variables: any = {
		index_eq: numPostId,
		limit: numListingLimit,
		offset: numListingLimit * (numPage - 1),
		orderBy: isBalanceSort ? ['balance_value_DESC', 'id_DESC'] : isConvinctionSort ? ['lockPeriod_DESC', 'id_DESC'] : isOpenGov ? ['createdAtBlock_DESC', 'id_DESC'] : ['timestamp_DESC', 'id_DESC'],
		type_eq: voteType
	};

	// if ayes count,  votes (decision = 'ays', offset = 0 , limit 10)

	// if nays count,

	let votesQuery = ['moonbeam', 'cere'].includes(network)? GET_VOTES_LISTING_BY_TYPE_AND_INDEX_WITH_REMOVED_AT_BLOCK_ISNULL_TRUE : GET_VOTES_LISTING_BY_TYPE_AND_INDEX;

	if(address) {
		votesQuery = ['moonbeam', 'cere'].includes(network)? GET_VOTES_LISTING_FOR_ADDRESS_BY_TYPE_AND_INDEX_WITH_REMOVED_AT_BLOCK_ISNULL_TRUE : GET_VOTES_LISTING_FOR_ADDRESS_BY_TYPE_AND_INDEX;

		variables['voter_eq'] = address;
	}

	if (voteType === VoteType.REFERENDUM_V2) {
		votesQuery = GET_CONVICTION_VOTES_LISTING_BY_TYPE_AND_INDEX;
		if(address) {
			votesQuery = GET_CONVICTION_VOTES_LISTING_FOR_ADDRESS_BY_TYPE_AND_INDEX;
		}

		if (['moonbase', 'moonriver', 'moonbeam'].includes(network)) {
			votesQuery = GET_CONVICTION_VOTES_WITH_TXN_HASH_LISTING_BY_TYPE_AND_INDEX;
			if(address) {
				votesQuery = GET_CONVICTION_VOTES_FOR_ADDRESS_WITH_TXN_HASH_LISTING_BY_TYPE_AND_INDEX;
			}
		}
	}

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
			resObj[decision].votes = subsquidData?.votes;
			resObj[decision].count = subsquidData?.votesConnection?.totalCount;
			if (voteType === VoteType.REFERENDUM_V2) {
				resObj[decision].votes = subsquidData?.convictionVotes;
				resObj[decision].count = subsquidData?.convictionVotesConnection?.totalCount;
			}
		}
	});
	res.status(200).json(resObj);
}

export default withErrorHandling(handler);