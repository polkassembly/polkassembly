// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import fetchWithTimeout from '~src/api-utils/timeoutFetch';
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

		const data = await (
			await fetchWithTimeout(apiUrl, {
				body: JSON.stringify({ key: address }),
				headers: subscanApiHeaders,
				method: 'POST',
				timeout: 10000
			})
		).json();

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
	if (!address || typeof address !== 'string' || address == '') {
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
