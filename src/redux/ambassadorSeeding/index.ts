// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { EAmbassadorSeedingSteps, IAmbassadorProposalContent, IAmbassadorSeedingStore } from './@types';

const initialState: IAmbassadorSeedingStore = {
	ambassadorPostIndex: null,
	ambassadorPreimage: { hash: '', length: 0 },
	applicantAddress: '',
	discussion: { discussionContent: '', discussionTags: [], discussionTitle: '' },
	isPreimageCreationDone: false,
	promoteCallData: '',
	proposer: '',
	rank: 3,
	step: EAmbassadorSeedingSteps.PROMOTES_CALL,
	xcmCallData: ''
};

export const ambassadorSeedingStore = createSlice({
	extraReducers: (builder) => {
		builder.addCase(HYDRATE, (state, action) => {
			return {
				...state,
				...(action as PayloadAction<any>).payload.inAppNotifications
			};
		});
	},
	initialState,
	name: 'ambassadorSeeding',
	reducers: {
		resetAmbassadorSeeding: (state) => {
			state.discussion = {
				discussionContent: '',
				discussionTags: [],
				discussionTitle: ''
			};
			state.applicantAddress = '';
			state.promoteCallData = '';
			state.proposer = '';
			state.xcmCallData = '';
			state.step = EAmbassadorSeedingSteps.PROMOTES_CALL;
			state.ambassadorPreimage = { hash: '', length: 0 };
			state.ambassadorPostIndex = null;
			state.isPreimageCreationDone = false;
		},
		updateAmbassadorPreimage: (state, action: PayloadAction<{ hash: string; length: number }>) => {
			state.ambassadorPreimage = action.payload;
		},
		updateAmbassadorProposalIndex: (state, action: PayloadAction<number | null>) => {
			state.ambassadorPostIndex = action.payload;
		},
		updateAmbassadorRank: (state, action: PayloadAction<number>) => {
			state.rank = action.payload;
		},
		updateAmbassadorSteps: (state, action: PayloadAction<EAmbassadorSeedingSteps>) => {
			state.step = action.payload;
		},
		updateApplicantAddress: (state, action: PayloadAction<string>) => {
			state.applicantAddress = action.payload;
		},
		updateDiscussionContent: (state, action: PayloadAction<string>) => {
			state.discussion.discussionContent = action.payload;
		},
		updateDiscussionTags: (state, action: PayloadAction<string[]>) => {
			state.discussion.discussionTags = action.payload;
		},
		updateDiscussionTitle: (state, action: PayloadAction<string>) => {
			state.discussion.discussionTitle = action.payload;
		},
		updateIsPreimageCreationDone: (state, action: PayloadAction<boolean>) => {
			state.isPreimageCreationDone = action.payload;
		},
		updatePromoteCallData: (state, action: PayloadAction<string>) => {
			state.promoteCallData = action.payload;
		},
		updateProposer: (state, action: PayloadAction<string>) => {
			state.proposer = action.payload;
		},
		updateXcmCallData: (state, action: PayloadAction<string>) => {
			state.xcmCallData = action.payload;
		},
		writeProposal: (state, action: PayloadAction<IAmbassadorProposalContent>) => {
			state.discussion = action.payload;
		}
	}
});
const ambassadorSeedingActions = ambassadorSeedingStore.actions;

export default ambassadorSeedingStore.reducer;
export { ambassadorSeedingActions };
