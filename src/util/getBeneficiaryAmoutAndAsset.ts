// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';

const getBeneficiaryAmoutAndAsset = (assetId: string, amount: string) => {
	const bnAmount = new BN(amount || 0);
	switch (assetId) {
		case '1984':
			return `${bnAmount.div(new BN('1000000'))} USDT`;
		case '1337':
			return `${bnAmount.div(new BN('1000000'))} USDC`;
	}
};

export default getBeneficiaryAmoutAndAsset;
