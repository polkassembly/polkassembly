// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { EContentType, EFooterType, ETitleType, IModalStore } from './@types';
import { HYDRATE } from 'next-redux-wrapper';

const initialState: IModalStore = {
	contentType: EContentType.NONE,
	footerType: EFooterType.NONE,
	open: false,
	titleType: ETitleType.NONE
};

export const modalStore = createSlice({
	extraReducers: (builder) => {
		builder.addCase(HYDRATE, (state, action) => {
			return {
				...state,
				...(action as PayloadAction<any>).payload.modal
			};
		});
	},
	initialState,
	name: 'modal',
	reducers: {
		setModal: (state, action: PayloadAction<IModalStore>) => {
			const { open, contentType, titleType, footerType } = action.payload;
			state.open = open;
			state.titleType = titleType;
			state.contentType = contentType;
			state.footerType = footerType;
		},
		setOpen: (state, action: PayloadAction<boolean>) => {
			state.open = action.payload;
		}
	}
});

export default modalStore.reducer;
const modalActions = modalStore.actions;
export {
	modalActions
};