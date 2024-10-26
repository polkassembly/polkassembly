// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { IInAppNotificationsStore, IPopupNotifications } from './@types';
import { ECustomNotificationFilters, IInAppNotification } from '~src/components/InAppNotification/types';

const initialState: IInAppNotificationsStore = {
	allNotifications: [],
	lastReadTime: null,
	commentsNotifications: [],
	mentionsNotifications: [],
	popupActiveFilter: ECustomNotificationFilters.ALL,
	proposalsNotifications: [],
	popupNotifications: { all: [], comments: [], mentions: [], proposals: [] },
	totalNotificationsCount: 0,
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
			state.allNotifications = action.payload.allNotifications;
			state.commentsNotifications = action.payload.commentsNotifications;
			state.mentionsNotifications = action.payload.mentionsNotifications;
			state.proposalsNotifications = action.payload?.proposalsNotifications || false;
			state.totalNotificationsCount = action.payload.totalNotificationsCount;
			state.unreadNotificationsCount = action.payload.unreadNotificationsCount;
			state.viewAllClicked = action.payload.viewAllClicked;
		},

		updateNotificationLastReadTime: (state, action: PayloadAction<string>) => {
			state.lastReadTime = action.payload;
		},

		updatePopupNotifications: (state, action: PayloadAction<IPopupNotifications>) => {
			state.popupNotifications = action.payload;
		},
		updateTotalNotificationsCount: (state, action: PayloadAction<number>) => {
			state.totalNotificationsCount = action.payload;
		},
		updateUnreadNotificationsCount: (state, action: PayloadAction<number>) => {
			state.unreadNotificationsCount = action.payload;
		},
		updateViewAllClicked: (state, action: PayloadAction<boolean>) => {
			state.viewAllClicked = action.payload;
		},
		updateCommentsNotifications: (state, action: PayloadAction<IInAppNotification[]>) => {
			state.commentsNotifications = action.payload;
		},
		updateAllNotifications: (state, action: PayloadAction<IInAppNotification[]>) => {
			state.allNotifications = action.payload;
		},
		updateMentionsNotifications: (state, action: PayloadAction<IInAppNotification[]>) => {
			state.mentionsNotifications = action.payload;
		},
		updateProposalsNotifications: (state, action: PayloadAction<IInAppNotification[]>) => {
			state.proposalsNotifications = action.payload;
		},
		updateNotificationsPopupActiveFilter: (state, action: PayloadAction<ECustomNotificationFilters>) => {
			state.popupActiveFilter = action.payload;
		}
	}
});
const inAppNotificationsActions = inAppNotificationsStore.actions;

export default inAppNotificationsStore.reducer;
export { inAppNotificationsActions };
