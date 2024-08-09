// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import { AssetsNetwork, chainProperties } from '~src/global/networkConstants';
import { formatedBalance } from './formatedBalance';
import { EASSETS } from '~src/types';

const getBeneficiaryAmoutAndAsset = (assetId: string, amount: string, network: string, isProposalCreationFlow?: boolean) => {
	const bnAmount = new BN(amount || 0);
	if (isProposalCreationFlow) {
		const divBn = new BN(`${10 ** chainProperties[network]?.tokenDecimals}`);
		switch (assetId) {
			case EASSETS.USDT:
				return `${bnAmount.div(divBn).toString()} USDT`;
			case EASSETS.USDC:
				return `${bnAmount.div(divBn).toString()} USDC`;
			case EASSETS.DED:
				return `${bnAmount.div(divBn).toString()} DED`;
		}
	} else {
		switch (assetId) {
			case EASSETS.USDT:
				return `${formatedBalance(
					bnAmount.mul(new BN(10 ** chainProperties[network]?.tokenDecimals).div(new BN(10 ** AssetsNetwork.USDT.tokenDecimal))).toString(),
					chainProperties[network]?.tokenSymbol,
					0
				)} USDT`;
			case EASSETS.USDC:
				return `${formatedBalance(
					bnAmount.mul(new BN(10 ** chainProperties[network]?.tokenDecimals).div(new BN(10 ** AssetsNetwork.USDT.tokenDecimal))).toString(),
					chainProperties[network]?.tokenSymbol,
					0
				)} USDC`;
			case EASSETS.DED:
				return `${formatedBalance(
					bnAmount.mul(new BN(10 ** chainProperties[network]?.tokenDecimals).div(new BN(10 ** AssetsNetwork.DED.tokenDecimal))).toString(),
					chainProperties[network]?.tokenSymbol,
					0
				)} DED`;
		}
	}
};

export default getBeneficiaryAmoutAndAsset;
