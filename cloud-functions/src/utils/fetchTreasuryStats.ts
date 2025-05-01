import { ApiPromise, WsProvider } from '@polkadot/api';
import type { Option } from '@polkadot/types-codec';
import BN from 'bn.js';
import axios from 'axios';

interface ITreasuryStats {
	relayChain: {
		dot: string;
		myth: string;
	};
	ambassador: {
		usdt: string;
	};
	assetHub: {
		dot: string;
		usdc: string;
		usdt: string;
	};
	hydration: {
		dot: string;
		usdc: string;
		usdt: string;
	};
	bounties: {
		dot: string;
	};
	fellowship: {
		dot: string;
		usdt: string;
	};
	total: {
		totalDot: string;
		totalUsdc: string;
		totalUsdt: string;
		totalMyth: string;
	};
	loans: {
		dot: string;
		usdc: string;
	};
}

function filterBountiesData(items: any) {
	return items.filter((item: any) => {
		const { isFunded, isCuratorProposed, isActive } = item?.bounty?.status || {};
		return isFunded || isCuratorProposed || isActive;
	});
}

export async function fetchTreasuryStats(): Promise<ITreasuryStats | null> {
	try {
		const treasuryStats: ITreasuryStats = {
			relayChain: {
				dot: '',
				myth: ''
			},
			ambassador: {
				usdt: ''
			},
			assetHub: {
				dot: '',
				usdc: '',
				usdt: ''
			},
			hydration: {
				dot: '',
				usdc: '',
				usdt: ''
			},
			bounties: {
				dot: ''
			},
			fellowship: {
				dot: '',
				usdt: ''
			},
			total: {
				totalDot: '',
				totalUsdc: '',
				totalUsdt: '',
				totalMyth: ''
			},
			loans: {
				dot: '15500000000000000',
				usdc: '1500000000000'
			}
		};

		// 1. get relay chain stats
		const api = new ApiPromise({
			provider: new WsProvider('wss://rpc.ibp.network/polkadot')
		});
		await api.isReady;

		const treasuryAccount = '13UVJyLnbVp9RBZYFwFGyDvVd1y27Tt8tkntv6Q7JVPhFsTB'; // modlpy
		const treasuryBalance = ((await api.query.system.account(treasuryAccount)) as any).data.free.toString();
		treasuryStats.relayChain.dot = treasuryBalance;

		let activePjsBounties = await api?.derive.bounties?.bounties();

		activePjsBounties = filterBountiesData(activePjsBounties);

		const balances = await Promise.all(
			activePjsBounties.map(async (bounty) => {
				const id = bounty?.index?.toJSON();
				if (!id) return new BN(0);

				try {
					const response = await axios.get(`https://polkadot-api.subsquare.io/treasury/bounties/${id}`);
					const result = response.data;
					const address = result?.onchainData?.address;

					if (!address) {
						const metadataValue = result?.onchainData?.meta?.value || 0;
						return new BN(metadataValue);
					}

					try {
						const accountData = (await api.query.system.account(address)) as any;
						return new BN(accountData.data.free.toString()).add(new BN(accountData.data.reserved.toString()));
					} catch (accountError) {
						console.error(`Error fetching account data for bounty ${id}: ${accountError}, address: ${address}`);
						return new BN(0);
					}
				} catch (error) {
					console.error(`Error fetching balance for bounty index ${id}: ${error}`);
					return new BN(0);
				}
			})
		);

		const bountiesTotal = balances.reduce((acc: BN, curr: BN) => acc.add(curr), new BN(0)).toString();

		treasuryStats.bounties.dot = bountiesTotal;

		await api.disconnect();

		// 2. get asset hub stats
		const assetHubApi = new ApiPromise({
			provider: new WsProvider('wss://dot-rpc.stakeworld.io/assethub')
		});
		await assetHubApi.isReady;

		const ASSETHUB_TREASURY_ADDRESS = '14xmwinmCEz6oRrFdczHKqHgWNMiCysE2KrA4jXXAAM1Eogk'; // polkadot assethub, assethub usdt, usdc
		const ASSETHUB_TREASURY_ADDRESS_2 = '16VcQSRcMFy6ZHVjBvosKmo7FKqTb8ZATChDYo8ibutzLnos'; // fellowship dot assethub
		const ASSETHUB_TREASURY_ADDRESS_3 = '13w7NdvSR1Af8xsQTArDtZmVvjE8XhWNdL4yed3iFHrUNCnS'; // fellowship assethub usdt
		const ASSETHUB_TREASURY_ADDRESS_4 = '13gYFscwJFJFqFMNnttzuTtMrApUEmcUARtgFubbChU9g6mh'; // polkadot myth assethub
		const ASSETHUB_TREASURY_ADDRESS_5 = '13wa8ddUNUhXnGeTrjYH8hYXF2jNdCJvgcADJakNvtNdGozX'; // Ambassador USDT

		const USDT_GENERAL_INDEX = '1984';
		const USDC_GENERAL_INDEX = '1337';
		const MYTHOS_PARACHAIN_ID = '3369';

		// relay chain assethub dot balance
		const relayChainAssethubDotBalance = ((await assetHubApi.query.system.account(ASSETHUB_TREASURY_ADDRESS)) as any).data.free.toString();
		treasuryStats.assetHub.dot = relayChainAssethubDotBalance;

		// fellowship assethub dot balance
		const fellowshipAssethubDotBalance = ((await assetHubApi.query.system.account(ASSETHUB_TREASURY_ADDRESS_2)) as any).data.free.toString();
		treasuryStats.fellowship.dot = fellowshipAssethubDotBalance;

		// relay chain assethub usdt balance
		const relayChainAssethubUsdtBalance = await assetHubApi.query.assets.account<Option<any>>(USDT_GENERAL_INDEX, ASSETHUB_TREASURY_ADDRESS);
		relayChainAssethubUsdtBalance.isSome ? (treasuryStats.assetHub.usdt = relayChainAssethubUsdtBalance.unwrap().balance.toString()) : (treasuryStats.assetHub.usdt = '');

		// fellowship assethub usdt balance
		const fellowshipAssethubUsdtBalance = await assetHubApi.query.assets.account<Option<any>>(USDT_GENERAL_INDEX, ASSETHUB_TREASURY_ADDRESS_3);
		treasuryStats.fellowship.usdt = fellowshipAssethubUsdtBalance.isSome ? fellowshipAssethubUsdtBalance.unwrap().balance.toString() : '';

		// ambassador usdt balance
		const ambassadorUsdtBalance = await assetHubApi.query.assets.account<Option<any>>(USDT_GENERAL_INDEX, ASSETHUB_TREASURY_ADDRESS_5);
		treasuryStats.ambassador.usdt = ambassadorUsdtBalance.isSome ? ambassadorUsdtBalance.unwrap().balance.toString() : '';

		// relay chain assethub usdc balance
		const relayChainAssethubUsdcBalance = await assetHubApi.query.assets.account<Option<any>>(USDC_GENERAL_INDEX, ASSETHUB_TREASURY_ADDRESS);
		treasuryStats.assetHub.usdc = relayChainAssethubUsdcBalance.isSome ? relayChainAssethubUsdcBalance.unwrap().balance.toString() : '';

		// relay chain myth assethub dot balance
		const relayChainAssethubMythDotBalance = await assetHubApi.query.foreignAssets.account<Option<any>>(
			{
				parents: 1,
				interior: {
					X1: [
						{
							Parachain: MYTHOS_PARACHAIN_ID
						}
					]
				}
			},
			ASSETHUB_TREASURY_ADDRESS_4
		);
		treasuryStats.relayChain.myth = relayChainAssethubMythDotBalance.isSome ? relayChainAssethubMythDotBalance.unwrap().balance.toString() : '';

		await assetHubApi.disconnect();

		// 3. get hydration stats
		const hydrationApi = new ApiPromise({
			provider: new WsProvider('wss://hydradx-rpc.dwellir.com')
		});
		await hydrationApi.isReady;

		const hydrationAddresses = ['7KCp4eenFS4CowF9SpQE5BBCj5MtoBA3K811tNyRmhLfH1aV', '7LcF8b5GSvajXkSChhoMFcGDxF9Yn9unRDceZj1Q6NYox8HY', '7KATdGaecnKi4zDAMWQxpB2s59N2RE1JgLuugCjTsRZHgP24'];

		const HYDRATION_DOT_ASSET_ID = 5;
		const HYDRATION_USDC_ASSET_ID = 22;
		const HYDRATION_USDT_ASSET_ID = 10;

		const ZERO_BN = new BN(0);

		let hydrationDotBalance = ZERO_BN;
		let hydrationUsdcBalance = ZERO_BN;
		let hydrationUsdtBalance = ZERO_BN;

		for (const address of hydrationAddresses) {
			// get dot balance
			const hydrationDOTBalance = (await hydrationApi?.query?.tokens?.accounts(address, HYDRATION_DOT_ASSET_ID)) as any;
			const freeDOTBalance = new BN(hydrationDOTBalance.free.toString());
			const reservedDOTBalance = new BN(hydrationDOTBalance.reserved.toString());
			hydrationDotBalance = hydrationDotBalance.add(freeDOTBalance).add(reservedDOTBalance);

			// get usdc balance
			const hydrationUSDCBalance = (await hydrationApi?.query?.tokens?.accounts(address, HYDRATION_USDC_ASSET_ID)) as any;
			const freeUSDCBalance = new BN(hydrationUSDCBalance.free.toString());
			const reservedUSDCBalance = new BN(hydrationUSDCBalance.reserved.toString());
			hydrationUsdcBalance = hydrationUsdcBalance.add(freeUSDCBalance).add(reservedUSDCBalance);

			// get usdt balance
			const hydrationUSDTBalance = (await hydrationApi?.query?.tokens?.accounts(address, HYDRATION_USDT_ASSET_ID)) as any;
			const freeUSDTBalance = new BN(hydrationUSDTBalance.free.toString());
			const reservedUSDTBalance = new BN(hydrationUSDTBalance.reserved.toString());
			hydrationUsdtBalance = hydrationUsdtBalance.add(freeUSDTBalance).add(reservedUSDTBalance);
		}

		treasuryStats.hydration.dot = hydrationDotBalance.isZero() ? '' : hydrationDotBalance.toString();
		treasuryStats.hydration.usdc = hydrationUsdcBalance.isZero() ? '' : hydrationUsdcBalance.toString();
		treasuryStats.hydration.usdt = hydrationUsdtBalance.isZero() ? '' : hydrationUsdtBalance.toString();

		await hydrationApi.disconnect();

		// 5. add for total treasury stats
		treasuryStats.total.totalDot = Object.values(treasuryStats)
			.reduce((acc: BN, curr: { dot?: string }) => acc.add(new BN(curr?.dot || '0')), new BN(0))
			.toString();
		treasuryStats.total.totalUsdc = Object.values(treasuryStats)
			.reduce((acc: BN, curr: { usdc?: string }) => acc.add(new BN(curr?.usdc || '0')), new BN(0))
			.toString();
		treasuryStats.total.totalUsdt = Object.values(treasuryStats)
			.reduce((acc: BN, curr: { usdt?: string }) => acc.add(new BN(curr?.usdt || '0')), new BN(0))
			.toString();
		treasuryStats.total.totalMyth = Object.values(treasuryStats)
			.reduce((acc: BN, curr: { myth?: string }) => acc.add(new BN(curr?.myth || '0')), new BN(0))
			.toString();

		// 6. get dot price stats
		return treasuryStats;
	} catch (error) {
		console.error(`Error fetching treasury stats: ${error}`);
		return null;
	}
}
