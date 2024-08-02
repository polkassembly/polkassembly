// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { subscanApiHeaders } from '~src/global/apiHeaders';
import { chainProperties } from '~src/global/networkConstants';
import { network as AllNetworks } from '~src/global/networkConstants';
import messages from '~src/auth/utils/messages';
import { NextApiRequest, NextApiResponse } from 'next';

interface IHistoryItem {
	date: string;
	balance: string;
}

interface IResponseData {
	history: IHistoryItem[] | null;
	status: string;
}

interface IReturnResponse {
	data?: IResponseData[] | null;
	error?: null | string;
}

function getMonthRange(monthsAgo: number): { start: string; end: string } {
	const today = new Date();
	const startDate = new Date(today.getFullYear(), today.getMonth() - monthsAgo, 1);
	const start = startDate.toISOString().split('T')[0];
	const end = new Date(today.getFullYear(), today.getMonth() - monthsAgo + 1, 0).toISOString().split('T')[0];

	return { start, end };
}

export const getAssetHubPolkadotBalance = async (network: string): Promise<IReturnResponse> => {
	const returnResponse: IReturnResponse = {
		data: null,
		error: null
	};

	if (!network || !(network in chainProperties)) {
		returnResponse.error = messages.INVALID_NETWORK;
		return returnResponse;
	}

	const apiUrl = `${chainProperties[network]?.assethubExternalLinks}/api/scan/account/balance_history`;

	try {
		const results: IResponseData[] = [];
		for (let i = 0; i < 7; i++) {
			const { start, end } = getMonthRange(i);

			const requestBody = {
				address: chainProperties[network]?.assetHubAddress,
				end,
				start
			};

			const response = await fetch(apiUrl, {
				body: JSON.stringify(requestBody),
				headers: subscanApiHeaders,
				method: 'POST'
			});

			if (!response.ok) {
				throw new Error(messages.API_FETCH_ERROR);
			}

			const data = await response.json();

			if (data?.message === 'Success') {
				const responseData: IResponseData = data?.data as IResponseData;
				if (responseData.history === null) {
					responseData.history = [{ date: start, balance: '0' }];
				}
				results.push(responseData);
			} else {
				returnResponse.error = messages.API_FETCH_ERROR;
				break;
			}
		}

		returnResponse.data = results.length > 0 ? results : null;
		return returnResponse;
	} catch (error) {
		returnResponse.error = error instanceof Error ? error.message : 'Data Not Available';
		return returnResponse;
	}
};

const handler = async (req: NextApiRequest, res: NextApiResponse<IReturnResponse>): Promise<void> => {
	storeApiKeyUsage(req);

	const { network } = req.body;

	if (typeof network !== 'string') {
		res.status(400).json({
			data: null,
			error: 'Invalid network'
		});
		return;
	}

	const response = await getAssetHubPolkadotBalance(network);
	if (response.error) {
		res.status(500).json(response);
	} else {
		res.status(200).json(response);
	}
};

export default withErrorHandling(handler);
