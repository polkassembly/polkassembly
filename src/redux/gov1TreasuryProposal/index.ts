// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { IGov1TreasuryProposalStore } from './@types';
import { EAllowedCommentor } from '~src/types';

const initialState: IGov1TreasuryProposalStore = {
	allowedCommentors: EAllowedCommentor.ALL,
	beneficiary: '',
	content: '',
	discussionId: null,
	discussionLink: '',
	firstStepPercentage: 0,
	fundingAmount: '0',
	isDiscussionLinked: null,
	proposalIndex: null,
	proposer: '',
	secondStepPercentage: 0,
	tags: [],
	title: ''
};

export const gov1TreasuryProposalStore = createSlice({
	extraReducers: (builder) => {
		builder.addCase(HYDRATE, (state, action) => {
			return {
				...state,
				...(action as PayloadAction<any>).payload.gov1TreasuryProposal
			};
		});
	},
	initialState,
	name: 'gov1TreasuryProposal',
	reducers: {
		resetGov1TreasuryProposal: (state) => {
			(state.beneficiary = ''), (state.content = '');
			state.allowedCommentors = EAllowedCommentor.ALL;
			state.discussionLink = '';
			state.discussionId = null;
			state.fundingAmount = '0';
			state.isDiscussionLinked = null;
			state.proposer = '';
			state.tags = [];
			state.firstStepPercentage = 0;
			state.secondStepPercentage = 0;
			state.proposalIndex = null;
			state.title = '';
		},
		setAllowedCommentors: (state, action: PayloadAction<EAllowedCommentor>) => {
			state.allowedCommentors = action.payload;
		},
		updateGov1TreasuryProposal: (state, action: PayloadAction<IGov1TreasuryProposalStore>) => {
			state.beneficiary = action?.payload?.beneficiary;
			state.content = action?.payload?.content;
			state.discussionLink = action?.payload?.discussionLink;
			state.discussionId = action?.payload?.discussionId;
			state.fundingAmount = action?.payload?.fundingAmount;
			state.isDiscussionLinked = action?.payload?.isDiscussionLinked;
			state.proposer = action?.payload?.proposer;
			state.tags = action?.payload?.tags;
			state.title = action?.payload?.title;
			state.proposalIndex = action?.payload?.proposalIndex;
			state.firstStepPercentage = action.payload.firstStepPercentage;
			state.secondStepPercentage = action.payload.secondStepPercentage;
			state.allowedCommentors = action.payload.allowedCommentors || EAllowedCommentor.ALL;
		}
	}
});

const gov1TreasuryProposalActions = gov1TreasuryProposalStore.actions;

const updateGov1TreasuryProposal: any = (proposal: IGov1TreasuryProposalStore) => {
	return (dispatch: any) => {
		dispatch(gov1TreasuryProposalActions.updateGov1TreasuryProposal(proposal));
	};
};

const resetGov1TreasuryProposal: any = () => {
	return (dispatch: any) => {
		dispatch(gov1TreasuryProposalActions.resetGov1TreasuryProposal());
	};
};

export default gov1TreasuryProposalStore.reducer;
export { gov1TreasuryProposalActions, updateGov1TreasuryProposal, resetGov1TreasuryProposal };
