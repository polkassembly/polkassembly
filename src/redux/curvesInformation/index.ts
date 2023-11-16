// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { ICurvesInformationStore, IPoint } from './@types';

const initialState: ICurvesInformationStore = {
	approval: 0,
	approvalData: [],
	approvalThreshold: 0,
	currentApprovalData: [],
	currentSupportData: [],
	support: 0,
	supportData: [],
	supportThreshold: 0
};

export const curvesInformationStore = createSlice({
	extraReducers: (builder) => {
		builder.addCase(HYDRATE, (state, action) => {
			return {
				...state,
				...(action as PayloadAction<any>).payload.curvesInformation
			};
		});
	},
	initialState,
	name: 'curvesInformation',
	reducers: {
		setApproval: (state, action: PayloadAction<number>) => {
			state.approval = action.payload;
		},
		setApprovalData: (state, action: PayloadAction<IPoint[]>) => {
			state.approvalData = action.payload;
		},
		setApprovalThreshold: (state, action: PayloadAction<number>) => {
			state.approval = action.payload;
		},
		setCurrentApprovalData: (state, action: PayloadAction<IPoint[]>) => {
			state.currentApprovalData = action.payload;
		},
		setCurrentSupportData: (state, action: PayloadAction<IPoint[]>) => {
			state.currentSupportData = action.payload;
		},
		setCurvesInformation: (state, action: PayloadAction<ICurvesInformationStore>) => {
			const info = action.payload;
			state.approval = info.approval;
			state.approvalData = info.approvalData;
			state.approvalThreshold = info.approvalThreshold;
			state.currentApprovalData = info.currentApprovalData;
			state.currentSupportData = info.currentSupportData;
			state.support = info.support;
			state.supportData = info.supportData;
			state.supportThreshold = info.supportThreshold;
		},
		setSupport: (state, action: PayloadAction<number>) => {
			state.support = action.payload;
		},
		setSupportData: (state, action: PayloadAction<number>) => {
			state.approval = action.payload;
		},
		setSupportThreshold: (state, action: PayloadAction<number>) => {
			state.supportThreshold = action.payload;
		}
	}
});

const curvesInformationActions = curvesInformationStore.actions;

const setCurvesInformation: any = (curvesInformation: ICurvesInformationStore) => {
	return (dispatch: any) => {
		dispatch(curvesInformationActions.setCurvesInformation(curvesInformation));
	};
};

export default curvesInformationStore.reducer;
export { setCurvesInformation, curvesInformationActions };
