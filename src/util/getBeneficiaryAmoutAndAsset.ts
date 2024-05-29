// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import { chainProperties } from '~src/global/networkConstants';

const getBeneficiaryAmoutAndAsset = (assetId: string, amount: string, isProposalCreationFlow?: boolean, network?: string) => {
	const bnAmount = new BN(amount || 0);
	if (isProposalCreationFlow && network) {
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
				return `${bnAmount.div(new BN('1000000')).toString()} USDT`;
			case '1337':
				return `${bnAmount.div(new BN('1000000')).toString()} USDC`;
		}
	}
};

export default getBeneficiaryAmoutAndAsset;
