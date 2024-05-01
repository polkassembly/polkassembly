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
	const { page = '0', category } = req.query;
	const pageNumber = parseInt(page as string);
	console.log('CATEGORY TS', category);

	const categories = (category as string).split(',');

	const subcategoryUrlMap = {
		'ecosystem,digest': `https://forum.polkadot.network/c/ecosystem/digest/25.json?page=${pageNumber}`,
		'polkadot-forum-meta,profiles': `https://forum.polkadot.network/c/polkadot-forum-meta/profiles/9.json?page=${pageNumber}`,
		'polkadot-forum-meta,suggestions': `https://forum.polkadot.network/c/polkadot-forum-meta/suggestions/27.json?page=${pageNumber}`
	};

	const url = subcategoryUrlMap[categories.join(',') as keyof typeof subcategoryUrlMap];
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
