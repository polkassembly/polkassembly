// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IBatchVotesDetails, IBatchVoteStore, IVoteCardInfo } from './@types';
import { HYDRATE } from 'next-redux-wrapper';

const initialState: IBatchVoteStore = {
	batch_vote_details: {},
	show_cart_menu: false,
	total_proposals_added_in_Cart: 0,
	vote_card_info: {
		post_id: 0,
		post_title: '',
		voted_for: ''
	},
	vote_card_info_array: []
};

type IBatchVotesPayload = {
	[K in keyof IBatchVotesDetails]: {
		key: K;
		value: IBatchVotesDetails[K];
	};
}[keyof IBatchVotesDetails];

type IVoteCardInfoPayload = {
	[K in keyof IVoteCardInfo]: {
		key: K;
		value: IVoteCardInfo[K];
	};
}[keyof IVoteCardInfo];

export const batchVoteStore = createSlice({
	extraReducers: (builder) => {
		builder.addCase(HYDRATE, (state, action) => {
			console.log('hydrate campaigns', (action as PayloadAction<any>).payload);
			return {
				...state,
				...(action as PayloadAction<any>).payload.campaigns
			};
		});
	},
	initialState,
	name: 'batchVote',
	reducers: {
		reset: (state) => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			state = {
				batch_vote_details: {},
				show_cart_menu: false,
				total_proposals_added_in_Cart: 0,
				vote_card_info: {
					post_id: 0,
					post_title: '',
					voted_for: ''
				},
				vote_card_info_array: []
			};
		},
		setBatchVoting_Field: (state, action: PayloadAction<IBatchVotesPayload>) => {
			const obj = action.payload;
			if (obj) {
				const { key, value } = obj;
				switch (key) {
					case 'voteOption':
						state.batch_vote_details[key] = value;
						break;
					case 'voteBalance':
						state.batch_vote_details[key] = value;
						break;
					case 'ayeVoteBalance':
						state.batch_vote_details[key] = value;
						break;
					case 'nyeVoteBalance':
						state.batch_vote_details[key] = value;
						break;
					case 'abstainVoteBalance':
						state.batch_vote_details[key] = value;
						break;
					case 'conviction':
						state.batch_vote_details[key] = value;
						break;
				}
			}
		},
		setShowCartMenu: (state, action: PayloadAction<boolean>) => {
			state.show_cart_menu = action.payload;
		},
		setTotalVotesAddedInCart: (state, action: PayloadAction<number>) => {
			state.total_proposals_added_in_Cart = action.payload;
		},
		setvoteCardInfo: (state, action: PayloadAction<IVoteCardInfo>) => {
			state.vote_card_info = action.payload;
			state.vote_card_info_array.push(action.payload);
		},
		setvoteCardInfo_field: (state, action: PayloadAction<IVoteCardInfoPayload>) => {
			const obj = action.payload;
			if (obj) {
				const { key, value } = obj;
				switch (key) {
					case 'post_id':
						state.vote_card_info[key] = value;
						break;
					case 'post_title':
						state.vote_card_info[key] = value;
						break;
					case 'voted_for':
						state.vote_card_info[key] = value;
						break;
				}
			}
		}
	}
});

export default batchVoteStore.reducer;
const batchVotesActions = batchVoteStore.actions;
export { batchVotesActions };
