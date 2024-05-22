// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import messages from '~src/auth/utils/messages';
import { IForumDataTopicId } from '~src/components/ForumDiscussions/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';

type ApiResponse = {
	data: IForumDataTopicId | null;
	error: string | null;
};

const baseURL = process.env.NEXT_PUBLIC_FORUM_URL;

export const fetchTopicData = async (slug: string, id: string): Promise<ApiResponse> => {
	const url = `${baseURL}/t/${slug}/${id}.json`;

	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw apiErrorWithStatusCode(messages.API_FETCH_ERROR, 400);
		}
		const responseData: any = await response.json();
		return { data: responseData, error: null };
	} catch (error: any) {
		return { data: null, error: error.message || 'Failed to fetch topics' };
	}
};

const handler = async (req: NextApiRequest, res: NextApiResponse<ApiResponse>): Promise<void> => {
	storeApiKeyUsage(req);

	if (req.method !== 'GET')
		return res.status(405).json({
			data: null,
			error: 'Invalid Method Request'
		});

	const { slug, id } = req.query;

	if (!slug || !id || typeof slug !== 'string' || typeof id !== 'string') {
		return res.status(400).json({ data: null, error: 'Invalid input' });
	}
	if (!/^\d+$/.test(id) || !/^[a-z0-9-]+$/i.test(slug)) {
		return res.status(400).json({ data: null, error: 'Invalid informat' });
	}

	const safeSlug = encodeURIComponent(slug);
	const safeId = encodeURIComponent(id);

	const response = await fetchTopicData(safeSlug, safeId);
	if (!response.data) {
		return res.status(500).json({
			data: null,
			error: 'Failed to fetch'
		});
	}
	return res.status(200).json(response);
};

export default withErrorHandling(handler);
