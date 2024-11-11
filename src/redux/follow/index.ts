// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IFollowState } from './@types';
/* eslint-disable sort-keys */

const initialState: IFollowState = {
	followingIds: [],
	loading: false,
	error: null
};

export const followStore = createSlice({
	name: 'follow',
	initialState,
	reducers: {
		setFollowingIds: (state, action: PayloadAction<number[]>) => {
			state.followingIds = action.payload;
		},
		clearFollowingIds: (state) => {
			state.followingIds = [];
		},
		addFollowingId: (state, action: PayloadAction<number>) => {
			if (!state.followingIds.includes(action.payload)) {
				state.followingIds.push(action.payload);
			}
		},
		removeFollowingId: (state, action: PayloadAction<number>) => {
			state.followingIds = state.followingIds.filter((id) => id !== action.payload);
		}
	}
});

const followStoreActions = followStore.actions;

const setFollowingIds: any = (ids: any) => {
	return (dispatch: any) => {
		dispatch(followStoreActions.setFollowingIds(ids));
	};
};
const clearFollowingIds: any = () => {
	return (dispatch: any) => {
		dispatch(followStoreActions.clearFollowingIds());
	};
};
const addFollowingId: any = (id: number) => {
	return (dispatch: any) => {
		dispatch(followStoreActions.addFollowingId(id));
	};
};
const removeFollowingId: any = (id: number) => {
	return (dispatch: any) => {
		dispatch(followStoreActions.removeFollowingId(id));
	};
};
const isFollowing = (state: IFollowState, userId: number): boolean => state.followingIds.includes(userId);

export { setFollowingIds, clearFollowingIds, addFollowingId, removeFollowingId, isFollowing };
