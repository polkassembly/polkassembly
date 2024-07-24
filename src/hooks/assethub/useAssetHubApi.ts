// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise } from '@polkadot/api';
import { getAssetHubApi } from 'pages/api/v1/assethub';
import { useEffect, useState } from 'react';

export default function useAssetHubApi() {
	const [api, setApi] = useState<ApiPromise | null>(null);

	useEffect(() => {
		getAssetHubApi().then((api) => {
			setApi(api);
		});
	}, []);

	return api;
}
