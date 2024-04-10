// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { IRemoveIdentityStore } from './@types';

const initialState: IRemoveIdentityStore = {
	openAddressSelectModal: false,
	openRemoveIdentityModal: false
};

export const removeIdentityStore = createSlice({
	extraReducers: (builder) => {
		builder.addCase(HYDRATE, (state, action) => {
			return {
				...state,
				...(action as PayloadAction<any>).payload.removeIdentity
			};
		});
	},
	initialState,
	name: 'removeIdentity',
	reducers: {
		setOpenRemoveIdentityModal: (state, action: PayloadAction<boolean>) => {
			state.openRemoveIdentityModal = action.payload;
		},
		setOpenRemoveIdentitySelectAddressModal: (state, action: PayloadAction<boolean>) => {
			state.openAddressSelectModal = action.payload;
		}
	}
});
const removeIdentityActions = removeIdentityStore.actions;

const setOpenRemoveIdentityModal: any = (value: boolean) => {
	return (dispatch: any) => {
		dispatch(removeIdentityActions.setOpenRemoveIdentityModal(value));
	};
};

const setOpenRemoveIdentitySelectAddressModal: any = (value: boolean) => {
	return (dispatch: any) => {
		dispatch(removeIdentityActions.setOpenRemoveIdentitySelectAddressModal(value));
	};
};

export default removeIdentityStore.reducer;
export { setOpenRemoveIdentityModal, removeIdentityActions, setOpenRemoveIdentitySelectAddressModal };
