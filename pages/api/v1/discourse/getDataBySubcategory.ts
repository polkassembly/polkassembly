// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';

type ApiResponse = {
	topics: any[];
};

type ApiError = {
	error: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse | ApiError>): Promise<void> {
	const { page = '0', category, subcategory } = req.query;
	const pageNumber = parseInt(page as string);

	const baseUrl = 'https://forum.polkadot.network/c';
	const urlMap = {
		ecosystem: {
			all: `${baseUrl}/ecosystem/24/none.json?page=${pageNumber}`,
			digest: `${baseUrl}/ecosystem/digest/25.json?page=${pageNumber}`
		},
		'polkadot-forum-meta': {
			all: `${baseUrl}/polkadot-forum-meta/5/none.json?page=${pageNumber}`,
			profiles: `${baseUrl}/polkadot-forum-meta/profiles/9.json?page=${pageNumber}`,
			suggestions: `${baseUrl}/polkadot-forum-meta/suggestions/27.json?page=${pageNumber}`
		}
	};

	// Ensure valid category and subcategory inputs
	if (!category || typeof category !== 'string' || !subcategory || typeof subcategory !== 'string') {
		res.status(400).json({ error: 'Invalid category or subcategory' });
		return;
	}

	// Determine the URL based on category and subcategory
	const categoryUrls = urlMap[category as keyof typeof urlMap];
	if (!categoryUrls) {
		res.status(404).json({ error: 'Category not found' });
		return;
	}

	const url = categoryUrls[subcategory as keyof typeof categoryUrls];
	if (!url) {
		res.status(404).json({ error: 'Subcategory not found' });
		return;
	}
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
		}
		const data: ApiResponse = await response.json();

		res.status(200).json(data);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
}
