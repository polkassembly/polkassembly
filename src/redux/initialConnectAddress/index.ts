// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { IinitialConnectAddress } from './@types';

const initialState: IinitialConnectAddress = {
	address: '',
	availableBalance: '0'
};

export const initialConnectAddressStore = createSlice({
	initialState,
	name: 'initialConnectAddress',
	reducers: {
		setClearInitialState: (state) => {
			state.address = '';
			state.availableBalance = '0';
		},
		setConnectAddress: (state, action: PayloadAction<string>) => {
			state.address = action.payload;
		},
		setInitialAvailableBalance: (state, action: PayloadAction<string>) => {
			state.availableBalance = action.payload;
		}
	}
});

const initialConnectAddressActions = initialConnectAddressStore.actions;

const setConnectAddress: any = (address: string) => {
	return (dispatch: any) => {
		dispatch(initialConnectAddressActions.setConnectAddress(address));
	};
};
const setInitialAvailableBalance: any = (value: string) => {
	return (dispatch: any) => {
		dispatch(initialConnectAddressActions.setInitialAvailableBalance(value));
	};
};

export { setConnectAddress, setInitialAvailableBalance };
