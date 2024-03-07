// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
export function shortenString(str: string) {
	const maxLength = 10;

	if (str.length > maxLength) {
		return str.substring(0, 10) + '...' + str.substring(str.length - 10);
	}
	return str;
}
