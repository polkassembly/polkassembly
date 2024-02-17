// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { IVoteDataStore } from './@types';

const initialState: IVoteDataStore = {
	// active: false,
	delegatedData: {},
	delegatorLoading: true,
	isReferendum2: false,
	isVoteDataModalOpen: false,
	setDelegationVoteModal: {},
	tally: '',
	voteData: {},
	voteType: ''
};

export const voteDataStore = createSlice({
	initialState,
	name: 'voteData',
	reducers: {
		setClearInitialState: (state) => {
			state.voteType = null;
			state.voteData = null;
			state.tally = null;
			state.setDelegationVoteModal = false;
			state.isReferendum2 = false;
			state.delegatorLoading = initialState.delegatorLoading;
			state.delegatedData = null;
		},
		setDelegatorLoadingFalse: (state) => {
			state.delegatorLoading = false;
		},
		setDelegatorLoadingTrue: (state) => {
			state.delegatorLoading = true;
		},
		setSetDelegatedData: (state, action: PayloadAction) => {
			state.delegatedData = action.payload;
		},
		// eslint-disable-next-line sort-keys
		setIsReferendum2: (state, action: PayloadAction<boolean | undefined>) => {
			const value = action.payload;
			if (value) {
				state.isReferendum2 = action.payload;
			}
		},
		setIsVoteDataModalClose: (state) => {
			state.isVoteDataModalOpen = false;
		},
		setIsVoteDataModalOpen: (state) => {
			state.isVoteDataModalOpen = true;
		},
		setSetDelegationVoteModal: (state, action: PayloadAction) => {
			state.setDelegationVoteModal = action.payload;
		},
		setTally: (state, action: PayloadAction) => {
			state.tally = action.payload;
		},
		setVoteData: (state, action: PayloadAction) => {
			state.voteData = action.payload;
		},
		setVoteType: (state, action: PayloadAction) => {
			state.voteType = action.payload;
		}
	}
});

export const {
	setIsVoteDataModalClose,
	setIsVoteDataModalOpen,
	setClearInitialState,
	setSetDelegatedData,
	setDelegatorLoadingTrue,
	setDelegatorLoadingFalse,
	setIsReferendum2,
	setSetDelegationVoteModal,
	setTally,
	setVoteData,
	setVoteType
} = voteDataStore.actions;
