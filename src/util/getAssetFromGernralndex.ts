// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { chainProperties } from '~src/global/networkConstants';

const getAssetFromGenralIndex = (assetId: string, network: string) => {
	switch (assetId) {
		case '1984':
			return 'USDT';
		case '1337':
			return 'USDC';
		case null:
			return chainProperties[network]?.tokenSymbol;
	}
};

export default getAssetFromGenralIndex;
