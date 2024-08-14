// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { ITreasuryResponseData } from '~src/types';
import { aggregateBalances } from './old-treasury-data';
import { subscanApiHeaders } from '~src/global/apiHeaders';
import { firestore_db } from '~src/services/firebaseInit';
import dayjs from 'dayjs';
import { chainProperties } from '~src/global/networkConstants';
import messages from '~src/auth/utils/messages';

interface IReturnResponse {
	data?: ITreasuryResponseData[] | null;
	error?: null | string;
}

function getPreviousDayRange(): { start: string; end: string } {
	const previousDay = dayjs().subtract(1, 'day');
	const startDate = previousDay.startOf('day');
	const endDate = previousDay.endOf('day');

	const start = startDate.format('YYYY-MM-DD');
	const end = endDate.format('YYYY-MM-DD');
	return { start, end };
}

const getAssetHubAndNetworkBalance = async (network: string, address: string, apiUrl: string): Promise<IReturnResponse> => {
	const { start, end } = getPreviousDayRange();

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
			const responseData: ITreasuryResponseData = data?.data as ITreasuryResponseData;
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

const saveToFirestore = async (network: string, data: { [key: string]: number }) => {
	try {
		const networkRef = firestore_db.collection('networks').doc(network);

		const previousDay = dayjs().subtract(1, 'day');

		const doc = await networkRef.get();

		if (doc.exists) {
			const docData = doc.data();
			const createdAt = docData?.daily_treasury_tally?.created_at;

			if (createdAt) {
				const createdAtDate = dayjs(createdAt.toDate());

				if (createdAtDate.isAfter(previousDay)) {
					return;
				}
			}
		}

		const balance = Object.values(data).reduce((sum, val) => sum + val, 0);

		await networkRef.set(
			{
				daily_treasury_tally: {
					created_at: new Date(),
					balance
				}
			},
			{ merge: true }
		);
		return;
	} catch (error) {
		console.error('Error writing data to Firestore:', error);
	}
};

const getCombinedBalances = async (network: string): Promise<IReturnResponse> => {
	try {
		const networkRef = firestore_db.collection('networks').doc(network);

		// Checking if the existing data is more than one day old
		const doc = await networkRef.get();
		if (doc.exists) {
			const docData = doc.data();
			const createdAt = docData?.daily_treasury_tally?.created_at;

			if (createdAt) {
				const createdAtDate = dayjs(createdAt.toDate());
				const oneDayAgo = dayjs().subtract(1, 'day');

				if (createdAtDate.isAfter(oneDayAgo)) {
					return {
						data: [{ history: null, status: 'Data is up to date' }],
						error: null
					};
				}
			}
		}

		// Calling API  if data is more than 1 day old or does not exist
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

		const response1 = await getAssetHubAndNetworkBalance(network, address1, apiUrl1);
		const response2 = await getAssetHubAndNetworkBalance(network, address2, apiUrl2);

		const combinedData = aggregateBalances(response1.data || [], response2.data || []);
		const combinedError = response1.error || response2.error;

		await saveToFirestore(network, combinedData);

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
