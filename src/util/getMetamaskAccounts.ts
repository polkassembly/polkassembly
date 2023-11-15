// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Wallet } from '~src/types';
import addEthereumChain from './addEthereumChain';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import getSubstrateAddress from './getSubstrateAddress';
interface Props {
	chosenWallet: Wallet;
	network: string;
	loginAddress: string;
}

const getMetamaskAccounts = async ({
	chosenWallet,
	network,
	loginAddress
}: Props): Promise<{ accounts: InjectedAccountWithMeta[]; account: string; isTalismanEthereum: boolean } | undefined> => {
	let isTalismanEthereum = true;

	const ethereum = chosenWallet === Wallet.TALISMAN ? (window as any).talismanEth : (window as any).ethereum;

	if (!ethereum) {
		return;
	}

	try {
		await addEthereumChain({
			ethereum,
			network
		});
	} catch (error) {
		return;
	}

	const addresses = await ethereum.request({ method: 'eth_requestAccounts' });

	if (addresses.length === 0) {
		return;
	}
	if (chosenWallet === Wallet.TALISMAN && addresses.filter((address: string) => address.slice(0, 2) === '0x').length === 0) {
		isTalismanEthereum = false;
	}

	const accounts = addresses.map((address: string): InjectedAccountWithMeta => {
		const account = {
			address,
			meta: {
				genesisHash: null,
				name: 'metamask',
				source: 'metamask'
			}
		};

		return account;
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
	return {
		account: accounts[0].address,
		accounts,
		isTalismanEthereum
	};
};

export default getMetamaskAccounts;
