// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise } from '@polkadot/api';
import BN from 'bn.js';

const getCurrentBlock = async ({ api, apiReady }: { api: ApiPromise; apiReady: boolean }): Promise<BN | null> => {
	if (!api || !apiReady) return null;
	await api.isReady;

	const currentBlock = await api?.derive?.chain.bestNumber();
	return currentBlock;
};

export default getCurrentBlock;
