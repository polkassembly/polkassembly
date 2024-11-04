// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';

import fetchWithTimeout from '~src/api-utils/timeoutFetch';

export interface IDataType {
	download_url: string;
	url: string;
	git_url: string;
	html_url: string;
	name: string;
	sha: number;
	size: number;
	type: string;
	_links: {
		self: string;
		git: string;
		html: string;
	};
}

// expects optional id, page, voteType and listingLimit
async function handler(req: NextApiRequest, res: NextApiResponse<IDataType | { message: string | null }>) {
	storeApiKeyUsage(req);

	const { network, postTypeInfo, postType } = req.query;

	const response = await fetchWithTimeout(`https://api.github.com/repos/CoinStudioDOT/OpenGov/contents/${network}/${postType}/${postTypeInfo}`, {
		headers: {
			Accept: 'application/vnd.github.v3+json',
			Authorization: `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
			'X-GitHub-Api-Version': '2022-11-28'
		}
	});
	if (response.ok) {
		const data = await response.json();
		return res.status(200).json(data);
	}

	return res.status(400).json({ message: 'Failed to fetch data from github' });
}

export default withErrorHandling(handler);
