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
import { IHistoryItem, ITreasuryResponseData } from '~src/types';
import { isValidNetwork } from '~src/api-utils';

interface IReturnResponse {
	data?: ITreasuryResponseData[] | null;
	error?: null | string;
}

const lastNMonths = 6;

function getMonthRange(monthsAgo: number): { start: string; end: string } {
	const targetDate = dayjs().subtract(monthsAgo, 'month').set('date', 3);
	const startDate = targetDate.startOf('day');
	const endDate = targetDate.endOf('day');

	return {
		start: startDate.format('YYYY-MM-DD'),
		end: endDate.format('YYYY-MM-DD')
	};
}

const getMonthName = (date: dayjs.Dayjs): string => date.format('MMMM').toLowerCase();

export const aggregateBalances = (data1: ITreasuryResponseData[], data2: ITreasuryResponseData[]): { [key: string]: number } => {
	const getLatestBalance = (history: IHistoryItem[]): number => {
		const sortedHistory = history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
		return parseFloat(sortedHistory[0]?.balance) || 0;
	};

	const combinedData: { [key: string]: number } = {};

	const processTreasuryData = (data: ITreasuryResponseData[]) => {
		data?.forEach(({ history }) => {
			const balanceValue = getLatestBalance(history ?? []);
			if (balanceValue > 0) {
				history?.forEach(({ date }) => {
					const key = getMonthName(dayjs(date));
					combinedData[key] = (combinedData[key] ?? 0) + balanceValue;
				});
			}
		});
	};

	processTreasuryData(data1);
	processTreasuryData(data2);

	return combinedData;
};

const isDataPresentForCurrentMonth = async (network: string): Promise<boolean> => {
	const networkDoc = await firestore_db.collection('networks').doc(network).get();
	const currentMonth = dayjs().format('MMMM').toLowerCase();

	return !!networkDoc.exists && currentMonth in (networkDoc.data()?.monthly_treasury_tally ?? {});
};

export const getAssetHubAndNetworkBalance = async (network: string, address: string, apiUrl: string): Promise<IReturnResponse> => {
	const returnResponse: IReturnResponse = {};

	if (!network) {
		returnResponse.error = messages.INVALID_NETWORK;
		return returnResponse;
	}

	try {
		const dataPoints: ITreasuryResponseData[] = [];

		for (let monthsAgo = 0; monthsAgo <= lastNMonths; monthsAgo++) {
			const { start, end } = getMonthRange(monthsAgo);

			const response = await fetch(apiUrl, {
				body: JSON.stringify({ address, start, end }),
				headers: subscanApiHeaders,
				method: 'POST'
			});

			if (!response.ok) {
				throw new Error(messages.API_FETCH_ERROR);
			}

			const data = await response.json();
			const responseData: ITreasuryResponseData = data?.data as ITreasuryResponseData;

			if (data?.message === 'Success') {
				if (!responseData.history) {
					responseData.history = [{ date: start, balance: '0' }];
				}
				dataPoints.push(responseData);
			} else {
				returnResponse.error = messages.API_FETCH_ERROR;
				return returnResponse;
			}
		}

		returnResponse.data = dataPoints;
		return returnResponse;
	} catch (error) {
		returnResponse.error = error instanceof Error ? error.message : 'Data Not Available';
		return returnResponse;
	}
};

const saveToFirestore = async (network: string, data: { [key: string]: number }) => {
	try {
		await firestore_db.collection('networks').doc(network).set(
			{
				monthly_treasury_tally: data
			},
			{ merge: true }
		);
	} catch (error) {
		console.error('Error writing data to Firestore:', error);
	}
};

export const getCombinedBalances = async (network: string): Promise<IReturnResponse> => {
	try {
		const isCurrentMonthDataPresent = await isDataPresentForCurrentMonth(network);
		const isThirdDayOfMonth = dayjs().date() === 3;

		if (isCurrentMonthDataPresent || !isThirdDayOfMonth) {
			return {
				data: null,
				error: 'Data for the current month is already present'
			};
		}

		const assetHubAddress = chainProperties[network]?.assetHubTreasuryAddress;
		const assetHubExternalLinks = `${chainProperties[network]?.assethubExternalLinks}/api/scan/account/balance_history`;
		const networkTreasuryAddress = chainProperties[network]?.treasuryAddress;
		const subscanLink = `${chainProperties[network]?.externalLinks}/api/scan/account/balance_history`;

		if (!assetHubAddress || !assetHubExternalLinks || !networkTreasuryAddress || !subscanLink) {
			return {
				data: null,
				error: 'Missing address or API URL for the given network'
			};
		}

		const [assetHubResult, networkResult] = await Promise.allSettled([
			getAssetHubAndNetworkBalance(network, assetHubAddress, assetHubExternalLinks),
			getAssetHubAndNetworkBalance(network, networkTreasuryAddress, subscanLink)
		]);

		const assetHubResponse = assetHubResult.status === 'fulfilled' ? assetHubResult.value : { data: null, error: (assetHubResult as PromiseRejectedResult).reason };
		const networkResponse = networkResult.status === 'fulfilled' ? networkResult.value : { data: null, error: (networkResult as PromiseRejectedResult).reason };

		const combinedData = aggregateBalances(assetHubResponse.data ?? [], networkResponse.data ?? []);
		const combinedError = assetHubResponse.error || networkResponse.error;

		await saveToFirestore(network, combinedData);

		return {
			data: combinedData ? [{ history: null, status: 'Success' }] : null,
			error: combinedError ?? null
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

	const network = req.headers['x-network'] as string;

	if (!isValidNetwork(network)) {
		return res.status(400).json({ error: 'Missing or invalid network in request headers' });
	}

	const response = await getCombinedBalances(network);
	res.status(response.error ? 500 : 200).json(response);
};

export default withErrorHandling(handler);
