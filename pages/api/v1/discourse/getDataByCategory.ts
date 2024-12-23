// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
import type { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType } from '~src/auth/types';
import { ForumCategoryKey, IForumData } from '~src/components/ForumDiscussions/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import messages from '~src/util/messages';

type ApiResponse = {
	data: IForumData | null;
	error: string | null;
};

const baseURL = process.env.NEXT_PUBLIC_FORUM_URL;

export const fetchForumCategory = async (category: ForumCategoryKey, pageNumber: number): Promise<ApiResponse> => {
	const categoryUrlMap = {
		[ForumCategoryKey.POLKADOT_TECHNOLOGY]: `${baseURL}/c/polkadot-technology/6/none.json?page=${pageNumber}`,
		[ForumCategoryKey.AMBASSADOR_PROGRAMME]: `${baseURL}/c/ambassador-programme/30/none.json?page=${pageNumber}`,
		[ForumCategoryKey.GOVERNANCE]: `${baseURL}/c/governance/11/none.json?page=${pageNumber}`,
		[ForumCategoryKey.UNCATEGORIZED]: `${baseURL}/c/uncategorized/1/none.json?page=${pageNumber}`,
		[ForumCategoryKey.POLKADOT_FORUM_META]: `${baseURL}/c/polkadot-forum-meta/5/none.json?page=${pageNumber}`,
		[ForumCategoryKey.ECOSYSTEM]: `${baseURL}/c/ecosystem/24/none.json?page=${pageNumber}`
	};
	const url = categoryUrlMap[category];

	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw apiErrorWithStatusCode(messages.API_FETCH_ERROR, 400);
		}
		const responseData = await response.json();
		return {
			data: responseData,
			error: null
		};
	} catch (error: any) {
		return {
			data: null,
			error: error.message || 'Failed to fetch topics'
		};
	}
};

const handler: NextApiHandler<IForumData | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	const { page = '0', category } = req.query;

	const pageNumber = parseInt(page as string);
	const categoryKey = category as ForumCategoryKey;

	if (!Object.values(ForumCategoryKey).includes(categoryKey)) {
		return res.status(400).json({ message: 'Invalid category parameter' });
	}

	if (isNaN(pageNumber) || pageNumber < 0) {
		return res.status(400).json({ message: 'Invalid page parameter' });
	}

	const { data, error } = await fetchForumCategory(categoryKey, pageNumber);

	if (data) {
		return res.status(200).json(data);
	} else {
		return res.status(500).json({ message: error || 'Topics count not found!' });
	}
};

export default withErrorHandling(handler);
