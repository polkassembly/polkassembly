// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { coinGeckoNetworks } from '~src/global/coinGeckoNetworkMappings';

import formatUSDWithUnits from './formatUSDWithUnits';
import { treasuryAssets } from '~src/global/networkConstants';

export default async function fetchTokenToUSDPrice(networkOrAsset: string) {
	try {
		const coinId = coinGeckoNetworks[networkOrAsset] || networkOrAsset;
		const response = await fetch('https://api.coingecko.com/api/v3/simple/price?' + new URLSearchParams({ ids: coinId, include_24hr_change: 'true', vs_currencies: 'usd' }));
		const responseJSON = await response.json();

		if (!responseJSON[coinId] || !responseJSON[coinId]['usd']) {
			return 'N/A';
		}

		if (['cere', treasuryAssets.DED.name].includes(networkOrAsset)) {
			return formatUSDWithUnits(String(responseJSON[coinId]['usd']), 7);
		} else {
			return formatUSDWithUnits(String(responseJSON[coinId]['usd']));
		}
	} catch (error) {
		return 'N/A';
	}
}
