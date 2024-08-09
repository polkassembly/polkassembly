// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { coinGeckoNetworks } from '~src/global/coinGeckoNetworkMappings';

import formatUSDWithUnits from './formatUSDWithUnits';
import { treasuryAssets } from '~src/global/networkConstants';

export default async function fetchTokenToUSDPrice(networkOrAsset: string) {
	try {
		const response = await fetch(
			'https://api.coingecko.com/api/v3/simple/price?' +
				new URLSearchParams({ ids: coinGeckoNetworks[networkOrAsset] ? coinGeckoNetworks[networkOrAsset] : networkOrAsset, include_24hr_change: 'true', vs_currencies: 'usd' })
		);
		const responseJSON = await response.json();

		if (Object.keys(responseJSON[coinGeckoNetworks[networkOrAsset] ? coinGeckoNetworks[networkOrAsset] : networkOrAsset] || {}).length == 0) {
			return 'N/A';
		} else if (['cere', treasuryAssets.DED.name].includes(networkOrAsset)) {
			return formatUSDWithUnits(responseJSON[coinGeckoNetworks[networkOrAsset] ? coinGeckoNetworks[networkOrAsset] : networkOrAsset]['usd'], 4);
		} else {
			return formatUSDWithUnits(responseJSON[coinGeckoNetworks[networkOrAsset] ? coinGeckoNetworks[networkOrAsset] : networkOrAsset]['usd']);
		}
	} catch (error) {
		return 'N/A';
	}
}
