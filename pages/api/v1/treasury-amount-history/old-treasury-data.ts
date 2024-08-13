// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { subscanApiHeaders } from '~src/global/apiHeaders';
import { chainProperties } from '~src/global/networkConstants';
import messages from '~src/auth/utils/messages';
import { NextApiRequest, NextApiResponse } from 'next';
import dayjs from 'dayjs';
import 'dayjs/locale/en-gb';
import { firestore_db } from '~src/services/firebaseInit';
import { IHistoryItem } from '~src/types';

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
	const startDate = today.subtract(monthsAgo, 'month').set('date', 3); // Set start date to 3nd of the month
	const endDate = startDate.add(1, 'month').subtract(1, 'day');

	const start = startDate.format('YYYY-MM-DD');
	const end = endDate.format('YYYY-MM-DD');
	return { start, end };
}

function getTodayRange(): { start: string; end: string } {
	const today = dayjs();
	const startDate = today.startOf('day');
	const endDate = today.endOf('day');

	const start = startDate.format('YYYY-MM-DD');
	const end = endDate.format('YYYY-MM-DD');
	return { start, end };
}

const getMonthName = (date: dayjs.Dayjs): string => {
	return date.format('MMMM').toLowerCase();
};

const aggregateBalances = (data1: IResponseData[], data2: IResponseData[]): { [key: string]: number } => {
	const getLatestBalance = (history: IHistoryItem[]): number => {
		const sortedHistory = history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
		return parseFloat(sortedHistory[0].balance) || 0;
	};

	const combinedData: { [key: string]: number } = {};

	const filterNonZeroBalances = (data: IResponseData[]) => {
		return data.filter(({ history }) => {
			if (history) {
				const balanceValue = getLatestBalance(history);
				return balanceValue > 0;
			}
			return false;
		});
	};

	const networkTreasuryData = filterNonZeroBalances(data1);
	const assethubTreasuryData = filterNonZeroBalances(data2);

	networkTreasuryData.forEach(({ history }) => {
		if (history) {
			history.forEach(({ date }) => {
				const key = getMonthName(dayjs(date));
				const balanceValue = getLatestBalance(history);

				if (combinedData[key]) {
					combinedData[key] += balanceValue;
				} else {
					combinedData[key] = balanceValue;
				}
			});
		}
	});

	assethubTreasuryData.forEach(({ history }) => {
		if (history) {
			history.forEach(({ date }) => {
				const key = getMonthName(dayjs(date));
				const balanceValue = getLatestBalance(history);

				if (combinedData[key]) {
					combinedData[key] += balanceValue;
				} else {
					combinedData[key] = balanceValue;
				}
			});
		}
	});

	return combinedData;
};

export const getAssetHubAndNetworkBalance = async (network: string, address: string, apiUrl: string, isDaily: boolean = false): Promise<IReturnResponse> => {
	const { start, end } = isDaily ? getTodayRange() : getMonthRange(0);

	const returnResponse: IReturnResponse = {
		data: null,
		error: null
	};

	if (!network) {
		returnResponse.error = messages.INVALID_NETWORK;
		return returnResponse;
	}

	try {
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
			returnResponse.data = [responseData];
		} else {
			returnResponse.error = messages.API_FETCH_ERROR;
		}

		return returnResponse;
	} catch (error) {
		returnResponse.error = error instanceof Error ? error.message : 'Data Not Available';
		return returnResponse;
	}
};

const saveToFirestore = async (network: string, data: { [key: string]: number }, isDaily: boolean = false) => {
	try {
		const networkRef = firestore_db.collection('networks').doc(network);

		if (isDaily) {
			const today = dayjs().format('YYYY-MM-DD');
			const balance = Object.values(data).reduce((sum, val) => sum + val, 0); // Sum all balances
			const dailyRef = networkRef.collection('daily_treasury_tally').doc(today);

			const doc = await dailyRef.get();

			if (doc.exists) {
				console.log('Data for today already exists, skipping update.');
				return;
			} else {
				await dailyRef.set({
					created_at: new Date(),
					balance
				});
			}
		} else {
			await networkRef.set(
				{
					monthly_treasury_tally: data
				},
				{ merge: true }
			);
		}
	} catch (error) {
		console.error('Error writing data to Firestore:', error);
	}
};

export const getCombinedBalances = async (network: string, isDaily: boolean = false): Promise<IReturnResponse> => {
	try {
		const address1 = chainProperties[network]?.assetHubTreasuryAddress;
		const apiUrl1 = `${chainProperties[network]?.assethubExternalLinks}/api/scan/account/balance_history`;

		const address2 = chainProperties[network]?.treasuryAddress;
		const apiUrl2 = `${chainProperties[network]?.externalLinks}/api/scan/account/balance_history`;

		if (!address1 || !apiUrl1 || !address2 || !apiUrl2) {
			return {
				data: null,
				error: 'Missing address or API URL for the given network'
			};
		}

		const response1 = await getAssetHubAndNetworkBalance(network, address1, apiUrl1, isDaily);
		const response2 = await getAssetHubAndNetworkBalance(network, address2, apiUrl2, isDaily);

		const combinedData = aggregateBalances(response1.data || [], response2.data || []);
		const combinedError = response1.error || response2.error;

		await saveToFirestore(network, combinedData, isDaily);

		return {
			data: combinedData ? [{ history: null, status: 'Success' }] : null,
			error: combinedError
		};
	} catch (error) {
		return {
			data: null,
			error: error.message || 'An unexpected error occurred while getting combined balances'
		};
	}
};

const handler = async (req: NextApiRequest, res: NextApiResponse<IReturnResponse>): Promise<void> => {
	storeApiKeyUsage(req);

	const { network, isDaily } = req.body;

	if (typeof network !== 'string') {
		res.status(400).json({
			data: null,
			error: 'Invalid network'
		});
		return;
	}

	const response = await getCombinedBalances(network, isDaily);
	if (response.error) {
		res.status(500).json(response);
	} else {
		res.status(200).json(response);
	}
};

export default withErrorHandling(handler);
