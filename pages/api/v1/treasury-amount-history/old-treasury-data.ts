// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { subscanApiHeaders } from '~src/global/apiHeaders';
import { chainProperties } from '~src/global/networkConstants';
import messages from '~src/auth/utils/messages';
import { NextApiRequest, NextApiResponse } from 'next';
import dayjs from 'dayjs';
import 'dayjs/locale/en-gb';

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
	const today = dayjs();
	let startDate = today.subtract(monthsAgo, 'month').startOf('month');

	if (startDate.isAfter(today)) {
		startDate = today.subtract(monthsAgo + 1, 'month').startOf('month');
	}

	const endDate = today.isBefore(startDate.add(1, 'month')) ? today : startDate.add(1, 'month').subtract(1, 'day');
	const start = startDate.format('YYYY-MM-DD');
	const end = endDate.format('YYYY-MM-DD');
	return { start, end };
}

// Helper function to format date as "year-monthName" using dayjs
const formatDate = (date: dayjs.Dayjs): string => {
	return date.format('YYYY-MMMM');
};

// Aggregate and sum balances
const aggregateBalances = (data1: IResponseData[], data2: IResponseData[]): IResponseData[] => {
	const aggregated: { [key: string]: number } = {};

	const addToAggregated = (data: IResponseData[]) => {
		data.forEach(({ history }) => {
			if (history) {
				history.forEach(({ date, balance }) => {
					const key = formatDate(dayjs(date));
					const balanceValue = parseFloat(balance) || 0;

					if (aggregated[key]) {
						aggregated[key] += balanceValue;
					} else {
						aggregated[key] = balanceValue;
					}
				});
			}
		});
	};

	addToAggregated(data1);
	addToAggregated(data2);

	// Convert aggregated result to the expected format
	return Object.keys(aggregated).map((date) => ({
		history: [
			{
				date,
				balance: aggregated[date].toFixed(2)
			}
		],
		status: 'Success'
	}));
};

export const getAssetHubPolkadotBalance = async (network: string, address: string, apiUrl: string): Promise<IReturnResponse> => {
	const returnResponse: IReturnResponse = {
		data: null,
		error: null
	};

	if (!network) {
		returnResponse.error = messages.INVALID_NETWORK;
		return returnResponse;
	}

	try {
		const results: IResponseData[] = [];
		for (let i = 0; i < 7; i++) {
			const { start, end } = getMonthRange(i);
			console.log('Start is', start, end);

			const requestBody = {
				address,
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
		console.log('RESPONSE', returnResponse);

		return returnResponse;
	} catch (error) {
		returnResponse.error = error instanceof Error ? error.message : 'Data Not Available';
		return returnResponse;
	}
};

export const getCombinedBalances = async (network: string): Promise<IReturnResponse> => {
	const address1 = chainProperties[network]?.assetHubAddress;
	const apiUrl1 = `${chainProperties[network]?.assethubExternalLinks}/api/scan/account/balance_history`;

	const address2 = chainProperties[network]?.treasuryAddress;
	const apiUrl2 = `${chainProperties[network]?.externalLinks}/api/scan/account/balance_history`;

	if (!address1 || !apiUrl1 || !address2 || !apiUrl2) {
		return {
			data: null,
			error: 'Missing address or API URL for the given network'
		};
	}

	const response1 = await getAssetHubPolkadotBalance(network, address1, apiUrl1);
	console.log('response1', response1);

	const response2 = await getAssetHubPolkadotBalance(network, address2, apiUrl2);
	console.log('response2', response2);

	const combinedData = aggregateBalances(response1.data || [], response2.data || []);
	const combinedError = response1.error || response2.error;

	return {
		data: combinedData.length > 0 ? combinedData : null,
		error: combinedError
	};
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

	const response = await getCombinedBalances(network);
	if (response.error) {
		res.status(500).json(response);
	} else {
		res.status(200).json(response);
	}
};

export default withErrorHandling(handler);
