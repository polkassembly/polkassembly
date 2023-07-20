// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { encodeAddress } from '@polkadot/util-crypto';

/**
 * Return an address encoded for the current network
 *
 * @param address An address
 *
 */
export default function getSubstrateAddress(address: string): string | null {
	if (address.startsWith('0x')) return address;

	try {
		return encodeAddress(address, 42);
	} catch (e) {
		// console.error('getSubstrateAddress error', e);
		return null;
	}
}
