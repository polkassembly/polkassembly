// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Wallet } from '~src/types';

export const getWalletErrors = (
	availableWallets : any,
	isNovaWallet: boolean,
	isPolymashWallet: boolean,
	setWalletErr: (pre:{message: string, description: string, error: number}) => void) => {
	if(!availableWallets) return;

	if(!isPolymashWallet && !isNovaWallet){

		if((availableWallets[Wallet.TALISMAN] === undefined && availableWallets[Wallet.POLKADOT] !== undefined && availableWallets[Wallet.SUBWALLET] !== undefined)){
			setWalletErr({ description: 'No web 3 account integration could be found. To be able to use this feature, visit this page on a computer with polkadot-js extension.',
				error: 1,message:'Wallet extension not detected.' });
		}
	}
	else if( isPolymashWallet && !availableWallets[Wallet.POLYWALLET]){
		setWalletErr({ description: 'No web 3 account integration could be found. To be able to use this feature, visit this page on a computer with polymash wallet extension.',
			error: 1,
			message:'Wallet extension not detected.' });
	}
	else if(isNovaWallet && !availableWallets[Wallet.NOVAWALLET]){
		setWalletErr({ description: 'No web 3 account integration could be found. To be able to use this feature, visit this page on a computer with nova wallet extension.',
			error: 1,
			message:'Wallet extension not detected.' });
	}

};
export default getWalletErrors;