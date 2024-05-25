// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { IPeopleKusamaApi } from './@types';

const initialState: IPeopleKusamaApi = {
	peopleKusamaApi: null,
	peopleKusamaApiReady: false
};

export const peopleKusamaApiStore = createSlice({
	extraReducers: (builder) => {
		builder.addCase(HYDRATE, (state, action) => {
			return {
				...state,
				...(action as PayloadAction<any>).payload.peopleKusamaApi
			};
		});
	},
	initialState,
	name: 'peopleKusamaApi',
	reducers: {
		setPeopleKusamaApi: (state, action: PayloadAction<IPeopleKusamaApi>) => {
			state.peopleKusamaApi = action.payload.peopleKusamaApi || null;
			state.peopleKusamaApiReady = action.payload.peopleKusamaApiReady || false;
		}
	}
});
const peopleKusamaApiActions = peopleKusamaApiStore.actions;

export default peopleKusamaApiStore.reducer;
export { peopleKusamaApiActions };
