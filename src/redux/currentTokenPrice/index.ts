// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { ICurrentTokenPriceStore } from './@types';

const initialState: ICurrentTokenPriceStore = {
	currentTokenPrice: ''
};

export const currentTokenPriceStore = createSlice({
	extraReducers: (builder) => {
		builder.addCase(HYDRATE, (state, action) => {
			return {
				...state,
				...(action as PayloadAction<any>).payload.network
			};
		});
	},
	initialState,
	name: 'currentTokenPrice',
	reducers: {
		setCurrentTokenPrice: (state, action: PayloadAction<string>) => {
			state.currentTokenPrice = action.payload;
		}
	}
});
const currentTokenPriceActions = currentTokenPriceStore.actions;

const setCurrentTokenPrice: any = (price: string) => {
	return (dispatch: any) => {
		dispatch(currentTokenPriceActions.setCurrentTokenPrice(price));
	};
};

export default currentTokenPriceStore.reducer;
export { setCurrentTokenPrice, currentTokenPriceActions };
