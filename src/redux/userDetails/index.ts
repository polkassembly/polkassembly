// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getLocalStorageToken } from '~src/services/auth.service';
import { IUserDetailsStore } from './@types';
import { JWTPayloadType } from '~src/auth/types';
import { Wallet } from '~src/types';
import { decodeToken } from 'react-jwt';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import WalletConnectProvider from '@walletconnect/web3-provider';

const initialState: IUserDetailsStore = {
	addresses: [],
	allowed_roles: [],
	defaultAddress: '',
	delegationDashboardAddress: '',
	email: null,
	email_verified: false,
	id: null,
	is2FAEnabled: false,
	loginAddress: '',
	loginWallet: null,
	multisigAssociatedAddress: '',
	networkPreferences: {
		channelPreferences: {},
		triggerPreferences: {}
	},
	picture: null,
	primaryNetwork: '',
	username: null,
	walletConnectProvider: null,
	web3signup: false
};

export const deleteLocalStorageToken = (): void => {
	if (typeof window !== 'undefined') {
		return localStorage.removeItem('Authorization');
	}
};

try {
	const accessToken = getLocalStorageToken();

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
			web3signup,
			login_address,
			login_wallet
		} = tokenPayload as JWTPayloadType;

		if (id) {
			initialState.id = Number(id);
		}
		if (username) {
			initialState.username = username;
		}
		if (email) {
			initialState.email = email;
		}
		initialState.email_verified = email_verified || false;

		initialState.addresses = addresses;
		initialState.defaultAddress = default_address;
		initialState.allowed_roles = roles.allowedRoles;
		initialState.web3signup = web3signup || false;
		initialState.is2FAEnabled = is2FAEnabled;
		initialState.loginAddress = login_address || window?.localStorage?.getItem('loginAddress') || '';
		initialState.loginWallet = login_wallet || (window?.localStorage?.getItem('loginWallet') as Wallet) || null;
	}
} catch {
	//do nothing, the user will be authenticated as soon as there's a new call to the server.
}
export const userDetailsStore = createSlice({
	extraReducers: (builder) => {
		builder.addCase(HYDRATE, (state, action) => {
			return {
				...state,
				...(action as PayloadAction<any>).payload.userDetails
			};
		});
	},
	initialState,
	name: 'userDetails',
	reducers: {
		setLogout: (state) => {
			deleteLocalStorageToken();
			localStorage.removeItem('delegationDashboardAddress');
			localStorage.removeItem('delegationWallet');
			localStorage.removeItem('loginWallet');
			localStorage.removeItem('loginAddress');
			localStorage.removeItem('identityWallet');
			localStorage.removeItem('identityAddress');
			localStorage.removeItem('identityForm');

			state.addresses = [];
			state.allowed_roles = [];
			state.defaultAddress = null;
			state.email = null;
			state.email_verified = false;
			state.id = null;
			state.loginAddress = '';
			state.loginWallet = null;
			state.networkPreferences = {
				channelPreferences: {},
				triggerPreferences: {}
			};
			state.username = null;
			state.web3signup = false;
		},
		setUserDetailsState: (state, action: PayloadAction<IUserDetailsStore>) => {
			state.addresses = action.payload.addresses;
			state.allowed_roles = action.payload.allowed_roles;
			state.defaultAddress = action.payload.defaultAddress;
			state.delegationDashboardAddress = action.payload.delegationDashboardAddress;
			state.email = action.payload.email;
			state.email_verified = action.payload.email_verified;
			state.id = action.payload.id;
			state.is2FAEnabled = action.payload.is2FAEnabled;
			state.loginAddress = action.payload.loginAddress;
			state.loginWallet = action.payload.loginWallet;
			state.multisigAssociatedAddress = action.payload.multisigAssociatedAddress;
			state.networkPreferences = action.payload.networkPreferences;
			state.picture = action.payload.picture;
			state.primaryNetwork = action.payload.primaryNetwork;
			state.username = action.payload.username;
			state.walletConnectProvider = action.payload.walletConnectProvider;
			state.web3signup = action.payload.web3signup;
		},
		setWalletConnectProvider: (state, action: PayloadAction<WalletConnectProvider | null>) => {
			state.walletConnectProvider = action.payload;
		}
	}
});

const Logout: any = () => {
	return (dispatch: any) => {
		dispatch(userDetailsActions.setLogout());
	};
};

const setUserDetailsState: any = (userDetails: IUserDetailsStore) => {
	return (dispatch: any) => {
		dispatch(userDetailsActions.setUserDetailsState(userDetails));
	};
};
const setWalletConnectProvider: any = (wcPprovider: WalletConnectProvider | null) => {
	return (dispatch: any) => {
		dispatch(userDetailsActions.setWalletConnectProvider(wcPprovider));
	};
};

export default userDetailsStore.reducer;
const userDetailsActions = userDetailsStore.actions;
export { Logout, setUserDetailsState, setWalletConnectProvider, userDetailsActions };
