// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { encodeAddress } from '@polkadot/util-crypto';
import { chainProperties } from 'src/global/networkConstants';

/**
 * Return an address encoded for the current network
 *
 * @param address An address
 *
 */
export default function getEncodedAddress(address: any, network: string): string | null {
	const ss58Format = chainProperties?.[network]?.ss58Format;

	if (!address) {
		return null;
	}

	if (!network || ss58Format === undefined) {
		return null;
	}

	const newAddress = address?.value || address;

	if (newAddress.length) {
		if (newAddress?.startsWith('0x')) return newAddress;
	}

	try {
		return encodeAddress(newAddress, ss58Format);
	} catch (e) {
		console.error('getEncodedAddress error', e);
		return null;
	}
}
