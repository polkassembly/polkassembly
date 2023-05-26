// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { InjectedWindow } from '@polkadot/extension-inject/types';
import { Wallet } from '~src/types';

export const checkWalletForNetwork = (network: string) => {
	if(!network) return;
	const isNovaWallet = (window as any).walletExtension?.isNovaWallet;
	const isPolymeshWallet = ['polymesh'].includes(network);
	const injectedWindow = window as Window & InjectedWindow;
	const availableWallets = injectedWindow.injectedWeb3;

	if(!isPolymeshWallet && !isNovaWallet){

		if((availableWallets[Wallet.TALISMAN] === undefined && availableWallets[Wallet.POLKADOT] === undefined && availableWallets[Wallet.SUBWALLET] === undefined)){
			return ({ description: 'No web 3 account integration could be found. To be able to use this feature, visit this page on a computer with polkadot-js extension.',
				error: 1,message:'Wallet extension not detected.' });
		}
	}
	else if( isPolymeshWallet && !availableWallets[Wallet.POLYWALLET]){
		return ({ description: 'No web 3 account integration could be found. To be able to use this feature, visit this page on a computer with polymash wallet extension.',
			error: 1,
			message:'Wallet extension not detected.' });
	}
	else if(isNovaWallet){
		return ({ description: 'No web 3 account integration could be found. To be able to use this feature, visit this page on a computer with nova wallet extension.',
			error: 1,
			message:'Wallet extension not detected.' });
	}
	return ({ description: '',
		error: 0,
		message:'' });
};
export default checkWalletForNetwork;