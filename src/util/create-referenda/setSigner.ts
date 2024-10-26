// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise } from '@polkadot/api';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { Injected, InjectedWindow } from '@polkadot/extension-inject/types';
import { APPNAME } from '~src/global/appName';
import { Wallet } from '~src/types';

// of the Apache-2.0 license. See the LICENSE file for details.
export const setSigner = async (api: ApiPromise, wallet: Wallet) => {
	const injectedWindow = window as Window & InjectedWindow;

	const injectedWallet = isWeb3Injected ? injectedWindow.injectedWeb3[wallet] : null;

	if (!wallet || !api) {
		console.log('wallet not found');
		return;
	}

	let injected: Injected | undefined;
	try {
		injected = await new Promise((resolve, reject) => {
			const timeoutId = setTimeout(() => {
				reject(new Error('Wallet Timeout'));
			}, 60000); // wait 60 sec

			if (injectedWallet && injectedWallet.enable) {
				injectedWallet
					.enable(APPNAME)
					.then((value: any) => {
						clearTimeout(timeoutId);
						resolve(value);
					})
					.catch((error: any) => {
						reject(error);
					});
			}
		});
	} catch (err) {
		console.log(err?.message);
	}

	if (!injected) {
		console.log('injected not found');
		return;
	}
	api.setSigner(injected.signer);
};
