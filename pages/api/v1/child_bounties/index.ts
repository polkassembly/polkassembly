// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { VOTES_LISTING_LIMIT } from '~src/global/listingLimit';
import { GET_CHILD_BOUNTIES_BY_PARENT_INDEX } from '~src/queries';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { getSubSquareContentAndTitle } from '../posts/subsqaure/subsquare-content';
import { ProposalType } from '~src/global/proposalType';
import { IChildBountiesResponse } from '~src/types';

// expects optional id, page, voteType and listingLimit
async function handler(req: NextApiRequest, res: NextApiResponse<IChildBountiesResponse | { error: string }>) {
	storeApiKeyUsage(req);

	const { postId = 0, page = 1, listingLimit = VOTES_LISTING_LIMIT } = req.query;

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

	const variables: any = {
		limit: numListingLimit,
		offset: numListingLimit * (numPage - 1),
		parentBountyIndex_eq: numPostId
	};

	const subsquidRes = await fetchSubsquid({
		network,
		query: GET_CHILD_BOUNTIES_BY_PARENT_INDEX,
		variables
	});

	const subsquidData = subsquidRes?.data;
	if (!subsquidData || !subsquidData.proposals || !Array.isArray(subsquidData.proposals) || !subsquidData.proposalsConnection) {
		throw apiErrorWithStatusCode(`Child bounties of bounty index "${postId}" is not found.`, 404);
	}

	const resObj: IChildBountiesResponse = {
		child_bounties: [],
		child_bounties_count: subsquidData?.proposalsConnection?.totalCount || 0
	};

	for (const childBounty of subsquidData.proposals) {
		const subsquireRes = await getSubSquareContentAndTitle(ProposalType.CHILD_BOUNTIES, network, childBounty.index);

		resObj.child_bounties.push({
			description: childBounty.description,
			index: childBounty.index,
			reward: childBounty?.reward,
			status: childBounty.status,
			title: subsquireRes?.title || ''
		});
	}

	return res.status(200).json(resObj);
}

export default withErrorHandling(handler);
