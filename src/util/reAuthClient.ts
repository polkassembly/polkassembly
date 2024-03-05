// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { dayjs } from 'dayjs-init';
import { decodeToken } from 'react-jwt';
import { IAuthResponse, IRefreshTokenPayload, JWTPayloadType } from '~src/auth/types';
import { getLocalStorageToken, storeLocalStorageToken } from '~src/services/auth.service';
import getCookieValueByName from './getCookieValueByName';
import getNetwork from './getNetwork';
import { setUserDetailsState } from '~src/redux/userDetails';
import { store } from '~src/redux/store';

export default async function reAuthClient() {
	try {
		//check if current access token is valid
		const access_token = getLocalStorageToken() || '';
		const { exp = null } = decodeToken<JWTPayloadType>(access_token) || {};

		// if access token is valid: early return, no need to re-auth
		if (access_token && exp && dayjs().isBefore(dayjs.unix(exp))) return access_token;

		// access token is invalid, now if valid refresh_token is available, try to re-auth
		const refresh_token = getCookieValueByName('refresh_token');
		const { exp: refreshTokenExp = null, login_address: refreshTokenLoginAddress, login_wallet: refreshTokenLoginWallet } = decodeToken<IRefreshTokenPayload>(refresh_token) || {};

		// if valid refresh_token
		if (refresh_token && refreshTokenExp && dayjs().isBefore(dayjs.unix(refreshTokenExp))) {
			// try to re-auth
			const newAccessTokenRes = await fetch(`${window.location.origin}/api/v1/auth/actions/refreshAccessToken`, {
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
					'x-api-key': process.env.NEXT_PUBLIC_POLKASSEMBLY_API_KEY || '',
					'x-network': getNetwork()
				},
				method: 'POST'
			});

			const { token } = ((await newAccessTokenRes.json()) || {}) as IAuthResponse;

			if (token) {
				const {
					addresses = [],
					default_address = '',
					roles = {
						allowedRoles: [],
						currentRole: []
					},
					sub: id,
					username = '',
					email = '',
					email_verified = false,
					web3signup = false,
					is2FAEnabled = false,
					login_address = '',
					login_wallet = ''
				} = decodeToken<JWTPayloadType>(token) || ({} as JWTPayloadType);

				storeLocalStorageToken(token);
				store.dispatch(
					setUserDetailsState({
						addresses,
						allowed_roles: roles.allowedRoles,
						defaultAddress: default_address,
						email,
						email_verified,
						id: Number(id),
						is2FAEnabled,
						loginAddress: login_address || refreshTokenLoginAddress || '',
						loginWallet: login_wallet || refreshTokenLoginWallet || '',
						username,
						web3signup
					})
				);

				return token;
			}
		}
	} catch (e) {
		console.log('Error in re-authenticating, please try again :', e);
	}
}
