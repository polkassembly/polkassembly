// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useEffect, useState } from 'react';
import useAssetHubApi from './useAssetHubApi';
import { ASSET_HUB_ACCOUNT } from '~src/util/assethub';
import { u128 } from '@polkadot/types';

export function useAssetHubDot(): [string, boolean, any] {
	const assetHubApi = useAssetHubApi();
	const [value, setValue] = useState<string>('0');
	const [loading, setLoading] = useState<boolean>(true);
	const [data, setData] = useState<u128>();

	useEffect(() => {
		if (!assetHubApi) {
			return;
		}
		console.log('1');

		assetHubApi.query.system
			.account(ASSET_HUB_ACCOUNT)
			.then((storage) => {
				const { free, reserved } = storage.data;
				console.log('free', { free, reserved });

				setValue((free.toBigInt() + reserved.toBigInt()).toString());
			})
			.finally(() => {
				setLoading(false);
			});
		assetHubApi.query.balances.totalIssuance().then((dot: u128) => {
			setData(dot);
			console.log('2');
		});
	}, [assetHubApi]);

	return [value, loading, data];
}
