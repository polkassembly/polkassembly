// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { IGlobalStore } from './@types';

const initialState: IGlobalStore = {
	is_bio_changed: false,
	is_profile_changed: false,
	is_sidebar_collapsed: false,
	is_tag_changed: false,
	is_title_changed: false
};

export const globalStore = createSlice({
	extraReducers: (builder) => {
		builder.addCase(HYDRATE, (state, action) => {
			return {
				...state,
				...(action as PayloadAction<any>).payload.global
			};
		});
	},
	initialState,
	name: 'global',
	reducers: {
		reset: (state) => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			state = {
				is_bio_changed: false,
				is_profile_changed: false,
				is_sidebar_collapsed: false,
				is_tag_changed: false,
				is_title_changed: false
			};
		},
		setIsBioChanged: (state, action: PayloadAction<boolean>) => {
			state.is_bio_changed = action.payload;
		},
		setIsProfileChanged: (state, action: PayloadAction<boolean>) => {
			state.is_profile_changed = action.payload;
		},
		setIsSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
			state.is_sidebar_collapsed = action.payload;
		},
		setIsTagChanged: (state, action: PayloadAction<boolean>) => {
			state.is_tag_changed = action.payload;
		},
		setIsTitleChanged: (state, action: PayloadAction<boolean>) => {
			state.is_title_changed = action.payload;
		}
	}
});
export default globalStore.reducer;
const GlobalActions = globalStore.actions;
export { GlobalActions };
