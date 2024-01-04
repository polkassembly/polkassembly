// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { ITreasuryProposalStore } from './@types';

const initialState: ITreasuryProposalStore = {
	beneficiaries: [],
	isIdentityCardLoading: false,
	isMultisigCardLoading: false,
	showIdentityInfoCardForBeneficiary: false,
	showIdentityInfoCardForProposer: false,
	showMultisigInfoCard: false
};

export const treasuryProposalStore = createSlice({
	extraReducers: (builder) => {
		builder.addCase(HYDRATE, (state, action) => {
			return {
				...state,
				...(action as PayloadAction<any>).payload.treasuryProposal
			};
		});
	},
	initialState,
	name: 'treasuryProposal',
	reducers: {
		setBeneficiaries: (state, action: PayloadAction<string[]>) => {
			state.beneficiaries = action.payload;
		},
		setIdentityCardLoading: (state, action: PayloadAction<boolean>) => {
			state.isIdentityCardLoading = action.payload;
		},
		setMultisigCardLoading: (state, action: PayloadAction<boolean>) => {
			state.isMultisigCardLoading = action.payload;
		},
		setShowIdentityInfoCardForBeneficiary: (state, action: PayloadAction<boolean>) => {
			state.showIdentityInfoCardForBeneficiary = action.payload;
		},
		setShowIdentityInfoCardForProposer: (state, action: PayloadAction<boolean>) => {
			state.showIdentityInfoCardForProposer = action.payload;
		},
		setShowMultisigInfoCard: (state, action: PayloadAction<boolean>) => {
			state.showMultisigInfoCard = action.payload;
		}
	}
});
const treasuryProposalActions = treasuryProposalStore.actions;

const setBeneficiaries: any = (beneficiaries: string[]) => {
	return (dispatch: any) => {
		dispatch(treasuryProposalActions.setBeneficiaries(beneficiaries));
	};
};

const setShowIdentityInfoCardForBeneficiary: any = (state: boolean) => {
	return (dispatch: any) => {
		dispatch(treasuryProposalActions.setShowIdentityInfoCardForBeneficiary(state));
	};
};
const setShowIdentityInfoCardForProposer: any = (state: boolean) => {
	return (dispatch: any) => {
		dispatch(treasuryProposalActions.setShowIdentityInfoCardForProposer(state));
	};
};
const setShowMultisigInfoCard: any = (state: boolean) => {
	return (dispatch: any) => {
		dispatch(treasuryProposalActions.setShowMultisigInfoCard(state));
	};
};
const setIdentityCardLoading: any = (state: boolean) => {
	return (dispatch: any) => {
		dispatch(treasuryProposalActions.setIdentityCardLoading(state));
	};
};
const setMultisigCardLoading: any = (state: boolean) => {
	return (dispatch: any) => {
		dispatch(treasuryProposalActions.setMultisigCardLoading(state));
	};
};
export default treasuryProposalStore.reducer;
export {
	setBeneficiaries,
	treasuryProposalActions,
	setShowIdentityInfoCardForBeneficiary,
	setShowIdentityInfoCardForProposer,
	setShowMultisigInfoCard,
	setIdentityCardLoading,
	setMultisigCardLoading
};
