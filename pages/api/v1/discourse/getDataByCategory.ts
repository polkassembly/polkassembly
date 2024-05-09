// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
import type { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType } from '~src/auth/types';
import { ForumData } from '~src/components/ForumDiscussions/types';

type ApiResponse = {
	data: ForumData | null;
	error: string | null;
};

export type CategoryKey = 'polkadot-technology' | 'ambassador-programme' | 'polkadot-forum-meta' | 'ecosystem' | 'governance' | 'uncategorized';
const baseURL = process.env.NEXT_PUBLIC_FORUM_URL;

export const fetchForumCategory = async (category: CategoryKey, pageNumber: number): Promise<ApiResponse> => {
	const categoryUrlMap = {
		'polkadot-technology': `${baseURL}/c/polkadot-technology/6/none.json?page=${pageNumber}`,
		'ambassador-programme': `${baseURL}/c/ambassador-programme/30/none.json?page=${pageNumber}`,
		governance: `${baseURL}/c/governance/11/none.json?page=${pageNumber}`,
		uncategorized: `${baseURL}/c/uncategorized/1/none.json?page=${pageNumber}`,
		'polkadot-forum-meta': `${baseURL}/c/polkadot-forum-meta/5/none.json?page=${pageNumber}`,
		ecosystem: `${baseURL}/c/ecosystem/24/none.json?page=${pageNumber}`
	};
	const url = categoryUrlMap[category];

	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
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

const handler: NextApiHandler<ForumData | MessageType> = async (req, res) => {
	const { page = '0', category } = req.query;
	const pageNumber = parseInt(page as string);
	const categoryKey = category as CategoryKey;

	const { data, error } = await fetchForumCategory(categoryKey, pageNumber);

	if (data) {
		return res.status(200).json(data);
	} else {
		return res.status(500).json({ message: error || 'Topics count not found!' });
	}
};

export default withErrorHandling(handler);
