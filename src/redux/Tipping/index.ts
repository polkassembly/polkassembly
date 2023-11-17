// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { ITippingStore } from './@types';

const initialState: ITippingStore = {
	receiverAddress: ''
};

export const tippingStore = createSlice({
	extraReducers: (builder) => {
		builder.addCase(HYDRATE, (state, action) => {
			return {
				...state,
				...(action as PayloadAction<any>).payload.network
			};
		});
	},
	initialState,
	name: 'tipping',
	reducers: {
		setReceiver: (state, action: PayloadAction<string>) => {
			state.receiverAddress = action.payload;
		}
	}
});
const tippingActions = tippingStore.actions;

const setReceiver: any = (network: string) => {
	return (dispatch: any) => {
		dispatch(tippingActions.setReceiver(network));
	};
};
export default tippingStore.reducer;
export { setReceiver, tippingActions };
