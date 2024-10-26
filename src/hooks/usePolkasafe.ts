// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { InjectedWindow } from '@polkadot/extension-inject/types';
import { Polkasafe } from 'polkasafe';
import { APPNAME } from '~src/global/appName';
import messages from '~src/util/messages';
import { useNetworkSelector } from '~src/redux/selectors';

export default function usePolkasafe(address?: string) {
	const client = new Polkasafe();
	const { network } = useNetworkSelector();
	const connect = async () => {
		const injectedWindow = window as Window & InjectedWindow;
		const wallet = localStorage.getItem('selectedWallet') || localStorage.getItem('loginWallet') || ''; // if user is not login only then
		const selectedWallet = injectedWindow?.injectedWeb3?.[wallet];
		const injected = selectedWallet && selectedWallet.enable && (await selectedWallet.enable(APPNAME));
		if (!injected) {
			throw new Error(messages.WALLET_NOT_FOUND);
		}
		const substrateAddress = getSubstrateAddress(address || '') || '';
		client.setPolkasafeClient(network, substrateAddress, injected);
	};

	return { client, connect };
}
