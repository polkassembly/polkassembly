// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ICreateBountyFormState } from './@types';

const initialState: ICreateBountyFormState = {
	address: '',
	balance: '',
	categories: [],
	claims: 0,
	content: '',
	deadline: null,
	guidelines: '',
	isTwitterVerified: false,
	newBountyAmount: '',
	title: '',
	twitter: ''
};

export const userCreatedBountyFormStore = createSlice({
	initialState,
	name: 'createBountyForm',
	reducers: {
		resetForm: () => initialState,
		setFormField: (state, action: PayloadAction<{ field: keyof ICreateBountyFormState; value: any }>) => {
			const { field, value } = action.payload;
			switch (field) {
				case 'newBountyAmount':
					state[field] = String(value);
					break;
				case 'isTwitterVerified':
					state[field] = Boolean(value);
					break;
				default:
					if (field === 'balance' || field === 'content' || field === 'guidelines' || field === 'title' || field === 'twitter' || field === 'address') {
						state[field] = String(value);
					} else if (field === 'claims') {
						state[field] = Number(value);
					} else if (field === 'categories') {
						state[field] = value as string[];
					} else if (field === 'deadline') {
						state[field] = value as string | null;
					}
			}
		},
		setMultipleFormFields: (state, action: PayloadAction<Partial<ICreateBountyFormState>>) => {
			Object.assign(state, action.payload);
		}
	}
});

const CreateBountyFormActions = userCreatedBountyFormStore.actions;

export const setFormField = (field: keyof ICreateBountyFormState, value: any): PayloadAction<{ field: keyof ICreateBountyFormState; value: any }> => {
	return CreateBountyFormActions.setFormField({ field, value });
};

export const setMultipleFormFields = (value: Partial<ICreateBountyFormState>): PayloadAction<Partial<ICreateBountyFormState>> => {
	return CreateBountyFormActions.setMultipleFormFields(value);
};

export const resetForm = () => {
	return CreateBountyFormActions.resetForm();
};

export default userCreatedBountyFormStore.reducer;
