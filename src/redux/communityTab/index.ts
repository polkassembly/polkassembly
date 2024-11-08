// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { ICommunityTabStore } from './@types';
import { ECommunityTabs } from './@types';

const initialState: ICommunityTabStore = {
	searchedUserName: '',
	selectedTab: ECommunityTabs.MEMBERS
};

export const communityTabStore = createSlice({
	extraReducers: (builder) => {
		builder.addCase(HYDRATE, (state, action) => {
			return {
				...state,
				...(action as PayloadAction<any>).payload.communityTab
			};
		});
	},
	initialState,
	name: 'communityTab',
	reducers: {
		reset: (state) => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			state = {
				searchedUserName: '',
				selectedTab: ECommunityTabs.MEMBERS
			};
		},
		setSearchedUsername: (state, action: PayloadAction<string>) => {
			state.searchedUserName = action.payload;
		},
		setSelectedTab: (state, action: PayloadAction<ECommunityTabs>) => {
			state.selectedTab = action.payload;
		}
	}
});
export default communityTabStore.reducer;
const communityTabActions = communityTabStore.actions;
export { communityTabActions };
