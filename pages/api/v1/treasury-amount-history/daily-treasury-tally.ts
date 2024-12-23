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
import { isValidNetwork } from '~src/api-utils';

interface IReturnResponse {
	data?: ITreasuryResponseData[] | null;
	error?: null | string;
}

function getPreviousDayRange(): { start: string; end: string } {
	const previousDay = dayjs().subtract(1, 'day');
	return {
		start: previousDay.startOf('day').format('YYYY-MM-DD'),
		end: previousDay.endOf('day').format('YYYY-MM-DD')
	};
}

const getAssetHubAndNetworkBalance = async (network: string, address: string, apiUrl: string): Promise<IReturnResponse> => {
	const { start, end } = getPreviousDayRange();

	try {
		const response = await fetch(apiUrl, {
			body: JSON.stringify({ address, start, end }),
			headers: subscanApiHeaders,
			method: 'POST'
		});

		if (!response.ok) {
			throw new Error(messages.API_FETCH_ERROR);
		}

		const data = await response.json();

		if (data?.message === 'Success') {
			const responseData: ITreasuryResponseData = data?.data as ITreasuryResponseData;
			return {
				data: [
					{
						...responseData,
						history: responseData.history ?? [{ date: start, balance: '0' }]
					}
				],
				error: null
			};
		}

		return { data: null, error: messages.API_FETCH_ERROR };
	} catch (error) {
		return { data: null, error: error instanceof Error ? error.message : 'Data Not Available' };
	}
};

const saveToFirestore = async (network: string, data: { [key: string]: number }) => {
	if (!network || !data) return;

	try {
		const networkRef = firestore_db.collection('networks').doc(network);
		const previousDay = dayjs().subtract(1, 'day');
		const doc = await networkRef.get();
		const createdAt = doc.data()?.daily_treasury_tally?.created_at;

		if (createdAt && dayjs(createdAt.toDate()).isAfter(previousDay)) {
			return;
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
	} catch (error) {
		console.error('Error writing data to Firestore:', error);
	}
};

const getCombinedBalances = async (network: string): Promise<IReturnResponse> => {
	if (!network) {
		return { data: null, error: 'Missing network' };
	}

	try {
		const networkRef = firestore_db.collection('networks').doc(network);
		const doc = await networkRef.get();
		const createdAt = doc.data()?.daily_treasury_tally?.created_at;

		if (createdAt && dayjs(createdAt.toDate()).isAfter(dayjs().subtract(1, 'day'))) {
			return { data: [{ history: null, status: 'Data is up to date' }], error: null };
		}

		const assetHubAddress = chainProperties[network]?.assetHubTreasuryAddress;
		const assetHubExternalLinks = `${chainProperties[network]?.assethubExternalLinks}/api/scan/account/balance_history`;
		const networkTreasuryAddress = chainProperties[network]?.treasuryAddress;
		const subscanLink = `${chainProperties[network]?.externalLinks}/api/scan/account/balance_history`;

		if (!assetHubAddress || !assetHubExternalLinks || !networkTreasuryAddress || !subscanLink) {
			return { data: null, error: 'Missing address or API URL for the given network' };
		}

		const [assetHubResult, networkResult] = await Promise.allSettled([
			getAssetHubAndNetworkBalance(network, assetHubAddress, assetHubExternalLinks),
			getAssetHubAndNetworkBalance(network, networkTreasuryAddress, subscanLink)
		]);

		const assetHubResponse = assetHubResult.status === 'fulfilled' ? assetHubResult.value : { data: null, error: assetHubResult.reason };
		const networkResponse = networkResult.status === 'fulfilled' ? networkResult.value : { data: null, error: networkResult.reason };

		const combinedData = assetHubResponse.data && networkResponse.data ? aggregateBalances(assetHubResponse.data, networkResponse.data) : null;

		if (!combinedData) {
			return { data: null, error: assetHubResponse.error ?? networkResponse.error ?? 'Failed to combine balances' };
		}

		await saveToFirestore(network, combinedData);

		return { data: [{ history: null, status: 'Success' }], error: null };
	} catch (error) {
		return { data: null, error: error.message ?? 'An unexpected error occurred while getting combined balances' };
	}
};

const handler = async (req: NextApiRequest, res: NextApiResponse<IReturnResponse>): Promise<void> => {
	storeApiKeyUsage(req);

	const network = req.headers['x-network'] as string;

	if (!isValidNetwork(network)) {
		res.status(400).json({ error: 'Missing or invalid network in request headers' });
		return;
	}

	const response = await getCombinedBalances(network);
	res.status(response?.error ? 500 : 200).json(response);
};

export default withErrorHandling(handler);
