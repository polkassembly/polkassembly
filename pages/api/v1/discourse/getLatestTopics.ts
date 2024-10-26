// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import { IForumData } from '~src/components/ForumDiscussions/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';

type ApiResponse = {
	data: IForumData | null;
	error: string | null;
};

const baseURL = process.env.NEXT_PUBLIC_FORUM_URL;

export const fetchForumTopics = async ({ pageNumber = 0 }: { pageNumber: number }): Promise<ApiResponse> => {
	const url = `${baseURL}/latest.json?page=${pageNumber}`;
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
			error: `Error fetching forum topics: ${error.message}`
		};
	}
};

const handler: NextApiHandler<IForumData | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	if (req.method !== 'GET')
		return res.status(405).json({
			message: 'Invalid Method Request'
		});

	const { page = '0' } = req.query;
	const pageNumber = parseInt(page as string);
	const { data, error } = await fetchForumTopics({ pageNumber });
	if (data) {
		return res.status(200).json(data);
	} else {
		return res.status(500).json({ message: error || 'Topics count not found!' });
	}
};

export default withErrorHandling(handler);
