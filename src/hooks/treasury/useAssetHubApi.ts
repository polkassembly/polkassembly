// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useState, useEffect } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import BN from 'bn.js';
import { chainProperties } from '~src/global/networkConstants';

const ZERO_BN = new BN(0);

const useAssetHubApi = (network: string) => {
	const [assethubApi, setAssethubApi] = useState<ApiPromise | null>(null);
	const [assethubApiReady, setAssethubApiReady] = useState<boolean>(false);
	const [assethubValues, setAssethubValues] = useState<{
		dotValue: BN;
		usdcValue: BN;
		usdtValue: BN;
	}>({
		dotValue: ZERO_BN,
		usdcValue: ZERO_BN,
		usdtValue: ZERO_BN
	});

	useEffect(() => {
		const initApi = async () => {
			try {
				const wsProvider = new WsProvider(chainProperties?.[network]?.assetHubRpcEndpoint);
				const apiPromise = await ApiPromise.create({ provider: wsProvider });
				setAssethubApi(apiPromise);

				const timer = setTimeout(async () => {
					await apiPromise.disconnect();
				}, 60000);

				if (!apiPromise) return 

				apiPromise.isReady
					.then(() => {
						clearTimeout(timer);
						setAssethubApiReady(true);
					})
					.catch(async (error) => {
						clearTimeout(timer);
						await apiPromise.disconnect();
						console.error(error);
					});
			} catch (error) {
				console.error('Error initializing AssetHub API:', error);
			}
		};

		initApi();

		return () => {
			assethubApi?.disconnect();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	const fetchAssetsAmount = async () => {
		if (!assethubApi || !assethubApiReady) return;

		if (assethubApiReady && chainProperties?.[network]?.assetHubTreasuryAddress) {
			try {
				// Fetch balance in DOT
				const tokenResult: any = await assethubApi.query.system.account(chainProperties[network].assetHubTreasuryAddress);
				if (tokenResult?.data?.free) {
					const freeTokenBalance = tokenResult.data.free.toBigInt();
					setAssethubValues((values) => ({
						...values,
						dotValue: new BN(freeTokenBalance)
					}));
				}

				// Fetch balance in USDC
				if (chainProperties[network]?.supportedAssets?.[2].genralIndex) {
					const usdcResult = (await assethubApi.query.assets.account(
						chainProperties[network]?.supportedAssets?.[2].genralIndex,
						chainProperties[network].assetHubTreasuryAddress
					)) as any;

					if (usdcResult.isNone) {
						console.log('No data found for the USDC assets');
					} else {
						const data = usdcResult.unwrap();
						const freeUSDCBalance = data.balance.toBigInt();
						setAssethubValues((values) => ({
							...values,
							usdcValue: new BN(freeUSDCBalance)
						}));
					}
				}

				// Fetch balance in USDT
				if (chainProperties[network]?.supportedAssets?.[1].genralIndex) {
					const usdtResult = (await assethubApi.query.assets.account(
						chainProperties[network]?.supportedAssets?.[1].genralIndex,
						chainProperties[network].assetHubTreasuryAddress
					)) as any;

					if (usdtResult.isNone) {
						console.log('No data found for the USDT assets');
					} else {
						const data = usdtResult.unwrap();
						const freeUSDTBalance = data.balance.toBigInt();
						setAssethubValues((values) => ({
							...values,
							usdtValue: new BN(freeUSDTBalance)
						}));
					}
				}
			} catch (e) {
				console.error('Error fetching asset balance:', e);
			}
		}
	};

	return { assethubApiReady, assethubValues, fetchAssetsAmount };
};

export default useAssetHubApi;
