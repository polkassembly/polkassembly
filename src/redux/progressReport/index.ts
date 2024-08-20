// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IProgressReportStore } from './@types';
import { HYDRATE } from 'next-redux-wrapper';

const initialState: IProgressReportStore = {
	add_progress_report_modal_open: false,
	add_summary_cta_clicked: false,
	open_rating_modal: false,
	open_rating_success_modal: false,
	open_success_modal: false,
	post_report_added: false,
	report_uploaded: false,
	summary_content: ''
};

export const progressReportStore = createSlice({
	extraReducers: (builder) => {
		builder.addCase(HYDRATE, (state, action) => {
			console.log('hydrate campaigns', (action as PayloadAction<any>).payload);
			return {
				...state,
				...(action as PayloadAction<any>).payload.batchVote
			};
		});
	},
	initialState,
	name: 'progressReport',
	reducers: {
		reset: (state) => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			state = {
				add_progress_report_modal_open: false,
				add_summary_cta_clicked: false,
				open_rating_modal: false,
				open_rating_success_modal: false,
				open_success_modal: false,
				post_report_added: false,
				report_uploaded: false,
				summary_content: ''
			};
		},
		setAddProgressReportModalOpen: (state, action: PayloadAction<boolean>) => {
			state.add_progress_report_modal_open = action.payload;
		},
		setAddSummaryCTAClicked: (state, action: PayloadAction<boolean>) => {
			state.add_summary_cta_clicked = action.payload;
		},
		setOpenRatingModal: (state, action: PayloadAction<boolean>) => {
			state.open_rating_modal = action.payload;
		},
		setOpenRatingSuccessModal: (state, action: PayloadAction<boolean>) => {
			state.open_rating_success_modal = action.payload;
		},
		setOpenSuccessModal: (state, action: PayloadAction<boolean>) => {
			state.open_success_modal = action.payload;
		},
		setPostReportAdded: (state, action: PayloadAction<boolean>) => {
			state.post_report_added = action.payload;
		},
		setReportUploaded: (state, action: PayloadAction<boolean>) => {
			state.report_uploaded = action.payload;
		},
		setSummaryContent: (state, action: PayloadAction<string>) => {
			state.summary_content = action.payload;
		}
	}
});

export default progressReportStore.reducer;
const progressReportActions = progressReportStore.actions;
export { progressReportActions };
