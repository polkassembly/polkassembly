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
import getMetamaskAccounts from './getMetamaskAccounts';
// import { network as AllNetworks } from '~src/global/networkConstants';

interface Props {
	network: string;
	api: ApiPromise;
	apiReady: boolean;
	loginAddress: string;
	chosenWallet: Wallet;
	chosenAddress?: string;
	setExtentionOpen?: (pre: boolean) => void;
}

const getAccountsFromWallet = async ({
	network,
	api,
	apiReady,
	loginAddress,
	chosenWallet,
	chosenAddress,
	setExtentionOpen
}: Props): Promise<{ accounts: InjectedAccount[]; account: string } | undefined> => {
	// let ethereum = null;
	// switch (chosenWallet) {
	// case Wallet.TALISMAN:
	// ethereum = (window as any).talismanEth;
	// break;
	// case Wallet.SUBWALLET:
	// ethereum = (window as any).SubWallet;
	// break;
	// case Wallet.NOVAWALLET:
	// ethereum = (window as any)?.ethereum;
	// break;
	// }
	// if (chosenWallet === Wallet.METAMASK || (!!ethereum && [AllNetworks.MOONRIVER, AllNetworks.MOONBASE, AllNetworks.MOONBEAM, AllNetworks.LAOSSIGMA].includes(network))) {
	if (chosenWallet === Wallet.METAMASK) {
		const accountData = await getMetamaskAccounts({ chosenWallet, loginAddress, network });
		return { account: accountData?.account || chosenAddress || '', accounts: (accountData?.accounts || []) as InjectedAccount[] };
	} else {
		const injectedWindow = window as Window & InjectedWindow;

		const wallet = isWeb3Injected ? injectedWindow.injectedWeb3[chosenWallet] : null;

		if (!wallet || !api || !apiReady) {
			setExtentionOpen?.(true);
			return;
		}

		let injected: Injected | undefined;
		try {
			injected = await new Promise((resolve, reject) => {
				const timeoutId = setTimeout(() => {
					reject(new Error('Wallet Timeout'));
				}, 60000); // wait 60 sec

				if (wallet && wallet.enable) {
					wallet
						.enable(APPNAME)
						.then((value) => {
							clearTimeout(timeoutId);
							resolve(value);
						})
						.catch((error) => {
							reject(error);
						});
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
			if (api) {
				api.setSigner(injected.signer);
			}
		}
		const choosenSubstrateAddress = getSubstrateAddress(chosenAddress || '') || '';

		return { account: choosenSubstrateAddress || accounts[0].address, accounts };
	}
};
export default getAccountsFromWallet;
