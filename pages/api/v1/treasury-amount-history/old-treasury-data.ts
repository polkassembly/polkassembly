// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import { subscanApiHeaders } from '~src/global/apiHeaders';
import { chainProperties } from '~src/global/networkConstants';
import { network as AllNetworks } from '~src/global/networkConstants';
import messages from '~src/auth/utils/messages';

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

// Helper function to get the date range for the previous months
function getMonthRange(monthsAgo: number): { start: string; end: string } {
	const today = new Date();
	const startDate = new Date(today.getFullYear(), today.getMonth() - monthsAgo, 1);
	const endDate = new Date(today.getFullYear(), today.getMonth() - monthsAgo + 1, 0);

	const start = startDate.toISOString().split('T')[0];
	const end = endDate.toISOString().split('T')[0];

	return { start, end };
}

export default async function getAssetHubPolkadotBalance(): Promise<IReturnResponse> {
	const returnResponse: IReturnResponse = {
		data: null,
		error: null
	};

	const apiUrl = `${chainProperties[AllNetworks.POLKADOT]?.assethubExternalLinks}/api/scan/account/balance_history`;

	try {
		const results: IResponseData[] = [];
		for (let i = 0; i < 7; i++) {
			const { start, end } = getMonthRange(i);

			const requestBody = {
				address: `${chainProperties[AllNetworks.POLKADOT]?.assetHubAddress}`,
				end,
				start
			};

			const response = await fetch(apiUrl, {
				body: JSON.stringify(requestBody),
				headers: subscanApiHeaders,
				method: 'POST'
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			console.log(`Data for ${start} to ${end}:`, data);

			if (data.message === 'Success') {
				// Check if history is null and handle accordingly
				const responseData: IResponseData = data?.data as IResponseData;
				if (responseData.history === null) {
					responseData.history = [{ date: start, balance: '0' }];
				}
				results.push(responseData);
			} else {
				returnResponse.error = `API error: ${data.message}`;
				break;
			}
		}

		returnResponse.data = results.length > 0 ? results : null;
		console.log('results', results);
	} catch (error) {
		returnResponse.error = error instanceof Error ? error.message : 'Assethub Data Not Available';
	}

	return returnResponse;
}
