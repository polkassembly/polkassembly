// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useState, useEffect } from 'react';

interface ITokenPrice {
	price?: string;
	lastFetchedAt?: Date;
	error?: string;
}

const useTokenPrice = (network: string) => {
	const [priceData, setPriceData] = useState<ITokenPrice>({});
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		const fetchTokenPrice = async () => {
			setLoading(true);
			setPriceData({});

			try {
				const res = await fetch('/api/token-price', {
					headers: {
						'x-network': network
					},
					method: 'GET'
				});

				const data = await res.json();

				if (res.ok && data?.price) {
					setPriceData({
						lastFetchedAt: new Date(data.last_fetched_at),
						price: data.price
					});
				} else {
					setPriceData({ error: data?.message || 'Token price not found' });
				}
			} catch (error) {
				setPriceData({ error: error instanceof Error ? error.message : 'An error occurred' });
			} finally {
				setLoading(false);
			}
		};

		if (network) {
			fetchTokenPrice();
		}
	}, [network]);

	return { ...priceData, loading };
};

export default useTokenPrice;
