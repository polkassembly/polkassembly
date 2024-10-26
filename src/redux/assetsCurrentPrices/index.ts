// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { IAssetsCurrentPriceStore } from './@types';

const initialState: IAssetsCurrentPriceStore = {
	dedTokenUsdPrice: '0'
};

export const assetsCurrentPriceStore = createSlice({
	extraReducers: (builder) => {
		builder.addCase(HYDRATE, (state, action) => {
			return {
				...state,
				...(action as PayloadAction<any>).payload.assetsCurrentPrice
			};
		});
	},
	initialState,
	name: 'assetsCurrentPrice',
	reducers: {
		setDEDTokenPrice: (state, action: PayloadAction<string>) => {
			state.dedTokenUsdPrice = action.payload;
		}
	}
});
const assetsCurrentPriceActions = assetsCurrentPriceStore.actions;

export default assetsCurrentPriceStore.reducer;
export { assetsCurrentPriceActions };
