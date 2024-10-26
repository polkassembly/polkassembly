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
	usingInTx?: boolean;
}

const ZERO_BN = new BN(0);

export const getFormatedBalanceFromAsset = ({ balance, generalIndex, network, usingInTx = false }: Args) => {
	if (usingInTx) {
		switch (generalIndex) {
			case getGeneralIndexFromAsset({ asset: EAssets.DED, network }):
				return balance
					.mul(new BN('10').pow(new BN(String(treasuryAssets.DED.tokenDecimal || 0))))
					.div(new BN('10').pow(new BN(String(chainProperties[network]?.tokenDecimals || 0))));
			case getGeneralIndexFromAsset({ asset: EAssets.USDC, network }):
				return balance
					.mul(new BN('10').pow(new BN(String(treasuryAssets.USDC.tokenDecimal || 0))))
					.div(new BN('10').pow(new BN(String(chainProperties[network]?.tokenDecimals || 0))));
			case getGeneralIndexFromAsset({ asset: EAssets.USDT, network }):
				return balance
					.mul(new BN('10').pow(new BN(String(treasuryAssets.USDT.tokenDecimal || 0))))
					.div(new BN('10').pow(new BN(String(chainProperties[network]?.tokenDecimals || 0))));
			default:
				return ZERO_BN;
		}
	} else {
		switch (generalIndex) {
			case getGeneralIndexFromAsset({ asset: EAssets.DED, network }):
				return balance
					.mul(new BN('10').pow(new BN(String(chainProperties[network]?.tokenDecimals || 0))))
					.div(new BN('10').pow(new BN(String(treasuryAssets.DED.tokenDecimal || 0))));
			case getGeneralIndexFromAsset({ asset: EAssets.USDC, network }):
				return balance
					.mul(new BN('10').pow(new BN(String(chainProperties[network]?.tokenDecimals || 0))))
					.div(new BN('10').pow(new BN(String(treasuryAssets.USDC.tokenDecimal || 0))));
			case getGeneralIndexFromAsset({ asset: EAssets.USDT, network }):
				return balance
					.mul(new BN('10').pow(new BN(String(chainProperties[network]?.tokenDecimals || 0))))
					.div(new BN('10').pow(new BN(String(treasuryAssets.USDT.tokenDecimal || 0))));
			default:
				return ZERO_BN;
		}
	}
};
