// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { IVoteDataStore } from './@types';

const initialState: IVoteDataStore = {
	delegatedData: {},
	delegatorLoading: false,
	isReferendum2: false,
	setDelegationVoteModal: false,
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
			state.setDelegationVoteModal = null;
			state.isReferendum2 = null;
			state.delegatorLoading = null;
			state.delegatedData = null;
		},
		setDelegatedData: (state, action: PayloadAction) => {
			state.delegatedData = action.payload;
		},
		setDelegatorLoading: (state, action: PayloadAction) => {
			state.delegatorLoading = action.payload;
		},
		setIsReferendum2: (state, action: PayloadAction) => {
			state.isReferendum2 = action.payload;
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

const voteDataStoreActions = voteDataStore.actions;

const setClearInitialState: any = () => {
	return (dispatch: any) => {
		dispatch(voteDataStoreActions.setClearInitialState());
	};
};
const setSetDelegatedData: any = (delegateData: any) => {
	return (dispatch: any) => {
		dispatch(voteDataStoreActions.setDelegatedData(delegateData));
	};
};
const setSetDelegatorLoading: any = (delegatorLoading: any) => {
	return (dispatch: any) => {
		dispatch(voteDataStoreActions.setDelegatorLoading(delegatorLoading));
	};
};
const setIsReferendum2: any = (isReferendum2: any) => {
	return (dispatch: any) => {
		dispatch(voteDataStoreActions.setIsReferendum2(isReferendum2));
	};
};
const setSetDelegationVoteModal: any = (setDelegationVoteModal: any) => {
	return (dispatch: any) => {
		dispatch(voteDataStoreActions.setSetDelegationVoteModal(setDelegationVoteModal));
	};
};
const setTally: any = (tally: any) => {
	return (dispatch: any) => {
		dispatch(voteDataStoreActions.setTally(tally));
	};
};
const setVoteData: any = (voteData: any) => {
	return (dispatch: any) => {
		dispatch(voteDataStoreActions.setVoteData(voteData));
	};
};
const setVoteType: any = (voteType: any) => {
	return (dispatch: any) => {
		dispatch(voteDataStoreActions.setVoteType(voteType));
	};
};

export { setClearInitialState, setSetDelegatedData, setSetDelegatorLoading, setIsReferendum2, setSetDelegationVoteModal, setTally, setVoteData, setVoteType };
