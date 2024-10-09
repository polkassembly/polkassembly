// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import getEncodedAddress from './getEncodedAddress';

export function getProposerAddressFromFirestorePostData(data: any, network: string) {
	let proposer_address = '';
	if (data) {
		if (Array.isArray(data?.proposer_address)) {
			if (data.proposer_address.length > 0) {
				proposer_address = data?.proposer_address?.[0];
			}
		} else if (typeof data.proposer_address === 'string') {
			proposer_address = data.proposer_address;
		}
		if (data?.default_address && !proposer_address) {
			proposer_address = data?.default_address;
		}
	}

	if (proposer_address.startsWith('0x')) {
		return proposer_address;
	}

	if (proposer_address) {
		const encodedAddress = getEncodedAddress(proposer_address, network);
		return encodedAddress || proposer_address;
	}
}
