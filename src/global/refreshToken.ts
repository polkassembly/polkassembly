// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CookieSerializeOptions } from 'cookie';

const REFRESH_TOKEN_LIFE_IN_SECONDS = 60 * 60 * 24 * 7 * 4; // 4 weeks

const REFRESH_TOKEN_COOKIE_OPTIONS: CookieSerializeOptions = {
	httpOnly: false,
	maxAge: REFRESH_TOKEN_LIFE_IN_SECONDS,
	path: '/',
	sameSite: true,
	secure: process.env.NEXT_PUBLIC_APP_ENV === 'production'
};

export { REFRESH_TOKEN_COOKIE_OPTIONS, REFRESH_TOKEN_LIFE_IN_SECONDS };
