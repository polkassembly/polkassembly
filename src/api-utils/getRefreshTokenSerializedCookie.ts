// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { serialize } from 'cookie';
import { REFRESH_TOKEN_COOKIE_OPTIONS } from '~src/global/refreshToken';

export default function getRefreshTokenSerializedCookie(refresh_token: string) {
	return serialize('refresh_token', refresh_token, REFRESH_TOKEN_COOKIE_OPTIONS);
}
