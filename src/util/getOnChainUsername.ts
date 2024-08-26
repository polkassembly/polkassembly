// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise } from '@polkadot/api';
import { getKiltDidName } from './kiltDid';

interface Args {
	api?: ApiPromise;
	address: string;
	getWeb3Name: boolean;
}

/**
 * If the address has an on-chain username, it returns the user's username else empty string
 * @param  {ApiPromise} api The polkadot js api promise
 * @param  {String} address The web3 address
 * @param  {Boolean} getWeb3Name If true, it will return the web3 name formatted as w3n:${web3Name}. The on-chain username will be returned if there is no web3 name
 */
export default async function getOnChainUsername({ api, address, getWeb3Name = false }: Args): Promise<string> {
	if (!api) return '';

	if (getWeb3Name) {
		const web3Name = await getKiltDidName(api, address);
		if (web3Name) return `w3n:${web3Name}`;
	}

	await api.isReady;

	const accountInfo = await api.query.identity?.identityOf(address).then((res: any) => res?.toHuman()?.[0]);
	return accountInfo?.displayParent || accountInfo?.display || '';
}
