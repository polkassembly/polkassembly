// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { IInAppNotificationsStore } from './@types';

const initialState: IInAppNotificationsStore = {
	lastReadTime: null,
	recentNotifications: [],
	recentNotificationsCount: 0,
	unreadNotifications: [],
	unreadNotificationsCount: 0
};

export const inAppNotificationsStore = createSlice({
	extraReducers: (builder) => {
		builder.addCase(HYDRATE, (state, action) => {
			return {
				...state,
				...(action as PayloadAction<any>).payload.inAppNotifications
			};
		});
	},
	initialState,
	name: 'inAppNotifications',
	reducers: {
		updateInAppNotifications: (state, action: PayloadAction<IInAppNotificationsStore>) => {
			state.lastReadTime = action.payload.lastReadTime;
			state.recentNotifications = action.payload.recentNotifications;
			state.recentNotificationsCount = action.payload.recentNotificationsCount;
			state.unreadNotifications = action.payload.unreadNotifications;
			state.unreadNotificationsCount = action.payload.unreadNotificationsCount;
		},
		updateNotificationReadTime: (state, action: PayloadAction<string>) => {
			state.lastReadTime = action.payload;
		}
	}
});
const inAppNotificationsActions = inAppNotificationsStore.actions;

const updateInAppNotifications: any = (payload: IInAppNotificationsStore) => {
	return (dispatch: any) => {
		dispatch(inAppNotificationsActions.updateInAppNotifications(payload));
	};
};

const updateNotificationReadTime: any = (payload: string) => {
	return (dispatch: any) => {
		dispatch(inAppNotificationsActions.updateNotificationReadTime(payload));
	};
};

export default inAppNotificationsStore.reducer;
export { updateInAppNotifications, inAppNotificationsActions, updateNotificationReadTime };
