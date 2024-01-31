// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { IDelegationDashboard } from './@types';

const initialState: IDelegationDashboard = {
	address: ''
};

export const delegationDashboardStore = createSlice({
	initialState,
	name: 'delegationDashboard',
	reducers: {
		setClearInitialState: (state) => {
			state.address = '';
		},
		setDelegationDashboardAddress: (state, action: PayloadAction<string>) => {
			state.address = action.payload;
		}
	}
});

const initialConnectAddressActions = delegationDashboardStore.actions;

const setDelegationDashboardAddress: any = (address: string) => {
	return (dispatch: any) => {
		dispatch(initialConnectAddressActions.setDelegationDashboardAddress(address));
	};
};

export { setDelegationDashboardAddress };
