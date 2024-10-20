// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import messages from '~src/util/messages';

type ErrorResponse = {
	error: string;
};

const handler = async (req: NextApiRequest, res: NextApiResponse<any | ErrorResponse>) => {
	storeApiKeyUsage(req);
	try {
		const apiURL: string | undefined = process.env.TOKEN_PRICE_API_KEY;
		if (!apiURL) {
			return res.status(400).json({ error: 'API URL is not valid' });
		}

		const response = await fetch(apiURL);

		if (!response.ok) {
			return res.status(response.status).json({ error: messages.API_FETCH_ERROR });
		}

		const data = await response.json();

		res.status(200).json(data);
	} catch (error) {
		res.status(500).json({ error: 'Internal Server Error' });
	}
};

export default withErrorHandling(handler);
