// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Signer } from '@polkadot/api/types';
import { isWeb3Injected, web3Enable } from '@polkadot/extension-dapp';
import {
	Injected,
	InjectedAccount,
	InjectedWindow
} from '@polkadot/extension-inject/types';
import { useContext, useEffect, useState } from 'react';
import { ApiContext } from 'src/context/ApiContext';
import { APPNAME } from 'src/global/appName';
import { Wallet } from 'src/types';
import getEncodedAddress from 'src/util/getEncodedAddress';

import { useNetworkContext } from '~src/context';

type Response = {
  noExtension: boolean;
  noAccounts: boolean;
  signersMap: { [key: string]: Signer };
  accounts: InjectedAccount[];
  accountsMap: { [key: string]: string };
};

const initResponse: Response = {
	accounts: [],
	accountsMap: {},
	noAccounts: true,
	noExtension: true,
	signersMap: {}
};

const useGetAllAccounts = (get_erc20?: boolean) => {
	const { api, apiReady } = useContext(ApiContext);
	const { network } = useNetworkContext();

	const [response, setResponse] = useState<Response>(initResponse);

	const getWalletAccounts = async (
		chosenWallet: Wallet
	): Promise<InjectedAccount[] | undefined> => {
		const injectedWindow = window as Window & InjectedWindow;

		let wallet = isWeb3Injected
			? injectedWindow.injectedWeb3[chosenWallet]
			: null;

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
			account.address =
        getEncodedAddress(account.address, network) || account.address;
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

	const getAccounts = async (): Promise<undefined> => {
		if (!api || !apiReady) {
			return;
		}

		const extensions = await web3Enable(APPNAME);

		const responseLocal: Response = Object.assign({}, initResponse);

		if (extensions.length === 0) {
			responseLocal.noExtension = true;
			setResponse(responseLocal);
			return;
		} else {
			responseLocal.noExtension = false;
		}

		let accounts: InjectedAccount[] = [];
		let polakadotJSAccounts: InjectedAccount[] | undefined;
		let polywalletJSAccounts: InjectedAccount[] | undefined;
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
			} else if (extObj.name == 'subwallet-js') {
				signersMapLocal['subwallet-js'] = extObj.signer;
				subwalletAccounts = await getWalletAccounts(Wallet.SUBWALLET);
			} else if (extObj.name == 'talisman') {
				signersMapLocal['talisman'] = extObj.signer;
				talismanAccounts = await getWalletAccounts(Wallet.TALISMAN);
			} else if (
				['polymesh'].includes(network) &&
        extObj.name === 'polywallet'
			) {
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
			responseLocal.noAccounts = true;
			setResponse(responseLocal);
			return;
		} else {
			responseLocal.noAccounts = false;
			responseLocal.accountsMap = accountsMapLocal;
			responseLocal.signersMap = signersMapLocal;
		}

		responseLocal.accounts = accounts;

		setResponse(responseLocal);

		if (accounts.length > 0) {
			const signer: Signer =
        signersMapLocal[accountsMapLocal[accounts[0].address]];
			api.setSigner(signer);
		}

		return;
	};

	useEffect(() => {
		getAccounts();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady]);

	return response;
};

export default useGetAllAccounts;
