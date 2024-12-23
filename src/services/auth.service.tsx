// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { decodeToken } from 'react-jwt';

import { JWTPayloadType } from '~src/auth/types';

import { IUserDetailsStore } from '~src/redux/userDetails/@types';
import { Dispatch } from 'react';
import { AnyAction } from '@reduxjs/toolkit';
import { setUserDetailsState } from '~src/redux/userDetails';

/**
 * Store the JWT token in localstorage
 * @param token the token received from the authentication header
 */
export const storeLocalStorageToken = (token: string) => {
	if (typeof window !== 'undefined') {
		localStorage.setItem('Authorization', token);
	}
};

/**
 * Get the the jwt from localstorage
 * if any. It might be expired
 */
export const getLocalStorageToken = (): string | null => {
	if (typeof window !== 'undefined') {
		return localStorage.getItem('Authorization') || null;
	}

	return null;
};

/**
 * Remove the the jwt from localstorage
 * if any.
 */
export const deleteLocalStorageToken = (): void => {
	if (typeof window !== 'undefined') {
		return localStorage.removeItem('Authorization');
	}
};

/**
 * Store the user information in local context and call the function to store the received token
 * @param token answered by the auth server
 * @param currentUser context data on the user
 */
export const handleTokenChange = (token: string, currentUser: IUserDetailsStore, dispatch: Dispatch<AnyAction>) => {
	token && storeLocalStorageToken(token);
	try {
		const tokenPayload: any = token && decodeToken<JWTPayloadType>(token);

		if (tokenPayload && tokenPayload.sub) {
			const {
				addresses,
				default_address,
				roles,
				sub: id,
				username,
				email,
				email_verified,
				web3signup,
				is2FAEnabled = false,
				login_address,
				login_wallet
			} = tokenPayload as JWTPayloadType;

			dispatch(
				setUserDetailsState({
					...currentUser,
					addresses,
					allowed_roles: roles.allowedRoles,
					defaultAddress: default_address,
					email,
					email_verified,
					id: Number(id),
					is2FAEnabled,
					loginAddress: login_address || currentUser?.loginAddress || '',
					loginWallet: login_wallet || currentUser.loginWallet || currentUser.loginWallet,
					username,
					web3signup
				})
			);
		}
	} catch (error) {
		console.error(error);
	}
};
