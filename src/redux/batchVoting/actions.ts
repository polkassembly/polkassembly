// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { createAsyncThunk } from '@reduxjs/toolkit';
import { batchVotesActions } from '.';
import { EVoteDecisionType } from '~src/types';

interface IBatchVotingDefaults {
	values: {
		voteOption?: string;
		ayeVoteBalance?: string;
		nyeVoteBalance?: string;
		abstainAyeVoteBalance?: string;
		abstainNyeVoteBalance?: string;
		abstainVoteBalance?: string;
		conviction?: number;
	};
}

export const editBatchValueChanged = createAsyncThunk('house/editProfileFieldValueChanged', async (params: IBatchVotingDefaults, { dispatch }) => {
	const { values } = params;
	if (values?.voteOption) {
		dispatch(
			batchVotesActions.setBatchVoting_Field({
				key: 'voteOption',
				value: values?.voteOption || EVoteDecisionType.AYE
			})
		);
	} else if (values?.ayeVoteBalance) {
		dispatch(
			batchVotesActions.setBatchVoting_Field({
				key: 'ayeVoteBalance',
				value: values?.ayeVoteBalance || ''
			})
		);
	} else if (values?.nyeVoteBalance) {
		dispatch(
			batchVotesActions.setBatchVoting_Field({
				key: 'nyeVoteBalance',
				value: values?.nyeVoteBalance || ''
			})
		);
	} else if (values?.abstainAyeVoteBalance) {
		dispatch(
			batchVotesActions.setBatchVoting_Field({
				key: 'abstainAyeVoteBalance',
				value: values?.abstainAyeVoteBalance || ''
			})
		);
	} else if (values?.abstainNyeVoteBalance) {
		dispatch(
			batchVotesActions.setBatchVoting_Field({
				key: 'abstainNyeVoteBalance',
				value: values?.abstainNyeVoteBalance || ''
			})
		);
	} else if (values?.abstainVoteBalance) {
		dispatch(
			batchVotesActions.setBatchVoting_Field({
				key: 'abstainVoteBalance',
				value: values?.abstainVoteBalance || ''
			})
		);
	} else if (values?.conviction) {
		dispatch(
			batchVotesActions.setBatchVoting_Field({
				key: 'conviction',
				value: values?.conviction
			})
		);
	}
});

export const editCartPostValueChanged = createAsyncThunk('house/editProfileFieldValueChanged', async (params: IBatchVotingDefaults, { dispatch }) => {
	const { values } = params;
	if (values?.voteOption) {
		dispatch(
			batchVotesActions.setEditCartPost_Field({
				key: 'voteOption',
				value: values?.voteOption || EVoteDecisionType.AYE
			})
		);
	} else if (values?.ayeVoteBalance) {
		dispatch(
			batchVotesActions.setEditCartPost_Field({
				key: 'ayeVoteBalance',
				value: values?.ayeVoteBalance || '0.1'
			})
		);
	} else if (values?.nyeVoteBalance) {
		dispatch(
			batchVotesActions.setEditCartPost_Field({
				key: 'nyeVoteBalance',
				value: values?.nyeVoteBalance || '0.1'
			})
		);
	} else if (values?.abstainAyeVoteBalance) {
		dispatch(
			batchVotesActions.setEditCartPost_Field({
				key: 'abstainAyeVoteBalance',
				value: values?.abstainAyeVoteBalance || '0.1'
			})
		);
	} else if (values?.abstainNyeVoteBalance) {
		dispatch(
			batchVotesActions.setEditCartPost_Field({
				key: 'abstainNyeVoteBalance',
				value: values?.abstainNyeVoteBalance || '0.1'
			})
		);
	} else if (values?.abstainVoteBalance) {
		dispatch(
			batchVotesActions.setEditCartPost_Field({
				key: 'abstainVoteBalance',
				value: values?.abstainVoteBalance || '0.1'
			})
		);
	} else if (values?.conviction) {
		dispatch(
			batchVotesActions.setEditCartPost_Field({
				key: 'conviction',
				value: values?.conviction || 0.1
			})
		);
	}
});
