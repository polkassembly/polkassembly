// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useState, useEffect } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import BN from 'bn.js';
import { chainProperties } from '~src/global/networkConstants';

const ZERO_BN = new BN(0);

const useHydrationApi = (network: string) => {
	const [hydrationApi, setHydrationApi] = useState<ApiPromise | null>(null);
	const [hydrationApiReady, setHydrationApiReady] = useState<boolean>(false);
	const [hydrationValues, setHydrationValues] = useState<{
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
				const wsProvider = new WsProvider(chainProperties?.[network]?.hydrationEndpoints?.[0]);
				const apiPromise = await ApiPromise.create({ provider: wsProvider });
				setHydrationApi(apiPromise);

				const timer = setTimeout(async () => {
					await apiPromise.disconnect();
				}, 60000);

				if (!apiPromise) return 

				apiPromise.isReady
					.then(() => {
						clearTimeout(timer);
						setHydrationApiReady(true);
					})
					.catch(async (error) => {
						clearTimeout(timer);
						await apiPromise.disconnect();
						console.error(error);
					});
			} catch (error) {
				console.error('Error initializing Hydration API:', error);
			}
		};

		initApi();

		return () => {
			hydrationApi?.disconnect();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	const fetchHydrationAssetsAmount = async () => {
		if (!hydrationApi || !hydrationApiReady) return;

		if (hydrationApiReady && chainProperties?.[network]?.hydrationTreasuryAddress) {
			try {
				// Fetch balance in DOT
				const dotResult = (await hydrationApi?.query?.tokens?.accounts(
					chainProperties[network].hydrationTreasuryAddress,
					chainProperties[network]?.hydrationAssets?.[0]?.assetId
				)) as any;

				const freeDOTBalance = new BN(dotResult.reserved.toBigInt());
				setHydrationValues((values) => ({ ...values, dotValue: freeDOTBalance }));

				// Fetch balance in USDT
				if (chainProperties[network]?.hydrationAssets?.[1]?.assetId) {
					const usdtResult = (await hydrationApi?.query?.tokens?.accounts(
						chainProperties[network].hydrationTreasuryAddress,
						chainProperties[network]?.hydrationAssets?.[1]?.assetId
					)) as any;

					const freeUSDTBalance = new BN(usdtResult.free.toBigInt());
					setHydrationValues((values) => ({ ...values, usdtValue: freeUSDTBalance }));
				}

				// Fetch balance in USDC
				if (chainProperties[network]?.hydrationAssets?.[2]?.assetId) {
					const usdcResult = (await hydrationApi?.query?.tokens?.accounts(
						chainProperties[network].hydrationTreasuryAddress,
						chainProperties[network]?.hydrationAssets?.[2]?.assetId
					)) as any;

					const freeUSDCBalance = new BN(usdcResult.free.toBigInt());
					setHydrationValues((values) => ({ ...values, usdcValue: freeUSDCBalance }));
				}
			} catch (e) {
				console.error('Error fetching hydration asset balance:', e);
			}
		}
	};

	return { fetchHydrationAssetsAmount, hydrationApiReady, hydrationValues };
};

export default useHydrationApi;
