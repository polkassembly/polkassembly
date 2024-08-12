// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { IClaimPayoutStore } from './@types';

const initialState: IClaimPayoutStore = {
	claimPayoutAvailable: false,
	payouts: []
};

export const claimPayoutStore = createSlice({
	extraReducers: (builder) => {
		builder.addCase(HYDRATE, (state, action) => {
			return {
				...state,
				...(action as PayloadAction<any>).payload.claimPayout
			};
		});
	},
	initialState,
	name: 'claimPayout',
	reducers: {
		resetPayouts: (state) => {
			state.claimPayoutAvailable = false;
			state.payouts = [];
		},
		setPayoutDetails: (state, action: PayloadAction<IClaimPayoutStore>) => {
			state.claimPayoutAvailable = action.payload.claimPayoutAvailable;
			state.payouts = action.payload.payouts;
		}
	}
});
const claimPayoutActions = claimPayoutStore.actions;

export default claimPayoutStore.reducer;
export { claimPayoutActions };
