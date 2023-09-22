// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { INetworkStore } from './@types';

const initialState: INetworkStore = {
	network: ''
};

export const networkStore = createSlice({
	extraReducers: (builder) => {
		builder.addCase(HYDRATE, (state, action) => {
			return {
				...state,
				...(action as PayloadAction<any>).payload.network
			};
		});
	},
	initialState,
	name: 'network',
	reducers: {
		setNetwork: (state, action: PayloadAction<string>) => {
			state.network = action.payload;
		}
	}
});

export default networkStore.reducer;
const networkActions = networkStore.actions;
export { networkActions };
