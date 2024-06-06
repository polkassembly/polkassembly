// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import { chainProperties } from '~src/global/networkConstants';
import { formatedBalance } from './formatedBalance';

const getBeneficiaryAmoutAndAsset = (assetId: string, amount: string, network: string, isProposalCreationFlow?: boolean) => {
	const bnAmount = new BN(amount || 0);
	if (isProposalCreationFlow) {
		const divBn = new BN(`${10 ** chainProperties[network]?.tokenDecimals}`);
		switch (assetId) {
			case '1984':
				return `${bnAmount.div(divBn).toString()} USDT`;
			case '1337':
				return `${bnAmount.div(divBn).toString()} USDC`;
		}
	} else {
		switch (assetId) {
			case '1984':
				return `${formatedBalance(
					bnAmount.mul(new BN(10 ** chainProperties[network]?.tokenDecimals).div(new BN('1000000'))).toString(),
					chainProperties[network]?.tokenSymbol,
					0
				)} USDT`;
			case '1337':
				return `${formatedBalance(
					bnAmount.mul(new BN(10 ** chainProperties[network]?.tokenDecimals).div(new BN('1000000'))).toString(),
					chainProperties[network]?.tokenSymbol,
					0
				)} USDC`;
		}
	}
};

export default getBeneficiaryAmoutAndAsset;
