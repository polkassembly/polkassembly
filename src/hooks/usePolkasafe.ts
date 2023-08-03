// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { InjectedWindow } from '@polkadot/extension-inject/types';
import { Polkasafe } from 'polkasafe';
import { APPNAME } from '~src/global/appName';
import { useNetworkSelector } from '~src/redux/selectors';

export default function usePolkasafe(address?:string)  {
	const client = new Polkasafe();
	const substrateAddress = getSubstrateAddress(address || '') || '';
	const { network } = useNetworkSelector();
	const wallet = localStorage.getItem('selectedWallet') || localStorage.getItem('loginWallet') || ''; // if user is not login only then
	const injectedWindow = window as Window & InjectedWindow;
	const selectedWallet = injectedWindow.injectedWeb3[wallet];
	const connect = async () => {
		const injected = selectedWallet && selectedWallet.enable && await selectedWallet.enable(APPNAME);
		if(!injected){
			throw new Error('Internal Error');
		}
		await client.connect(network, substrateAddress, injected);
	};

	return { client, connect };
}
