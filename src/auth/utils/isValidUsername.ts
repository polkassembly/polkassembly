// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export default function isValidUsername(username: string): boolean {
	const regexp = /^[A-Za-z0-9]{1}[A-Za-z0-9.-_]{2,29}$/;
	return regexp.test(username);
}
