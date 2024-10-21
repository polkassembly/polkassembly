// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { IChildBountyCreationStore } from './@types';
import { EAllowedCommentor } from '~src/types';

const initialState: IChildBountyCreationStore = {
	allowedCommentors: EAllowedCommentor.ALL,
	categories: [],
	childBountyIndex: null,
	content: '',
	curator: '',
	curatorFee: '0',
	description: '',
	firstStepPercentage: 0,
	link: '',
	parentBountyIndex: null,
	proposer: '',
	reqAmount: '0',
	secondStepPercentage: 0,
	title: ''
};

export const childBountyCreationStore = createSlice({
	extraReducers: (builder) => {
		builder.addCase(HYDRATE, (state, action) => {
			return {
				...state,
				...(action as PayloadAction<any>).payload.childBountyCreation
			};
		});
	},
	initialState,
	name: 'childBountyCreation',
	reducers: {
		resetChildBountyCreationStore: (state) => {
			state.allowedCommentors = EAllowedCommentor.ALL;
			state.childBountyIndex = null;
			state.content = '';
			state.curator = '';
			state.curatorFee = '0';
			state.description = '';
			state.firstStepPercentage = 0;
			state.link = '';
			state.parentBountyIndex = null;
			state.proposer = '';
			state.reqAmount = '0';
			state.categories = [];
			state.secondStepPercentage = 0;
			state.title = '';
		},
		setAllowedCommentors: (state, action: PayloadAction<EAllowedCommentor>) => {
			state.allowedCommentors = action.payload;
		},
		setCategories: (state, action: PayloadAction<string[]>) => {
			state.categories = action.payload;
		},

		setChildBountyAmount: (state, action: PayloadAction<string>) => {
			state.reqAmount = action.payload;
		},
		setChildBountyCurator: (state, action: PayloadAction<string>) => {
			state.curator = action.payload;
		},
		setChildBountyCuratorFee: (state, action: PayloadAction<string>) => {
			state.curatorFee = action.payload;
		},
		setChildBountyDescription: (state, action: PayloadAction<string>) => {
			state.description = action.payload;
		},

		setChildBountyIndex: (state, action: PayloadAction<number>) => {
			state.childBountyIndex = action.payload;
		},

		setContent: (state, action: PayloadAction<string>) => {
			state.content = action.payload;
		},
		setLink: (state, action: PayloadAction<string>) => {
			state.link = action.payload;
		},
		setParentBountyIndex: (state, action: PayloadAction<number>) => {
			state.parentBountyIndex = action.payload;
		},

		setTitle: (state, action: PayloadAction<string>) => {
			state.title = action.payload;
		},

		updateChildBountyCreationStore: (state, action: PayloadAction<IChildBountyCreationStore>) => {
			state.allowedCommentors = action.payload.allowedCommentors || EAllowedCommentor.ALL;
			state.categories = action.payload.categories;
			state.childBountyIndex = action.payload.childBountyIndex;
			state.content = action.payload.content;
			state.curator = action.payload.curator;
			state.curatorFee = action.payload.curatorFee;
			state.description = action.payload.description;
			state.firstStepPercentage = action.payload.firstStepPercentage;
			state.link = action.payload.link;
			state.parentBountyIndex = action.payload.parentBountyIndex;
			state.proposer = action.payload.proposer;
			state.reqAmount = action.payload.reqAmount;
			state.secondStepPercentage = action.payload.secondStepPercentage;
			state.title = action.payload.title;
		},
		updateFirstStepPercentage: (state, action: PayloadAction<number>) => {
			state.firstStepPercentage = action.payload;
		},
		updateSecondStepPercentage: (state, action: PayloadAction<number>) => {
			state.secondStepPercentage = action.payload;
		}
	}
});

const childBountyCreationActions = childBountyCreationStore.actions;

export default childBountyCreationStore.reducer;
export { childBountyCreationActions };
