// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { VOTES_LISTING_LIMIT } from '~src/global/listingLimit';
import { VoteType, voteTypes } from '~src/global/proposalType';
import { isVotesSortOptionsValid, votesSortValues } from '~src/global/sortOptions';
import { GET_NESTED_CONVICTION_VOTES_LISTING_BY_TYPE_AND_INDEX } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { getOrderBy } from './utils/votesSorted';
import { isSupportedNestedVoteNetwork } from '~src/components/Post/utils/isSupportedNestedVotes';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import getEncodedAddress from '~src/util/getEncodedAddress';
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

const getAbstainCombineVote = (votes: any[], decision: 'yes' | 'no' | 'abstain') => {
	if (decision == 'abstain') return votes;
	if (decision == 'yes') {
		return votes?.map((vote) => {
			return { ...vote, balance: { value: vote?.balance?.value || vote?.balance?.aye }, decision };
		});
	}
	return votes?.map((vote) => {
		return { ...vote, balance: { value: vote?.balance?.value || vote?.balance?.nay }, decision };
	});
};

// expects optional id, page, voteType and listingLimit
async function handler(req: NextApiRequest, res: NextApiResponse<IVotesResponse | { error: string }>) {
	storeApiKeyUsage(req);

	const { postId = 0, page = 1, voteType = VoteType.REFERENDUM, listingLimit = VOTES_LISTING_LIMIT, sortBy = votesSortValues.TIME_DESC, address } = req.query;

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) {
		return res.status(400).json({ error: 'Invalid network in request header' });
	}

	const numListingLimit = Number(listingLimit);
	if (isNaN(numListingLimit)) {
		return res.status(400).json({ error: `The listingLimit "${listingLimit}" is invalid.` });
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
	const nestedSupported = isSupportedNestedVoteNetwork(network);

	if (!isVotesSortOptionsValid(strSortBy)) {
		return res.status(400).json({ error: `The sortBy "${sortBy}" is invalid.` });
	}
	const variables: any = {
		index_eq: numPostId,
		limit: numListingLimit,
		offset: numListingLimit * (numPage - 1),
		orderBy: getOrderBy(strSortBy, true, nestedSupported),
		type_eq: voteType
	};

	if (!!address && typeof address === 'string' && !!getEncodedAddress(address, network)) {
		variables['voter_eq'] = getEncodedAddress(address, network) || address || '';
	}

	const subsquidRes = await fetchSubsquid({
		network,
		query: GET_NESTED_CONVICTION_VOTES_LISTING_BY_TYPE_AND_INDEX,
		variables: variables
	});
	const subsquidData = subsquidRes?.data || [];

	const resObj: IVotesResponse = {
		abstain: {
			count: subsquidData?.abstainCount?.totalCount || 0,
			votes: subsquidData?.abstain || []
		},
		no: {
			count: subsquidData?.noCount?.totalCount || 0,
			votes: getAbstainCombineVote(subsquidData?.no || [], 'no')
		},
		yes: {
			count: subsquidData?.yesCount?.totalCount || 0,
			votes: getAbstainCombineVote(subsquidData?.yes || [], 'yes')
		}
	};

	return res.status(200).json(resObj);
}

export default withErrorHandling(handler);
