// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useMultisigAtom } from '../atoms/multisigAtom';
import { useEffect } from 'react';
import { IProxy } from '../type';
import { IMultisig } from '../type';
import { MultisigService } from '../service';

/**
 * @description This hook is used to setup the multisig and proxy addresses for the current user
 * @param {Object} props - The props object
 * @param {Array<string>} props.userAddress - The user address
 * @returns {null}
 */
function useSetupMultisigProxy({ userAddress }: { userAddress: Array<string> }) {
	const { multisigAndProxy, setMultisigAndProxy } = useMultisigAtom();

	const fetchMultisigAndProxy = async () => {
		if (!userAddress || !userAddress.length) {
			console.log('user address not found');
			return;
		}

		const userAddressWithProxy: { [index: string]: { multisig: Array<IMultisig>; proxy: Array<IProxy>; proxiedBy: Array<IProxy> } } = {};

		for (const address of userAddress) {
			console.log('address', address);
			if (!address) continue;
			userAddressWithProxy[address] = await MultisigService.fetchMultisigAndProxyAddresses(address);
		}

		console.log('userAddressWithProxy', userAddressWithProxy);

		setMultisigAndProxy(userAddressWithProxy);
	};

	useEffect(() => {
		console.log('fetching multisig and proxy');
		if (multisigAndProxy) {
			console.log('multisig and proxy already fetched');
			return;
		}
		try {
			fetchMultisigAndProxy();
		} catch (error) {
			console.error('Error fetching multisig and proxy', error);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userAddress]);
	return null;
}

export default useSetupMultisigProxy;
