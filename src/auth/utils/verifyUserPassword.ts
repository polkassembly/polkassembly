// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import * as argon2 from 'argon2';

export default function verifyUserPassword(correctPassword: string, password: string): Promise<boolean> {
	return argon2.verify(correctPassword, password);
}
