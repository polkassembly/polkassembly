// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EAssets } from '../types';
import { getGenralIndexFromAsset } from './getGenralIndexFromAsset';

interface Args {
	inputAmountValue: string;
	dedTokenUsdPrice: string;
	currentTokenPrice: string;
	genralIndex: string;
	network: string;
}

export const getUsdValueFromAsset = ({ currentTokenPrice, dedTokenUsdPrice, genralIndex, inputAmountValue, network }: Args) => {
	if (!Number(currentTokenPrice)) return 0;
	switch (genralIndex) {
		case getGenralIndexFromAsset({ asset: EAssets.DED, network }):
			return Math.floor((Number(inputAmountValue) * Number(dedTokenUsdPrice)) / Number(currentTokenPrice) || 0);
		case getGenralIndexFromAsset({ asset: EAssets.USDC, network }):
			return Math.floor(Number(inputAmountValue) / Number(currentTokenPrice) || 0);
		case getGenralIndexFromAsset({ asset: EAssets.USDT, network }):
			return Math.floor(Number(inputAmountValue) / Number(currentTokenPrice) || 0);
		default:
			return '0';
	}
};
