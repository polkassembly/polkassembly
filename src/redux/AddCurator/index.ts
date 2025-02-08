// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { IAddCuratorStore, IProposalContent } from './@types';

const initialState: IAddCuratorStore = {
	alreadyPreimage: null,
	bountyAmount: '0',
	bountyIndex: null,
	bountyProposalIndex: null,
	curatorAddress: '',
	curatorFee: '0',
	discussion: { discussionContent: '', discussionTags: [], discussionTitle: '' },
	enactment: { afterBlockNo: null, atBlockNo: null },
	preimage: { hash: '', length: 0 },
	proposer: '',
	trackNumber: null
};

export const addCuratorStore = createSlice({
	extraReducers: (builder) => {
		builder.addCase(HYDRATE, (state, action) => {
			return {
				...state,
				...(action as PayloadAction<any>).payload.addCurator
			};
		});
	},
	initialState,
	name: 'addCurator',
	reducers: {
		resetAddCurator: (state) => {
			state.discussion = {
				discussionContent: '',
				discussionTags: [],
				discussionTitle: ''
			};
			state.alreadyPreimage = null;
			state.bountyAmount = '0';
			state.proposer = '';
			state.bountyIndex = null;
			state.bountyProposalIndex = null;
			state.preimage = { hash: '', length: 0 };
			state.trackNumber = null;
			state.enactment = { afterBlockNo: null, atBlockNo: null };
			state.curatorFee = '0';
		},
		updateCuratorPreimage: (state, action: PayloadAction<{ hash: string; length: number }>) => {
			state.preimage = action.payload;
		},
		updateBountyProposalIndex: (state, action: PayloadAction<number | null>) => {
			state.bountyProposalIndex = action.payload;
		},
		updateBountyIndex: (state, action: PayloadAction<number>) => {
			state.bountyIndex = action.payload;
		},
		updateProposalContent: (state, action: PayloadAction<string>) => {
			state.discussion.discussionContent = action.payload;
		},
		updateProposalTags: (state, action: PayloadAction<string[]>) => {
			state.discussion.discussionTags = action.payload;
		},
		updateProposalTitle: (state, action: PayloadAction<string>) => {
			state.discussion.discussionTitle = action.payload;
		},
		updateAlreadyPreimage: (state, action: PayloadAction<boolean>) => {
			state.alreadyPreimage = action.payload;
		},
		updateProposer: (state, action: PayloadAction<string>) => {
			state.proposer = action.payload;
		},
		writeProposal: (state, action: PayloadAction<IProposalContent>) => {
			state.discussion = action.payload;
		},
		updateCurator: (state, action: PayloadAction<string>) => {
			state.curatorAddress = action.payload;
		},
		updateTrackNumber: (state, action: PayloadAction<number | null>) => {
			state.trackNumber = action.payload;
		}
	}
});
const addCuratorActions = addCuratorStore.actions;

export default addCuratorStore.reducer;
export { addCuratorActions };
