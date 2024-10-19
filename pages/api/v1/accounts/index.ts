// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler } from 'next';
import fetch from 'node-fetch';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import messages from '~src/auth/utils/messages';
import { subscanApiHeaders } from '~src/global/apiHeaders';

interface GetAccountsResponse {
	data: any | null;
	error: string | null;
	status: number;
}

export const getAccountsFromAddress = async ({ address, network }: { address: string; network: string }): Promise<GetAccountsResponse> => {
	try {
		const apiUrl: string = `https://${network}.api.subscan.io/api/v2/scan/search`;

		if (!apiUrl) {
			return {
				data: null,
				error: 'API endpoint is not defined',
				status: 500
			};
		}

		const response = await fetch(apiUrl, {
			body: JSON.stringify({ key: address }),
			headers: subscanApiHeaders,
			method: 'POST'
		});

		if (!response.ok) {
			throw new Error(`Error fetching account data: ${response.statusText}`);
		}

		const data = await response.json();

		return {
			data,
			error: null,
			status: 200
		};
	} catch (error) {
		console.error('Error in getAccountsFromAddress:', error);
		return {
			data: null,
			error: (error as Error).message,
			status: 500
		};
	}
};

const handler: NextApiHandler = async (req, res) => {
	storeApiKeyUsage(req);

	const { address } = req.body;

	const network = String(req.headers['x-network']);

	if (!network || !isValidNetwork(network)) {
		return res.status(400).json({ message: messages.INVALID_NETWORK });
	}
	if (!address || typeof address !== 'string') {
		return res.status(400).json({ message: messages.INVALID_PARAMS });
	}

	const { data, error, status } = await getAccountsFromAddress({ address, network });

	if (error || !data) {
		return res.status(status).json({ message: error || messages.API_FETCH_ERROR });
	} else {
		return res.status(status).json(data);
	}
};

export default withErrorHandling(handler);
