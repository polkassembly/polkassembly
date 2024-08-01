// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { EAmbassadorSeedingSteps, IAddAmbassadorSeedingStore, IAmbassadorProposalContent } from './@types';
import { EAmbassadorActions } from '~src/components/AmbassadorSeeding/types';

const initialState: IAddAmbassadorSeedingStore = {
	addAmbassadorForm: {
		ambassadorPostIndex: null,
		ambassadorPreimage: { hash: '', length: 0 },
		applicantAddress: '',
		discussion: { discussionContent: '', discussionTags: [], discussionTitle: '' },
		isPreimageCreationDone: false,
		promoteCallData: '',
		proposer: '',
		rank: 3,
		step: EAmbassadorSeedingSteps.CREATE_APPLICANT,
		xcmCallData: ''
	},
	removeAmbassadorForm: {
		ambassadorPostIndex: null,
		ambassadorPreimage: { hash: '', length: 0 },
		applicantAddress: '',
		discussion: { discussionContent: '', discussionTags: [], discussionTitle: '' },
		isPreimageCreationDone: false,
		promoteCallData: '',
		proposer: '',
		rank: 3,
		step: EAmbassadorSeedingSteps.CREATE_APPLICANT,
		xcmCallData: ''
	},
	replaceAmbassadorForm: {
		ambassadorPostIndex: null,
		ambassadorPreimage: { hash: '', length: 0 },
		applicantAddress: '',
		discussion: { discussionContent: '', discussionTags: [], discussionTitle: '' },
		isPreimageCreationDone: false,
		promoteCallData: '',
		proposer: '',
		rank: 3,
		removingApplicantAddress: '',
		step: EAmbassadorSeedingSteps.CREATE_APPLICANT,
		xcmCallData: ''
	}
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
			state.addAmbassadorForm = {
				ambassadorPostIndex: null,
				ambassadorPreimage: { hash: '', length: 0 },
				applicantAddress: '',
				discussion: { discussionContent: '', discussionTags: [], discussionTitle: '' },
				isPreimageCreationDone: false,
				promoteCallData: '',
				proposer: '',
				rank: 3,
				step: EAmbassadorSeedingSteps.CREATE_APPLICANT,
				xcmCallData: ''
			};
			state.removeAmbassadorForm = {
				ambassadorPostIndex: null,
				ambassadorPreimage: { hash: '', length: 0 },
				applicantAddress: '',
				discussion: { discussionContent: '', discussionTags: [], discussionTitle: '' },
				isPreimageCreationDone: false,
				promoteCallData: '',
				proposer: '',
				rank: 3,
				step: EAmbassadorSeedingSteps.CREATE_APPLICANT,
				xcmCallData: ''
			};
			state.replaceAmbassadorForm = {
				ambassadorPostIndex: null,
				ambassadorPreimage: { hash: '', length: 0 },
				applicantAddress: '',
				discussion: { discussionContent: '', discussionTags: [], discussionTitle: '' },
				isPreimageCreationDone: false,
				promoteCallData: '',
				proposer: '',
				rank: 3,
				removingApplicantAddress: '',
				step: EAmbassadorSeedingSteps.CREATE_APPLICANT,
				xcmCallData: ''
			};
		},
		updateAmbassadorPreimage: (state, action: PayloadAction<{ type: EAmbassadorActions; value: { hash: string; length: number } }>) => {
			if (!state.addAmbassadorForm) {
				state.addAmbassadorForm = {} as any;
			}
			if (!state.removeAmbassadorForm) {
				state.removeAmbassadorForm = {} as any;
			}
			if (!state.replaceAmbassadorForm) {
				state.replaceAmbassadorForm = {} as any;
			}
			switch (action.payload.type) {
				case EAmbassadorActions.ADD_AMBASSADOR:
					state.addAmbassadorForm.ambassadorPreimage = action.payload.value;
					break;
				case EAmbassadorActions.REMOVE_AMBASSADOR:
					state.removeAmbassadorForm.ambassadorPreimage = action.payload.value;
					break;
				case EAmbassadorActions.REPLACE_AMBASSADOR:
					state.replaceAmbassadorForm.ambassadorPreimage = action.payload.value;
					break;
			}
		},
		updateAmbassadorProposalIndex: (state, action: PayloadAction<{ type: EAmbassadorActions; value: number | null }>) => {
			if (!state.addAmbassadorForm) {
				state.addAmbassadorForm = {} as any;
			}
			if (!state.removeAmbassadorForm) {
				state.removeAmbassadorForm = {} as any;
			}
			if (!state.replaceAmbassadorForm) {
				state.replaceAmbassadorForm = {} as any;
			}
			switch (action.payload.type) {
				case EAmbassadorActions.ADD_AMBASSADOR:
					state.addAmbassadorForm.ambassadorPostIndex = action.payload.value;
					break;
				case EAmbassadorActions.REMOVE_AMBASSADOR:
					state.removeAmbassadorForm.ambassadorPostIndex = action.payload.value;
					break;
				case EAmbassadorActions.REPLACE_AMBASSADOR:
					state.replaceAmbassadorForm.ambassadorPostIndex = action.payload.value;
					break;
			}
		},
		updateAmbassadorRank: (state, action: PayloadAction<{ type: EAmbassadorActions; value: number }>) => {
			if (!state.addAmbassadorForm) {
				state.addAmbassadorForm = {} as any;
			}
			if (!state.removeAmbassadorForm) {
				state.removeAmbassadorForm = {} as any;
			}
			if (!state.replaceAmbassadorForm) {
				state.replaceAmbassadorForm = {} as any;
			}
			switch (action.payload.type) {
				case EAmbassadorActions.ADD_AMBASSADOR:
					state.addAmbassadorForm.rank = action.payload.value;
					break;
				case EAmbassadorActions.REMOVE_AMBASSADOR:
					state.removeAmbassadorForm.rank = action.payload.value;
					break;
				case EAmbassadorActions.REPLACE_AMBASSADOR:
					state.replaceAmbassadorForm.rank = action.payload.value;
					break;
			}
		},
		updateAmbassadorSteps: (state, action: PayloadAction<{ type: EAmbassadorActions; value: EAmbassadorSeedingSteps }>) => {
			if (!state.addAmbassadorForm) {
				state.addAmbassadorForm = {} as any;
			}
			if (!state.removeAmbassadorForm) {
				state.removeAmbassadorForm = {} as any;
			}
			if (!state.replaceAmbassadorForm) {
				state.replaceAmbassadorForm = {} as any;
			}
			switch (action.payload.type) {
				case EAmbassadorActions.ADD_AMBASSADOR:
					state.addAmbassadorForm.step = action.payload.value as any;
					break;
				case EAmbassadorActions.REMOVE_AMBASSADOR:
					state.removeAmbassadorForm.step = action.payload.value as any;
					break;
				case EAmbassadorActions.REPLACE_AMBASSADOR:
					state.replaceAmbassadorForm.step = action.payload.value as any;
					break;
			}
		},
		updateApplicantAddress: (state, action: PayloadAction<{ type: EAmbassadorActions; value: string }>) => {
			if (!state.addAmbassadorForm) {
				state.addAmbassadorForm = {} as any;
			}
			if (!state.removeAmbassadorForm) {
				state.removeAmbassadorForm = {} as any;
			}
			if (!state.replaceAmbassadorForm) {
				state.replaceAmbassadorForm = {} as any;
			}
			switch (action.payload.type) {
				case EAmbassadorActions.ADD_AMBASSADOR:
					state.addAmbassadorForm.applicantAddress = action.payload.value as any;
					break;
				case EAmbassadorActions.REMOVE_AMBASSADOR:
					state.removeAmbassadorForm.applicantAddress = action.payload.value as any;
					break;
				case EAmbassadorActions.REPLACE_AMBASSADOR:
					state.replaceAmbassadorForm.applicantAddress = action.payload.value as any;
					break;
			}
		},
		updateDiscussionContent: (state, action: PayloadAction<{ type: EAmbassadorActions; value: string }>) => {
			if (!state.addAmbassadorForm) {
				state.addAmbassadorForm = {} as any;
			}
			if (!state.removeAmbassadorForm) {
				state.removeAmbassadorForm = {} as any;
			}
			if (!state.replaceAmbassadorForm) {
				state.replaceAmbassadorForm = {} as any;
			}
			switch (action.payload.type) {
				case EAmbassadorActions.ADD_AMBASSADOR:
					state.addAmbassadorForm.discussion.discussionContent = action.payload.value as any;
					break;
				case EAmbassadorActions.REMOVE_AMBASSADOR:
					state.removeAmbassadorForm.discussion.discussionContent = action.payload.value as any;
					break;
				case EAmbassadorActions.REPLACE_AMBASSADOR:
					state.replaceAmbassadorForm.discussion.discussionContent = action.payload.value as any;
					break;
			}
		},
		updateDiscussionTags: (state, action: PayloadAction<{ type: EAmbassadorActions; value: string[] }>) => {
			if (!state.addAmbassadorForm) {
				state.addAmbassadorForm = {} as any;
			}
			if (!state.removeAmbassadorForm) {
				state.removeAmbassadorForm = {} as any;
			}
			if (!state.replaceAmbassadorForm) {
				state.replaceAmbassadorForm = {} as any;
			}
			switch (action.payload.type) {
				case EAmbassadorActions.ADD_AMBASSADOR:
					state.addAmbassadorForm.discussion.discussionTags = action.payload.value as any;
					break;
				case EAmbassadorActions.REMOVE_AMBASSADOR:
					state.removeAmbassadorForm.discussion.discussionTags = action.payload.value as any;
					break;
				case EAmbassadorActions.REPLACE_AMBASSADOR:
					state.replaceAmbassadorForm.discussion.discussionTags = action.payload.value as any;
					break;
			}
		},
		updateDiscussionTitle: (state, action: PayloadAction<{ type: EAmbassadorActions; value: string }>) => {
			if (!state.addAmbassadorForm) {
				state.addAmbassadorForm = {} as any;
			}
			if (!state.removeAmbassadorForm) {
				state.removeAmbassadorForm = {} as any;
			}
			if (!state.replaceAmbassadorForm) {
				state.replaceAmbassadorForm = {} as any;
			}
			switch (action.payload.type) {
				case EAmbassadorActions.ADD_AMBASSADOR:
					state.addAmbassadorForm.discussion.discussionTitle = action.payload.value as any;
					break;
				case EAmbassadorActions.REMOVE_AMBASSADOR:
					state.removeAmbassadorForm.discussion.discussionTitle = action.payload.value as any;
					break;
				case EAmbassadorActions.REPLACE_AMBASSADOR:
					state.replaceAmbassadorForm.discussion.discussionTitle = action.payload.value as any;
					break;
			}
		},
		updateIsPreimageCreationDone: (state, action: PayloadAction<{ type: EAmbassadorActions; value: boolean }>) => {
			if (!state.addAmbassadorForm) {
				state.addAmbassadorForm = {} as any;
			}
			if (!state.removeAmbassadorForm) {
				state.removeAmbassadorForm = {} as any;
			}
			if (!state.replaceAmbassadorForm) {
				state.replaceAmbassadorForm = {} as any;
			}
			switch (action.payload.type) {
				case EAmbassadorActions.ADD_AMBASSADOR:
					state.addAmbassadorForm.isPreimageCreationDone = action.payload.value as any;
					break;
				case EAmbassadorActions.REMOVE_AMBASSADOR:
					state.removeAmbassadorForm.isPreimageCreationDone = action.payload.value as any;
					break;
				case EAmbassadorActions.REPLACE_AMBASSADOR:
					state.replaceAmbassadorForm.isPreimageCreationDone = action.payload.value as any;
					break;
			}
		},
		updatePromoteCallData: (state, action: PayloadAction<{ type: EAmbassadorActions; value: string }>) => {
			if (!state.addAmbassadorForm) {
				state.addAmbassadorForm = {} as any;
			}
			if (!state.removeAmbassadorForm) {
				state.removeAmbassadorForm = {} as any;
			}
			if (!state.replaceAmbassadorForm) {
				state.replaceAmbassadorForm = {} as any;
			}
			switch (action.payload.type) {
				case EAmbassadorActions.ADD_AMBASSADOR:
					state.addAmbassadorForm.promoteCallData = action.payload.value as any;
					break;
				case EAmbassadorActions.REMOVE_AMBASSADOR:
					state.removeAmbassadorForm.promoteCallData = action.payload.value as any;
					break;
				case EAmbassadorActions.REPLACE_AMBASSADOR:
					state.replaceAmbassadorForm.promoteCallData = action.payload.value as any;
					break;
			}
		},
		updateProposer: (state, action: PayloadAction<{ type: EAmbassadorActions; value: string }>) => {
			if (!state.addAmbassadorForm) {
				state.addAmbassadorForm = {} as any;
			}
			if (!state.removeAmbassadorForm) {
				state.removeAmbassadorForm = {} as any;
			}
			if (!state.replaceAmbassadorForm) {
				state.replaceAmbassadorForm = {} as any;
			}
			switch (action.payload.type) {
				case EAmbassadorActions.ADD_AMBASSADOR:
					state.addAmbassadorForm.proposer = action.payload.value as any;
					break;
				case EAmbassadorActions.REMOVE_AMBASSADOR:
					state.removeAmbassadorForm.proposer = action.payload.value as any;
					break;
				case EAmbassadorActions.REPLACE_AMBASSADOR:
					state.replaceAmbassadorForm.proposer = action.payload.value as any;
					break;
			}
		},
		updateRemovingAmbassadorApplicantAddress: (state, action: PayloadAction<string>) => {
			state.replaceAmbassadorForm.removingApplicantAddress = action.payload as any;
		},
		updateXcmCallData: (state, action: PayloadAction<{ type: EAmbassadorActions; value: string }>) => {
			if (!state.addAmbassadorForm) {
				state.addAmbassadorForm = {} as any;
			}
			if (!state.removeAmbassadorForm) {
				state.removeAmbassadorForm = {} as any;
			}
			if (!state.replaceAmbassadorForm) {
				state.replaceAmbassadorForm = {} as any;
			}
			switch (action.payload.type) {
				case EAmbassadorActions.ADD_AMBASSADOR:
					state.addAmbassadorForm.xcmCallData = action.payload.value as any;
					break;
				case EAmbassadorActions.REMOVE_AMBASSADOR:
					state.removeAmbassadorForm.xcmCallData = action.payload.value as any;
					break;
				case EAmbassadorActions.REPLACE_AMBASSADOR:
					state.replaceAmbassadorForm.xcmCallData = action.payload.value as any;
					break;
			}
		},
		writeProposal: (state, action: PayloadAction<{ type: EAmbassadorActions; value: IAmbassadorProposalContent }>) => {
			if (!state.addAmbassadorForm) {
				state.addAmbassadorForm = {} as any;
			}
			if (!state.removeAmbassadorForm) {
				state.removeAmbassadorForm = {} as any;
			}
			if (!state.replaceAmbassadorForm) {
				state.replaceAmbassadorForm = {} as any;
			}
			switch (action.payload.type) {
				case EAmbassadorActions.ADD_AMBASSADOR:
					state.addAmbassadorForm.discussion = action.payload.value as any;
					break;
				case EAmbassadorActions.REMOVE_AMBASSADOR:
					state.removeAmbassadorForm.discussion = action.payload.value as any;
					break;
				case EAmbassadorActions.REPLACE_AMBASSADOR:
					state.replaceAmbassadorForm.discussion = action.payload.value as any;
					break;
			}
		}
	}
});
const ambassadorSeedingActions = ambassadorSeedingStore.actions;

export default ambassadorSeedingStore.reducer;
export { ambassadorSeedingActions };
