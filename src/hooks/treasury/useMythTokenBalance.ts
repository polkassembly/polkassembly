// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useState, useEffect } from 'react';

interface IMythTokenBalance {
	balance?: number;
	error?: string;
}

const useMythTokenBalance = (network: string) => {
	const [balanceData, setBalanceData] = useState<IMythTokenBalance>({});
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		const fetchBalance = async () => {
			setLoading(true);
			setBalanceData({});
			try {
				const res = await fetch('/api/v1/treasury-amount-history/mythTokenAmount', {
					headers: {
						'x-network': network
					},
					method: 'GET'
				});

				const data = await res.json();

				if (res.ok && data?.data?.balance !== undefined) {
					setBalanceData({ balance: data?.data?.balance });
				} else {
					setBalanceData({ error: data?.error || 'No balance data found' });
				}
			} catch (error) {
				setBalanceData({ error: error instanceof Error ? error.message : 'An error occurred' });
			} finally {
				setLoading(false);
			}
		};

		if (network) {
			fetchBalance();
		}
	}, [network]);

	return { ...balanceData, loading };
};

export default useMythTokenBalance;
