// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useEffect, useState } from 'react';
import { useNetworkSelector } from '~src/redux/selectors';

interface TokenPriceResponse {
	price: string;
	last_fetched_at: string;
}

export const fetchTokenPrice = async (network: string): Promise<TokenPriceResponse | null> => {
	try {
		const response = await fetch('/api/v1/token-price', {
			headers: {
				'Content-Type': 'application/json',
				'x-network': network
			},
			method: 'GET'
		});

		if (!response.ok) {
			console.warn(`Failed to fetch token price for network: ${network}. Status: ${response.status}`);
			return null;
		}

		const data = await response.json();

		if (data?.price) {
			return {
				last_fetched_at: data.last_fetched_at,
				price: data.price
			};
		} else {
			console.warn(`Token price not available for network: ${network}`);
			return null;
		}
	} catch (error) {
		console.error(`Error fetching token price for ${network}:`, error);
		return null;
	}
};

const useTokenPrice = () => {
	const { network } = useNetworkSelector();
	const [tokenPrice, setTokenPrice] = useState<string | null>(null);
	const [tokenLoading, setTokenLoading] = useState<boolean>(false);

	useEffect(() => {
		const getTokenPrice = async () => {
			if (!network) return;

			setTokenLoading(true);
			const priceData = await fetchTokenPrice(network);
			setTokenPrice(priceData?.price || null);
			setTokenLoading(false);
		};

		getTokenPrice();
	}, [network]);

	return { tokenLoading, tokenPrice };
};

export default useTokenPrice;
