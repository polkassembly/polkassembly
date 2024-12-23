// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EAssets } from '../types';
import { chainProperties } from '~src/global/networkConstants';

interface Args {
	network: string;
	asset: EAssets;
}
export const getGeneralIndexFromAsset = ({ asset, network }: Args) => {
	if (!network) return null;
	return chainProperties?.[network]?.supportedAssets?.find(({ symbol }) => symbol === asset)?.genralIndex || null;
};
