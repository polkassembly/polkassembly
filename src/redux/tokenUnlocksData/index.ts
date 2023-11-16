// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IUnlockTokenskDataStore } from './@types';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';

const initialState: IUnlockTokenskDataStore = {
	address: '',
	data: {
		totalLockData: [],
		totalOngoingData: [],
		totalUnlockableData: []
	}
};

export const userUnlockTokensDataStore = createSlice({
	extraReducers: (builder) => {
		builder.addCase(HYDRATE, (state, action) => {
			return {
				...state,
				...(action as PayloadAction<any>).payload.userDetails
			};
		});
	},
	initialState,
	name: 'userUnlockTokensData',
	reducers: {
		setUserUnlockTokensData: (state, action: PayloadAction<IUnlockTokenskDataStore>) => {
			state.address = action.payload.address;
			state.data = action.payload.data;
		}
	}
});

const setUserUnlockTokensData: any = (data: IUnlockTokenskDataStore) => {
	return (dispatch: any) => {
		dispatch(userTokensUnlockActions.setUserUnlockTokensData(data));
	};
};

export default userUnlockTokensDataStore.reducer;
const userTokensUnlockActions = userUnlockTokensDataStore.actions;
export { setUserUnlockTokensData };
