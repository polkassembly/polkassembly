// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { InjectedWindow } from '@polkadot/extension-inject/types';
import { Wallet } from '~src/types';

export const checkWalletForSubstrateNetwork = (network: string) => {
	if (!network || !window) return;

	const injectedWindow = window as Window & InjectedWindow;
	const availableWallets = injectedWindow.injectedWeb3;

	if (
		availableWallets[Wallet.TALISMAN] === undefined &&
		availableWallets[Wallet.POLKADOT] === undefined &&
		availableWallets[Wallet.SUBWALLET] === undefined &&
		availableWallets[Wallet.POLKAGATE] === undefined &&
		!(window as any).walletExtension?.isNovaWallet
	) {
		if (!['polymesh'].includes(network)) {
			return {
				description: 'No web 3 account integration could be found. To be able to use this feature, visit this page on a computer with polkadot-js extension.',
				error: 1,
				message: 'Wallet extension not detected.'
			};
		}
		if (network === 'polymesh' && !availableWallets[Wallet.POLYWALLET]) {
			return {
				description: 'No web 3 account integration could be found. To be able to use this feature, visit this page on a computer with polkadot-js extension.',
				error: 1,
				message: 'Wallet extension not detected.'
			};
		}
	}

	return { description: '', error: 0, message: '' };
};
export default checkWalletForSubstrateNetwork;
