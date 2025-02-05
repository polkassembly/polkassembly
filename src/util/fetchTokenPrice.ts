// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

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
