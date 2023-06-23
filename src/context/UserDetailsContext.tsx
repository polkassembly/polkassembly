// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import WalletConnectProvider from '@walletconnect/web3-provider';
import React, { createContext, useState } from 'react';
import { decodeToken } from 'react-jwt';

import { JWTPayloadType } from '~src/auth/types';

import { getLocalStorageToken } from '../services/auth.service';
import { UserDetailsContextType } from '../types';

const initialUserDetailsContext : UserDetailsContextType = {
	addresses: [],
	allowed_roles: [],
	defaultAddress: '',
	delegationDashboardAddress:'',
	email: null,
	email_verified: false,
	id: null,
	is2FAEnabled: false,
	isLoggedOut: (): boolean => {
		throw new Error('isLoggedIn function must be overridden');
	},
	loginAddress: '',
	loginWallet: null,
	networkPreferences:{
		channelPreferences: {},
		triggerPreferences:{}
	},
	picture: null,
	primaryNetwork:'',
	setUserDetailsContextState : (): void => {
		throw new Error('setUserDetailsContextState function must be overridden');
	},
	setWalletConnectProvider: (): void => {
		throw new Error('setWalletConnectLogin function must be overridden');
	},
	username: null,
	walletConnectProvider: null,
	web3signup: false
};

const accessToken = getLocalStorageToken();
try {
	const tokenPayload = accessToken && decodeToken<JWTPayloadType>(accessToken);

	if (tokenPayload && tokenPayload.sub) {
		const {
			addresses,
			default_address,
			is2FAEnabled = false,
			roles,
			sub: id,
			username,
			email,
			email_verified,
			web3signup
		} = tokenPayload as JWTPayloadType;

		if (id) {
			initialUserDetailsContext.id = Number(id);
		}
		if (username) {
			initialUserDetailsContext.username = username;
		}
		if (email) {
			initialUserDetailsContext.email = email;
		}
		initialUserDetailsContext.email_verified = email_verified || false;

		initialUserDetailsContext.addresses = addresses;
		initialUserDetailsContext.defaultAddress = default_address;
		initialUserDetailsContext.allowed_roles = roles.allowedRoles;
		initialUserDetailsContext.web3signup = web3signup || false;
		initialUserDetailsContext.is2FAEnabled = is2FAEnabled;
	}
} catch {
	//do nothing, the user will be authenticated as soon as there's a new call to the server.
}

export const UserDetailsContext = createContext(initialUserDetailsContext);

export const UserDetailsProvider = ({ children }: React.PropsWithChildren<{}>) => {

	const [userDetailsContextState, setUserDetailsContextState] = useState(initialUserDetailsContext);
	const [walletConnectProvider, setWalletConnectProvider] = useState<WalletConnectProvider | null>(null);

	const isLoggedOut = () => {
		return userDetailsContextState.id === null || userDetailsContextState.id === undefined;
	};

	return (
		<UserDetailsContext.Provider value={{ ...userDetailsContextState, isLoggedOut, setUserDetailsContextState, setWalletConnectProvider, walletConnectProvider }}>
			{children}
		</UserDetailsContext.Provider>
	);
};
