// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import messages from '~src/auth/utils/messages';
import { subscanApiHeaders } from '~src/global/apiHeaders';
import { chainProperties } from '~src/global/networkConstants';

interface ITreasuryResponseData {
	balance: number;
}

interface IMythTokenBalanceResponse {
	data?: {
		balance: number;
	};
	error?: string | null;
}

const getMythTokenBalance = async (address: string, apiUrl: string): Promise<IMythTokenBalanceResponse> => {
	if (!address || !apiUrl) {
		return { error: messages.INVALID_PARAMS };
	}

	try {
		const response = await fetch(apiUrl, {
			body: JSON.stringify({ address }),
			headers: subscanApiHeaders,
			method: 'POST'
		});

		if (!response.ok) {
			throw new Error(messages.API_FETCH_ERROR);
		}

		const data = await response.json();
		const responseData: ITreasuryResponseData[] = data?.data;

		if (responseData && responseData.length > 0) {
			const balance = responseData[0]?.balance;
			return { data: { balance } };
		} else {
			return { error: 'No data available' };
		}
	} catch (error) {
		return { error: error instanceof Error ? error.message : 'Data Not Available' };
	}
};

const handler = async (req: NextApiRequest, res: NextApiResponse<IMythTokenBalanceResponse>): Promise<void> => {
	storeApiKeyUsage(req);

	const network = req.headers['x-network'] as string;

	if (!isValidNetwork(String(network))) {
		return res.status(400).json({ error: 'Invalid network' });
	}
	const address = chainProperties[network]?.assetHubTreasuryAddress4;
	const apiUrl = `${chainProperties[network]?.assethubExternalLinks}/api/scan/foreignAssets/account/balances`;

	if (!isValidNetwork(network)) {
		return res.status(400).json({ error: 'Missing or invalid network in request headers' });
	}

	if (!address) {
		return res.status(400).json({ error: 'Missing address for the given network' });
	}

	const response = await getMythTokenBalance(address, apiUrl);

	if (response.error) {
		return res.status(500).json(response);
	}

	return res.status(200).json(response);
};

export default withErrorHandling(handler);
