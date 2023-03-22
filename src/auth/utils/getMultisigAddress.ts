// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { u8aSorted } from '@polkadot/util';
import { blake2AsU8a, decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';

const derivePubkey = (addresses: string[], threshold = 1): Uint8Array => {
	const prefix = 'modlpy/utilisuba';
	const payload = new Uint8Array(prefix.length + 1 + 32 * addresses.length + 2);
	payload.set(
		Array.from(prefix).map((c) => c.charCodeAt(0)),
		0
	);
	payload[prefix.length] = addresses.length << 2;
	const pubkeys = addresses.map((addr) => decodeAddress(addr));
	u8aSorted(pubkeys).forEach((pubkey, idx) => {
		payload.set(pubkey, prefix.length + 1 + idx * 32);
	});
	payload[prefix.length + 1 + 32 * addresses.length] = threshold;

	return blake2AsU8a(payload);
};

/**
 * getMultisigAddress
 *
 * @param addresses list of the addresses.
 * @param ss58Prefix Prefix for the network encoding to use.
 * @param threshold Number of addresses that are needed to approve an action.
 * @returns multisig address
 */
export default function getMultisigAddress(addresses: string[], ss58Prefix: number, threshold: number): string {
	if (!addresses) throw apiErrorWithStatusCode('Please provide the addresses option.', 400);

	const pubkey = derivePubkey(addresses, Number(threshold));
	const msig = encodeAddress(pubkey, Number(ss58Prefix));

	return msig;
}
