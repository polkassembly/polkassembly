// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EAssets } from '../types';
import { network as AllNetworks } from '~src/global/networkConstants';

interface Args {
	network: string;
	asset: EAssets;
}
export const getGenralIndexFromAsset = ({ asset, network }: Args) => {
	switch (network) {
		case AllNetworks.POLKADOT:
			switch (asset) {
				case EAssets.DED:
					return '30';
				case EAssets.USDC:
					return '1337';
				case EAssets.USDT:
					return '1984';
				default:
					return null;
			}
		case AllNetworks.ROCOCO:
			switch (asset) {
				case EAssets.DED:
					return '30';
				case EAssets.USDC:
					return '1337';
				case EAssets.USDT:
					return '1984';
				default:
					return null;
			}
		case AllNetworks.KUSAMA:
			switch (asset) {
				case EAssets.USDT:
					return '1984';
				default:
					return null;
			}
	}
};
