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
	const { page = '0' } = req.query;
	const pageNumber = parseInt(page as string);
	const url = `https://forum.polkadot.network/latest.json?page=${pageNumber}`;
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
