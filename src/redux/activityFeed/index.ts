// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { IActivityFeedState } from './@types';
import { IActivityFeedPost } from 'pages/api/v1/activity-feed/explore-posts';

const initialState: IActivityFeedState = {
	explorePosts: [],
	subscribedPosts: [],
	loadingExplore: false,
	loadingSubscribed: false
};

export const activityFeedSlice = createSlice({
	name: 'activityFeed',
	initialState,
	reducers: {
		setExplorePosts: (state, action: PayloadAction<IActivityFeedPost[]>) => {
			state.explorePosts = action.payload;
		},
		setSubscribedPosts: (state, action: PayloadAction<IActivityFeedPost[]>) => {
			state.subscribedPosts = action.payload;
		},
		setLoadingExplore: (state, action: PayloadAction<boolean>) => {
			state.loadingExplore = action.payload;
		},
		setLoadingSubscribed: (state, action: PayloadAction<boolean>) => {
			state.loadingSubscribed = action.payload;
		},
		resetActivityFeed: (state) => {
			state.explorePosts = [];
			state.subscribedPosts = [];
			state.loadingExplore = false;
			state.loadingSubscribed = false;
		}
	},
	extraReducers: (builder) => {
		builder.addCase(HYDRATE, (state, action) => {
			return {
				...state,
				...(action as PayloadAction<any>).payload.activityFeed
			};
		});
	}
});

export const { setExplorePosts, setSubscribedPosts, setLoadingExplore, setLoadingSubscribed, resetActivityFeed } = activityFeedSlice.actions;

export const updateExplorePosts = (posts: IActivityFeedPost[]) => {
	return (dispatch: any) => {
		dispatch(setExplorePosts(posts));
	};
};

export const updateSubscribedPosts = (posts: IActivityFeedPost[]) => {
	return (dispatch: any) => {
		dispatch(setSubscribedPosts(posts));
	};
};

export const toggleLoadingExplore = (isLoading: boolean) => {
	return (dispatch: any) => {
		dispatch(setLoadingExplore(isLoading));
	};
};

export const toggleLoadingSubscribed = (isLoading: boolean) => {
	return (dispatch: any) => {
		dispatch(setLoadingSubscribed(isLoading));
	};
};

export const resetAllActivityFeed = () => {
	return (dispatch: any) => {
		dispatch(resetActivityFeed());
	};
};
export default activityFeedSlice.reducer;
