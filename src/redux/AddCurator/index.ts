// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { IAddCuratorStore, IProposalContent } from './@types';
import { EEnactment } from '~src/components/OpenGovTreasuryProposal';
import { EAllowedCommentor } from '~src/types';

const initialState: IAddCuratorStore = {
	alreadyPreimage: null,
	allowedCommentors: EAllowedCommentor.ALL,
	bountyAmount: '0',
	bountyIndex: null,
	bountyProposalIndex: null,
	curatorAddress: '',
	curatorFee: '0',
	proposal: { content: '', tags: [], title: '' },
	enactment: { key: EEnactment.After_No_Of_Blocks, value: null },
	preimage: { hash: '', length: 0 },
	proposer: '',
	track: null
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
			state.proposal = {
				content: '',
				tags: [],
				title: ''
			};
			state.alreadyPreimage = null;
			state.bountyAmount = '0';
			state.proposer = '';
			state.bountyIndex = null;
			state.bountyProposalIndex = null;
			state.preimage = { hash: '', length: 0 };
			state.track = null;
			state.enactment = { key: EEnactment.After_No_Of_Blocks, value: null };
			state.curatorFee = '0';
			state.allowedCommentors = EAllowedCommentor.ALL;
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
			state.proposal.content = action.payload;
		},
		updateProposalTags: (state, action: PayloadAction<string[]>) => {
			state.proposal.tags = action.payload;
		},
		updateProposalTitle: (state, action: PayloadAction<string>) => {
			state.proposal.title = action.payload;
		},
		updateAlreadyPreimage: (state, action: PayloadAction<boolean>) => {
			state.alreadyPreimage = action.payload;
		},
		updateProposer: (state, action: PayloadAction<string>) => {
			state.proposer = action.payload;
		},
		writeProposal: (state, action: PayloadAction<IProposalContent>) => {
			state.proposal = action.payload;
		},
		updateCuratorAddress: (state, action: PayloadAction<string>) => {
			state.curatorAddress = action.payload;
		},
		updateTrack: (state, action: PayloadAction<string | null>) => {
			state.track = action.payload;
		},
		updateCuratorFee: (state, action: PayloadAction<string>) => {
			state.curatorFee = action.payload;
		},
		updateEnactment: (state, action: PayloadAction<{ key: EEnactment; value: string | null }>) => {
			state.enactment = action.payload;
		},
		updateAllowedCommentors: (state, action: PayloadAction<EAllowedCommentor>) => {
			state.allowedCommentors = action.payload;
		}
	}
});
const addCuratorActions = addCuratorStore.actions;

export default addCuratorStore.reducer;
export { addCuratorActions };
