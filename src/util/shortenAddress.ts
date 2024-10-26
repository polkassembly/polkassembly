// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export default function shortenAddress(address: string, shortenAddressLength: number = 4) {
	if (!address || address.length < 8) {
		return address;
	}

	return `${address.substring(0, shortenAddressLength)}...${address.substring(address.length - shortenAddressLength)}`;
}
