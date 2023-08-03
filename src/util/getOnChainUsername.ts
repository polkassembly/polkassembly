// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise } from '@polkadot/api';
import { getKiltDidName } from './kiltDid';

/**
 * If the address has an on-chain username, it returns the user's username else empty string
 * @param  {ApiPromise} api The polkadot js api promise
 * @param  {String} address The web3 address
 * @param  {Boolean} getWeb3Name If true, it will return the web3 name formatted as w3n:${web3Name} instead of the on-chain username
 */
export default async function getOnChainUsername(api:ApiPromise, address:string, getWeb3Name: boolean = false): Promise<string> {
	if(getWeb3Name) {
		const web3Name = await getKiltDidName(api, address);
		return web3Name ? `w3n:${web3Name}` : '';
	}

	const accountInfo = await api.derive.accounts.info(address);
	return accountInfo.identity.displayParent || accountInfo.identity.display || '';
}