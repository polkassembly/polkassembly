// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiPromise, WsProvider } from '@polkadot/api';
import type { Option } from '@polkadot/types';
import type { PalletAssetsAssetAccount } from '@polkadot/types/lookup';
import { chainProperties } from '~src/global/networkConstants';
import { subscanApiHeaders } from '~src/global/apiHeaders';
import messages from '~src/auth/utils/messages';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import { firestore_db } from '~src/services/firebaseInit';

const createPolkadotApi = async (rpcEndpoint: string): Promise<ApiPromise> => {
	const wsProvider = new WsProvider(rpcEndpoint);
	const api = await ApiPromise.create({ provider: wsProvider });
	return api;
};

const getDaysInPreviousMonths = (n: number): { month: string; days: number }[] => {
	const result: { month: string; days: number }[] = [];
	const currentDate = new Date();
	const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

	for (let i = 0; i < n; i++) {
		const targetMonth = currentDate.getMonth() - i;
		const targetYear = targetMonth < 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();
		const normalizedMonth = (targetMonth + 12) % 12;

		const daysInMonth = new Date(targetYear, normalizedMonth + 1, 0).getDate();
		result.push({ month: monthNames[normalizedMonth], days: daysInMonth });
	}

	return result;
};

const getBlockHashByBlockNumber = async (apiURL: string, blockNum: number): Promise<string> => {
	const response = await fetch(`${apiURL}?blockNum=${blockNum}&t=${new Date().getTime()}`, {
		body: JSON.stringify({ block_num: blockNum }),
		headers: subscanApiHeaders,
		method: 'POST'
	});

	const responseData = await response.json();

	if (!response.ok) {
		throw new Error(messages.API_FETCH_ERROR);
	}

	if (responseData.code === 0 && responseData.data) {
		return responseData.data.hash;
	} else {
		throw new Error(`Failed to fetch block hash: ${responseData.message}`);
	}
};

const fetchAssetBalance = async (api: ApiPromise, assetId: string, network: string): Promise<{ [month: string]: any }> => {
	const networkProperties = chainProperties?.[network];

	const accountId = chainProperties[network]?.assetHubTreasuryAddress;

	if (!networkProperties) {
		throw new Error(`Network properties for ${network} are undefined`);
	}

	const networkBlockTime = networkProperties.assetHubBlockTime ? networkProperties.assetHubBlockTime / 1000 : null;

	if (!networkBlockTime) return {};

	const apiURL = `${chainProperties[network]?.assethubExternalLinks}/api/scan/block`;
	const daysInPreviousMonths = getDaysInPreviousMonths(12);

	const blocksPerDay = Math.floor((60 * 60 * 24) / networkBlockTime); // 86400 seconds in a day

	const assetHubStartBlock = 6810000;

	const blockNumbers = [];
	let cumulativeDays = 0;

	for (let i = 0; i < daysInPreviousMonths.length; i++) {
		cumulativeDays += daysInPreviousMonths[i].days;
		const blockNumber = assetHubStartBlock - cumulativeDays * blocksPerDay;
		blockNumbers.push(blockNumber);
	}

	const blockHashArr = [];

	for (const blockNumber of blockNumbers) {
		try {
			const blockHash = await getBlockHashByBlockNumber(apiURL, blockNumber);
			blockHashArr.push(blockHash);
		} catch (error) {
			console.error(`Failed to fetch block hash for block number ${blockNumber}:`, error);
			continue;
		}
	}

	const balances: { [month: string]: any } = {};

	for (let i = 0; i < blockHashArr.length; i++) {
		const month = daysInPreviousMonths[i].month;
		const blockHash = blockHashArr[i];
		try {
			const balance: Option<PalletAssetsAssetAccount> = await api?.query?.assets?.account?.at(blockHash, assetId, accountId);
			balances[month] = balance;
		} catch (error) {
			console.error(`Failed to fetch balance for block hash ${blockHash}:`, error);
			balances[month] = { error: 'Error fetching balance' };
		}
	}

	return balances;
};

const saveToFirestore = async (network: string, data: { [key: string]: number }) => {
	try {
		await firestore_db.collection('networks').doc(network).set(
			{
				total_assets_data: data
			},
			{ merge: true }
		);
	} catch (error) {
		console.error('Error writing data to Firestore:', error);
	}
};

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
	try {
		storeApiKeyUsage(req);
		const network = 'polkadot';

		const rpcEndpoint = chainProperties?.[network]?.assetHubRpcEndpoint;

		if (!rpcEndpoint) {
			return res.status(400).json({ error: 'Missing Rpc please check' });
		}

		const api = await createPolkadotApi(rpcEndpoint);

		if (!api) return res.status(400).json({ error: 'Error in Assethub API' });

		// Fetch balance for USDT
		const usdtAssetId = chainProperties[network]?.supportedAssets?.[1].genralIndex;
		const usdtBalances = await fetchAssetBalance(api, usdtAssetId as string, network as string);

		// Fetch balance for USDC
		const usdcAssetId = chainProperties[network]?.supportedAssets?.[2].genralIndex;
		const usdcBalances = await fetchAssetBalance(api, usdcAssetId as string, network as string);

		const combinedBalances: { [month: string]: string } = {};

		Object.keys(usdtBalances).forEach((month) => {
			const usdtBalanceOption = usdtBalances[month] as Option<PalletAssetsAssetAccount>;
			const usdcBalanceOption = usdcBalances[month] as Option<PalletAssetsAssetAccount>;

			const usdtBalance = usdtBalanceOption.isSome ? BigInt(usdtBalanceOption.unwrap().balance.toString()) : BigInt(0);
			const usdcBalance = usdcBalanceOption.isSome ? BigInt(usdcBalanceOption.unwrap().balance.toString()) : BigInt(0);

			const totalBalance = usdtBalance + usdcBalance;

			const adjustedBalance = totalBalance / BigInt(1000000);

			combinedBalances[month] = adjustedBalance.toString();
		});

		const formattedData: { [key: string]: number } = {};
		Object.keys(combinedBalances).forEach((month) => {
			formattedData[month] = parseInt(combinedBalances[month], 10);
		});

		await saveToFirestore(network, formattedData);

		return res.status(200).json(combinedBalances);
	} catch (error) {
		console.error('Error in handler:', error);
		return res.status(500).json({ error: 'An error occurred while processing the request' });
	}
};

export default withErrorHandling(handler);
