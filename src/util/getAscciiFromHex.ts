// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
const getAscciiFromHex = (hex: string) => {
	const regex = /^0x[0-9a-fA-F]+$/i;

	if (!regex.test(hex)) {
		return hex;
	}

	let sb = '';

	//remove 0x from starting of hex
	hex = hex.substring(2);

	for (let i = 0; i < hex.length; i += 2) {
		const str = hex.substring(i, i + 2);
		const ch = String.fromCharCode(parseInt(str, 16));
		sb += ch;
	}

	return sb;
};

export default getAscciiFromHex;
