// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import { chainProperties, treasuryAssets } from '~src/global/networkConstants';
import { EAssets } from '../types';
import { getGeneralIndexFromAsset } from './getGeneralIndexFromAsset';

interface Args {
	generalIndex: string;
	network: string;
	balance: BN;
}

const ZERO_BN = new BN(0);

export const getFormatedBalanceFromAsset = ({ balance, generalIndex, network }: Args) => {
	switch (generalIndex) {
		case getGeneralIndexFromAsset({ asset: EAssets.DED, network }):
			return balance.mul(new BN((10 ** treasuryAssets.DED.tokenDecimal).toString())).div(new BN(String(10 ** chainProperties[network]?.tokenDecimals)));
		case getGeneralIndexFromAsset({ asset: EAssets.USDC, network }):
			return balance.mul(new BN((10 ** treasuryAssets.USDC.tokenDecimal).toString())).div(new BN(String(10 ** chainProperties[network]?.tokenDecimals)));
		case getGeneralIndexFromAsset({ asset: EAssets.USDT, network }):
			return balance.mul(new BN((10 ** treasuryAssets.USDT.tokenDecimal).toString())).div(new BN(String(10 ** chainProperties[network]?.tokenDecimals)));
		default:
			return ZERO_BN;
	}
};
