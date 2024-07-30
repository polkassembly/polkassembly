// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { EAmbassadorRemovalSteps, IAmbassadorRemovalStore } from './@types';
import { IAmbassadorProposalContent } from '../ambassadorSeeding/@types';

const initialState: IAmbassadorRemovalStore = {
	isRemovalAmbassadorPreimageCreationDone: false,
	removalAmbassadorAddress: '',
	removalAmbassadorCallData: '',
	removalAmbassadorDiscussion: { discussionContent: '', discussionTags: [], discussionTitle: '' },
	removalAmbassadorPostIndex: null,
	removalAmbassadorPreimage: { hash: '', length: 0 },
	removalAmbassadorProposer: '',
	removalAmbassadorRank: 3,
	removalAmbassadorStep: EAmbassadorRemovalSteps.REMOVAL_CALL,
	removalAmbassadorXcmCallData: ''
};

export const ambassadorRemovalStore = createSlice({
	extraReducers: (builder) => {
		builder.addCase(HYDRATE, (state, action) => {
			return {
				...state,
				...(action as PayloadAction<any>).payload.inAppNotifications
			};
		});
	},
	initialState,
	name: 'ambassadorRemoval',
	reducers: {
		resetAmbassadorRemoval: (state) => {
			state.removalAmbassadorDiscussion = {
				discussionContent: '',
				discussionTags: [],
				discussionTitle: ''
			};
			state.removalAmbassadorAddress = '';
			state.removalAmbassadorCallData = '';
			state.removalAmbassadorProposer = '';
			state.removalAmbassadorXcmCallData = '';
			state.removalAmbassadorStep = EAmbassadorRemovalSteps.REMOVAL_CALL;
			state.removalAmbassadorPreimage = { hash: '', length: 0 };
			state.removalAmbassadorPostIndex = null;
			state.isRemovalAmbassadorPreimageCreationDone = false;
		},
		updateRemovalAddress: (state, action: PayloadAction<string>) => {
			state.removalAmbassadorAddress = action.payload;
		},
		updateRemovalAmbassadorPreimage: (state, action: PayloadAction<{ hash: string; length: number }>) => {
			state.removalAmbassadorPreimage = action.payload;
		},
		updateRemovalAmbassadorProposalIndex: (state, action: PayloadAction<number | null>) => {
			state.removalAmbassadorPostIndex = action.payload;
		},
		updateRemovalAmbassadorRank: (state, action: PayloadAction<number>) => {
			state.removalAmbassadorRank = action.payload;
		},
		updateRemovalAmbassadorSteps: (state, action: PayloadAction<EAmbassadorRemovalSteps>) => {
			state.removalAmbassadorStep = action.payload;
		},
		updateRemovalDiscussionContent: (state, action: PayloadAction<string>) => {
			state.removalAmbassadorDiscussion.discussionContent = action.payload;
		},
		updateRemovalDiscussionTags: (state, action: PayloadAction<string[]>) => {
			state.removalAmbassadorDiscussion.discussionTags = action.payload;
		},
		updateRemovalDiscussionTitle: (state, action: PayloadAction<string>) => {
			state.removalAmbassadorDiscussion.discussionTitle = action.payload;
		},
		updateRemovalIsPreimageCreationDone: (state, action: PayloadAction<boolean>) => {
			state.isRemovalAmbassadorPreimageCreationDone = action.payload;
		},
		updateRemovalPromoteCallData: (state, action: PayloadAction<string>) => {
			state.removalAmbassadorCallData = action.payload;
		},

		updateRemovalProposer: (state, action: PayloadAction<string>) => {
			state.removalAmbassadorProposer = action.payload;
		},

		updateRemovalXcmCallData: (state, action: PayloadAction<string>) => {
			state.removalAmbassadorXcmCallData = action.payload;
		},
		writeRemovalProposal: (state, action: PayloadAction<IAmbassadorProposalContent>) => {
			state.removalAmbassadorDiscussion = action.payload;
		}
	}
});
const ambassadorRemovalActions = ambassadorRemovalStore.actions;

export default ambassadorRemovalStore.reducer;
export { ambassadorRemovalActions };
