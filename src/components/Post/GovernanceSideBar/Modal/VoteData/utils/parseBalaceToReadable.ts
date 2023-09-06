// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { formatBalance } from '@polkadot/util';
import { chainProperties } from '~src/global/networkConstants';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';

export const parseBalance = (
	balance: string,
	decimals: number,
	withUnit:boolean,
	network: string
) => {
	let readableBalance = formatUSDWithUnits(
		parseFloat(
			formatBalance(balance, {
				forceUnit: chainProperties[network]?.tokenSymbol,
				withAll: false,
				withUnit: false,
				withZero: false
			}).replaceAll(',', '')
		).toString(),
		decimals
	);
	if(withUnit){
		readableBalance = `${readableBalance} ${chainProperties[network]?.tokenSymbol}`;
	}
	return readableBalance;
};
