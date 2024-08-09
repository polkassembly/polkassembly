// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EAssets } from '../types';

interface Args {
	inputAmountValue: string;
	dedTokenUsdPrice: string;
	currentTokenPrice: string;
	genralIndex: string;
}

export const getUsdValueFromAsset = ({ currentTokenPrice, dedTokenUsdPrice, genralIndex, inputAmountValue }: Args) => {
	switch (genralIndex) {
		case EAssets.DED:
			return Math.floor((Number(inputAmountValue) * Number(dedTokenUsdPrice)) / Number(currentTokenPrice) || 0);
		case EAssets.USDC:
			return Math.floor(Number(inputAmountValue) / Number(currentTokenPrice) || 0);
		case EAssets.USDT:
			return Math.floor(Number(inputAmountValue) / Number(currentTokenPrice) || 0);
		default:
			return null;
	}
};
