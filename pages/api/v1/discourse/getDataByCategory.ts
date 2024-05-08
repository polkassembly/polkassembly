// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

import type { NextApiRequest, NextApiResponse } from 'next';

type ApiResponse = {
	topics: any[];
};

type ApiError = {
	error: string;
};

type CategoryKey = 'polkadot-technology' | 'ambassador-programme' | 'polkadot-forum-meta' | 'ecosystem' | 'governance' | 'uncategorized';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse | ApiError>): Promise<void> {
	const { page = '0', category } = req.query;
	const pageNumber = parseInt(page as string);

	const categoryUrlMap = {
		'polkadot-technology': `https://forum.polkadot.network/c/polkadot-technology/6/none.json?page=${pageNumber}`,
		'ambassador-programme': `https://forum.polkadot.network/c/ambassador-programme/30/none.json?page=${pageNumber}`,
		governance: `https://forum.polkadot.network/c/governance/11/none.json?page=${pageNumber}`,
		uncategorized: `https://forum.polkadot.network/c/uncategorized/1/none.json?page=${pageNumber}`,
		'polkadot-forum-meta': `https://forum.polkadot.network/c/polkadot-forum-meta/5/none.json?page=${pageNumber}`,
		ecosystem: `https://forum.polkadot.network/c/ecosystem/24/none.json?page=${pageNumber}`
	};
	try {
		const response = await fetch(categoryUrlMap[category as CategoryKey]);
		if (!response.ok) {
			throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
		}
		const data: ApiResponse = await response.json();

		res.status(200).json(data);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
}
