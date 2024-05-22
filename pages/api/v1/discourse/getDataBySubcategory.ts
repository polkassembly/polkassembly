// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
// API Handlers
import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch'; // Ensure fetch is imported if running on server-side in Node environment
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import messages from '~src/auth/utils/messages';
import { IForumData } from '~src/components/ForumDiscussions/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';

type ApiResponse = {
	data: IForumData | null;
	error: string | null;
};
const baseURL = process.env.NEXT_PUBLIC_FORUM_URL;

export const fetchForumSubcategory = async (category: string, subcategory: string, pageNumber: number): Promise<ApiResponse> => {
	const urlMap: Record<string, Record<string, string>> = {
		ecosystem: {
			all: `${baseURL}/c/ecosystem/24/none.json?page=${pageNumber}`,
			digest: `${baseURL}/c/ecosystem/digest/25.json?page=${pageNumber}`
		},
		'polkadot-forum-meta': {
			all: `${baseURL}/c/polkadot-forum-meta/5/none.json?page=${pageNumber}`,
			profiles: `${baseURL}/c/polkadot-forum-meta/profiles/9.json?page=${pageNumber}`,
			suggestions: `${baseURL}/c/polkadot-forum-meta/suggestions/27.json?page=${pageNumber}`
		}
	};

	const categoryUrls = urlMap[category];
	const url = categoryUrls?.[subcategory];

	if (!url) {
		return { data: null, error: 'Invalid category or subcategory' };
	}

	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw apiErrorWithStatusCode(messages.API_FETCH_ERROR, 400);
		}
		const responseData: IForumData = (await response.json()) as IForumData;
		return { data: responseData, error: null };
	} catch (error: any) {
		return { data: null, error: error.message || 'Failed to fetch topics' };
	}
};

const handler = async (req: NextApiRequest, res: NextApiResponse<ApiResponse>): Promise<void> => {
	storeApiKeyUsage(req);

	const { page = '0', category, subcategory } = req.query;
	const pageNumber = parseInt(page as string, 10);

	if (typeof category !== 'string' || typeof subcategory !== 'string') {
		return res.status(400).json({
			data: null,
			error: 'Invalid category or subcategory'
		});
	}

	const response = await fetchForumSubcategory(category, subcategory, pageNumber);
	if (!response.data) {
		return res.status(500).json({
			data: null,
			error: 'Failed to fetch'
		});
	}
	return res.status(200).json(response);
};

export default withErrorHandling(handler);
