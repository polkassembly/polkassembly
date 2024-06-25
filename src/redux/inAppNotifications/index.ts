// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { IInAppNotificationsStore } from './@types';
import { IInAppNotification } from '~src/components/InAppNotification/types';

const initialState: IInAppNotificationsStore = {
	lastReadTime: null,
	popupNotifications: [],
	recentNotifications: [],
	recentNotificationsCount: 0,
	totalNotificationsCount: 0,
	unreadNotifications: [],
	unreadNotificationsCount: 0,
	viewAllClicked: false
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
			state.viewAllClicked = action.payload?.viewAllClicked || false;
			state.totalNotificationsCount = action.payload.totalNotificationsCount;
			state.popupNotifications = action.payload.popupNotifications;
		},

		updateNotificationReadTime: (state, action: PayloadAction<string>) => {
			state.lastReadTime = action.payload;
		},
		updatePopupNotifications: (state, action: PayloadAction<IInAppNotification[]>) => {
			state.popupNotifications = action.payload;
		},
		updateUnreadNotificationsCount: (state, action: PayloadAction<number>) => {
			state.unreadNotificationsCount = action.payload;
		},
		updateViewAllClicked: (state, action: PayloadAction<boolean>) => {
			state.viewAllClicked = action.payload;
		}
	}
});
const inAppNotificationsActions = inAppNotificationsStore.actions;

export default inAppNotificationsStore.reducer;
export { inAppNotificationsActions };
