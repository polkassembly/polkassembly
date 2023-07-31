// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { formatBalance } from '@polkadot/util';

export const formatedBalance = (balance: string, unit: string) => {
	const formated = formatBalance(balance, { forceUnit: unit, withUnit: false }).split('.');
	if(Number(formated?.[0][0]) > 0){
		return formated?.[1] ? `${formated[0]}.${formated[1].slice(0,1)}`: `${formated[0]}`;
	}else{
		return formated.join('.');
	}

};