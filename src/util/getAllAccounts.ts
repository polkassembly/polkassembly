// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise } from '@polkadot/api';
import { Signer } from '@polkadot/api/types';
import { isWeb3Injected, web3Enable } from '@polkadot/extension-dapp';
import { web3Enable as snapEnable } from '@polkagate/extension-dapp';
import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { APPNAME } from '~src/global/appName';
import { Wallet } from '~src/types';
import getEncodedAddress from './getEncodedAddress';

export type Response = {
	noExtension: boolean;
	noAccounts: boolean;
	signersMap: { [key: string]: Signer };
	accounts: InjectedAccount[];
	accountsMap: { [key: string]: string };
};

export type TGetAllAccountsParams = {
	api: ApiPromise | undefined;
	apiReady: boolean;
	network: string;
	get_erc20?: boolean;
};

export type TGetAllAccounts = (params: TGetAllAccountsParams) => Promise<Response>;

export const initResponse: Response = {
	accounts: [],
	accountsMap: {},
	noAccounts: true,
	noExtension: true,
	signersMap: {}
};

const getAllAccounts: TGetAllAccounts = async (params) => {
	const { api, apiReady, network, get_erc20 } = params;

	const getWalletAccounts = async (chosenWallet: Wallet): Promise<InjectedAccount[] | undefined> => {
		const injectedWindow = window as Window & InjectedWindow;

		let wallet = isWeb3Injected ? injectedWindow.injectedWeb3[chosenWallet] : null;

		if (!wallet) {
			wallet = Object.values(injectedWindow.injectedWeb3)[0];
		}

		if (!wallet) {
			return;
		}

		let injected: Injected | undefined;

		try {
			injected = await new Promise((resolve, reject) => {
				const timeoutId = setTimeout(() => {
					reject(new Error('Wallet Timeout'));
				}, 60000); // wait 60 sec

				if (wallet && wallet.enable) {
					wallet!
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
			console.log('Error fetching wallet accounts : ', err);
		}

		if (!injected) {
			return;
		}

		const accounts = await injected.accounts.get();

		if (accounts.length === 0) return;

		accounts.forEach((account) => {
			account.address = getEncodedAddress(account.address, network) || account.address;
		});

		return accounts;
	};

	const getMetamaskAccounts = async (): Promise<InjectedAccount[]> => {
		const ethereum = (window as any).ethereum;
		if (!ethereum) return [];

		let addresses = await ethereum.request({ method: 'eth_requestAccounts' });
		addresses = addresses.map((address: string) => address);

		if (addresses.length > 0) {
			addresses = addresses.map((address: string): InjectedAccount => {
				return {
					address: address.toLowerCase(),
					genesisHash: null,
					name: 'metamask',
					type: 'ethereum'
				};
			});
		}

		return addresses as InjectedAccount[];
	};

	const response: Response = Object.assign({}, initResponse);

	const getAccounts = async (): Promise<undefined> => {
		if (!api || !apiReady) {
			return;
		}

		const extensions = await web3Enable(APPNAME);

		/** to enable metamask snap */
		const metamaskSnap = await snapEnable('onlysnap');
		metamaskSnap && extensions.push(...metamaskSnap);

		if (extensions.length === 0) {
			response.noExtension = true;
			return;
		} else {
			response.noExtension = false;
		}

		let accounts: InjectedAccount[] = [];
		let polakadotJSAccounts: InjectedAccount[] | undefined;
		let polywalletJSAccounts: InjectedAccount[] | undefined;
		let polkagateAccounts: InjectedAccount[] | undefined;
		let polkagateSnapAccounts: InjectedAccount[] | undefined;
		let subwalletAccounts: InjectedAccount[] | undefined;
		let talismanAccounts: InjectedAccount[] | undefined;
		let metamaskAccounts: InjectedAccount[] = [];
		if (get_erc20) {
			metamaskAccounts = await getMetamaskAccounts();
		}

		const signersMapLocal = response.signersMap as { [key: string]: Signer };
		const accountsMapLocal = response.accountsMap as { [key: string]: string };

		for (const extObj of extensions) {
			if (extObj.name == 'polkadot-js') {
				signersMapLocal['polkadot-js'] = extObj.signer;
				polakadotJSAccounts = await getWalletAccounts(Wallet.POLKADOT);
			} else if (extObj.name == 'polkagate') {
				signersMapLocal['polkagate'] = extObj.signer;
				polkagateAccounts = await getWalletAccounts(Wallet.POLKAGATE);
			} else if (extObj.name == 'polkagate-snap') {
				signersMapLocal['polkagate-snap'] = extObj.signer;
				polkagateSnapAccounts = await getWalletAccounts(Wallet.POLKAGATESNAP);
			} else if (extObj.name == 'subwallet-js') {
				signersMapLocal['subwallet-js'] = extObj.signer;
				subwalletAccounts = await getWalletAccounts(Wallet.SUBWALLET);
			} else if (extObj.name == 'talisman') {
				signersMapLocal['talisman'] = extObj.signer;
				talismanAccounts = await getWalletAccounts(Wallet.TALISMAN);
			} else if (['polymesh'].includes(network) && extObj.name === 'polywallet') {
				signersMapLocal['polywallet'] = extObj.signer;
				polywalletJSAccounts = await getWalletAccounts(Wallet.POLYWALLET);
			}
		}

		if (polakadotJSAccounts) {
			accounts = accounts.concat(polakadotJSAccounts);
			polakadotJSAccounts.forEach((acc: InjectedAccount) => {
				accountsMapLocal[acc.address] = 'polkadot-js';
			});
		}

		if (['polymesh'].includes(network) && polywalletJSAccounts) {
			accounts = accounts.concat(polywalletJSAccounts);
			polywalletJSAccounts.forEach((acc: InjectedAccount) => {
				accountsMapLocal[acc.address] = 'polywallet';
			});
		}

		if (polkagateAccounts) {
			accounts = accounts.concat(polkagateAccounts);
			polkagateAccounts.forEach((acc: InjectedAccount) => {
				accountsMapLocal[acc.address] = 'polkagate';
			});
		}

		if (polkagateSnapAccounts) {
			accounts = accounts.concat(polkagateSnapAccounts);
			polkagateSnapAccounts.forEach((acc: InjectedAccount) => {
				accountsMapLocal[acc.address] = 'polkagate-snap';
			});
		}
		if (subwalletAccounts) {
			accounts = accounts.concat(subwalletAccounts);
			subwalletAccounts.forEach((acc: InjectedAccount) => {
				accountsMapLocal[acc.address] = 'subwallet-js';
			});
		}

		if (talismanAccounts) {
			accounts = accounts.concat(talismanAccounts);
			talismanAccounts.forEach((acc: InjectedAccount) => {
				accountsMapLocal[acc.address] = 'talisman';
			});
		}

		if (get_erc20 && metamaskAccounts) {
			accounts = accounts.concat(metamaskAccounts);
			metamaskAccounts.forEach((acc: InjectedAccount) => {
				accountsMapLocal[acc.address] = 'metamask';
			});
		}

		if (accounts.length === 0) {
			response.noAccounts = true;
			return;
		} else {
			response.noAccounts = false;
			response.accountsMap = accountsMapLocal;
			response.signersMap = signersMapLocal;
		}

		response.accounts = accounts;

		if (accounts.length > 0) {
			const signer: Signer = signersMapLocal[accountsMapLocal[accounts[0].address]];
			api.setSigner(signer);
		}

		return;
	};

	await getAccounts();

	return response;
};

export default getAllAccounts;
