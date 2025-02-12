// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EAssets } from '../types';
import { getGeneralIndexFromAsset } from './getGeneralIndexFromAsset';

interface Args {
	inputAmountValue: string;
	dedTokenUsdPrice: string;
	currentTokenPrice: string;
	generalIndex: string;
	network: string;
}

export const getUsdValueFromAsset = ({ currentTokenPrice, dedTokenUsdPrice, generalIndex, inputAmountValue, network }: Args) => {
	if (!Number(currentTokenPrice)) return 0;
	switch (generalIndex) {
		case getGeneralIndexFromAsset({ asset: EAssets.DED, network }):
			return Math.floor((Number(inputAmountValue) * Number(dedTokenUsdPrice)) / Number(currentTokenPrice) || 0);
		case getGeneralIndexFromAsset({ asset: EAssets.USDC, network }):
			return Number(inputAmountValue);
		case getGeneralIndexFromAsset({ asset: EAssets.USDT, network }):
			return Number(inputAmountValue);
		default:
			return '0';
	}
};
