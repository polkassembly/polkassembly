// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { isWeb3Injected } from '@polkadot/extension-dapp';
import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { APPNAME } from '~src/global/appName';
import { Wallet } from '~src/types';
import getEncodedAddress from './getEncodedAddress';
import getSubstrateAddress from './getSubstrateAddress';
import { ApiPromise } from '@polkadot/api';

interface Props{
  network: string,
  api: ApiPromise,
  loginAddress: string,
  chosenWallet: Wallet,
  chosenAddress?: string
}

const getAccountsFromWallet = async ({ network, api, loginAddress, chosenWallet, chosenAddress }: Props): Promise<{accounts:InjectedAccount[], account: string} | undefined > => {

	const injectedWindow = window as Window & InjectedWindow;

	const wallet = isWeb3Injected
		? injectedWindow.injectedWeb3[chosenWallet]
		: null;

	if (!wallet || !api) {
		return;
	}

	let injected: Injected | undefined;
	try {
		injected = await new Promise((resolve, reject) => {
			const timeoutId = setTimeout(() => {
				reject(new Error('Wallet Timeout'));
			}, 60000); // wait 60 sec

			if(wallet && wallet.enable) {
				wallet.enable(APPNAME)
					.then((value) => { clearTimeout(timeoutId); resolve(value); })
					.catch((error) => { reject(error); });
			}
		});
	} catch (err) {
		console.log(err?.message);
	}
	if (!injected) {
		return;
	}

	const accounts = await injected.accounts.get();
	if (accounts.length === 0) {
		return;
	}

	accounts.forEach((account) => {
		account.address = getEncodedAddress(account.address, network) || account.address;
	});

	if (accounts && Array.isArray(accounts)) {
		const substrate_address = getSubstrateAddress(loginAddress);
		const index = accounts.findIndex((account) => (getSubstrateAddress(account?.address) || '').toLowerCase() === (substrate_address || '').toLowerCase());
		if (index >= 0) {
			const account = accounts[index];
			accounts.splice(index, 1);
			accounts.unshift(account);
		}
	}

	if (accounts.length > 0) {
		if(api) {
			api.setSigner(injected.signer);
		}

	}

	return  { account: chosenAddress || accounts[0].address, accounts };

};
export default getAccountsFromWallet;