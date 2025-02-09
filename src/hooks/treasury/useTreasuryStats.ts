// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
import { useEffect, useState } from 'react';
import { TreasuryData } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
interface FetchTokenPriceResponse {
	data: TreasuryData | null;
	error: string | null;
	status: number;
}

const useFetchTreasuryStats = () => {
	const [data, setData] = useState<TreasuryData | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	const fetchData = async () => {
		try {
			const { data, error } = await nextApiClientFetch<FetchTokenPriceResponse>('/api/v1/token-price/treasury-tally');

			if (error) {
				setError(error);
				console.error('Error fetching treasury data:', error);
			} else if (data?.data) {
				setData(data.data);
				setError(null);
			} else {
				setError('No treasury data found');
			}
		} catch (error) {
			setError(error.message || 'Failed to fetch treasury stats');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	return { data, error, loading };
};

export default useFetchTreasuryStats;
