// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import fetchTokenToUSDPrice, { fetchTokenToUSDPriceV2 } from './fetchTokenToUSDPrice';

export const GetCurrentTokenPrice = (network: string, setCurrentTokenPrice: (pre: { isLoading: boolean; value: string }) => void) => {
	let cancel = false;
	if (cancel) return;

	setCurrentTokenPrice({
		isLoading: true,
		value: ''
	});
	fetchTokenToUSDPrice(network)
		.then((formattedUSD) => {
			if (formattedUSD === 'N/A') {
				setCurrentTokenPrice({
					isLoading: false,
					value: formattedUSD
				});
				return;
			}

			setCurrentTokenPrice({
				isLoading: false,
				value: network == 'cere' ? parseFloat(formattedUSD).toFixed(4) : parseFloat(formattedUSD).toFixed(2)
			});
		})
		.catch(() => {
			setCurrentTokenPrice({
				isLoading: false,
				value: 'N/A'
			});
		});

	return () => {
		cancel = true;
	};
};

export const GetCurrentTokenPriceV2 = async (network: string) => {
	try {
		const { dailyChange, value } = await fetchTokenToUSDPriceV2(network);

		return {
			dailyChange: dailyChange,
			value: network == 'cere' ? parseFloat(value).toFixed(4) : parseFloat(value).toFixed(2)
		};
	} catch (error) {
		return {
			dailyChange: 'N/A',
			value: 'N/A'
		};
	}
};
