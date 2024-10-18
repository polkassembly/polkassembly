// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IBatchVotesDetails, IBatchVoteStore, IVoteCardInfo } from './@types';
import { HYDRATE } from 'next-redux-wrapper';
import { EVoteDecisionType } from '~src/types';

const initialState: IBatchVoteStore = {
	batch_vote_details: {
		abstainAyeVoteBalance: '0',
		abstainNyeVoteBalance: '0',
		abstainVoteBalance: '0',
		ayeVoteBalance: '0',
		conviction: 0.1,
		nyeVoteBalance: '0',
		voteOption: 'aye'
	},
	batch_voting_address: '',
	edit_vote_details: {
		abstainAyeVoteBalance: '0',
		abstainNyeVoteBalance: '0',
		abstainVoteBalance: '0',
		ayeVoteBalance: '0',
		conviction: 0.1,
		nyeVoteBalance: '0',
		voteOption: 'aye'
	},
	is_cancel_button_clicked: false,
	is_default_selected: true,
	is_field_edited: false,
	post_ids_array: [],
	show_cart_menu: false,
	show_default_options_modal: false,
	total_active_posts: 0,
	total_proposals_added_in_Cart: 0,
	vote: EVoteDecisionType.AYE,
	vote_card_info: {
		abstainAyeBalance: '0',
		abstainNayBalance: '0',
		decision: 'aye',
		post_id: 0,
		post_title: '',
		voteBalance: 0,
		voteConviction: 0.1
	},
	vote_card_info_array: [],
	vote_cart_data: [],
	voted_post_ids_array: [],
	voted_proposal_id: 0
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
				...(action as PayloadAction<any>).payload.batchVote
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
				batch_voting_address: '',
				edit_vote_details: {},
				is_cancel_button_clicked: false,
				is_default_selected: true,
				is_field_edited: false,
				post_ids_array: [],
				show_cart_menu: false,
				show_default_options_modal: false,
				total_active_posts: 0,
				total_proposals_added_in_Cart: 0,
				vote: EVoteDecisionType.AYE,
				vote_card_info: {
					abstainAyeBalance: '',
					abstainNayBalance: '',
					decision: '',
					post_id: 0,
					post_title: '',
					voteBalance: 0,
					voteConviction: 0.1
				},
				vote_card_info_array: [],
				vote_cart_data: [],
				voted_post_ids_array: [],
				voted_proposal_id: 0
			};
		},
		setBatchVotingAddress: (state, action: PayloadAction<string>) => {
			state.batch_voting_address = action.payload;
		},
		setBatchVoting_Field: (state, action: PayloadAction<IBatchVotesPayload>) => {
			const obj = action.payload;
			if (obj) {
				const { key, value } = obj;
				switch (key) {
					case 'voteOption':
						state.batch_vote_details[key] = value;
						break;
					case 'ayeVoteBalance':
						state.batch_vote_details[key] = value;
						break;
					case 'nyeVoteBalance':
						state.batch_vote_details[key] = value;
						break;
					case 'abstainAyeVoteBalance':
						state.batch_vote_details[key] = value;
						break;
					case 'abstainNyeVoteBalance':
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
		setEditCartPost_Field: (state, action: PayloadAction<IBatchVotesPayload>) => {
			const obj = action.payload;
			if (obj) {
				const { key, value } = obj;
				switch (key) {
					case 'voteOption':
						state.edit_vote_details[key] = value;
						break;
					case 'ayeVoteBalance':
						state.edit_vote_details[key] = value;
						break;
					case 'nyeVoteBalance':
						state.edit_vote_details[key] = value;
						break;
					case 'abstainAyeVoteBalance':
						state.edit_vote_details[key] = value;
						break;
					case 'abstainNyeVoteBalance':
						state.edit_vote_details[key] = value;
						break;
					case 'abstainVoteBalance':
						state.edit_vote_details[key] = value;
						break;
					case 'conviction':
						state.edit_vote_details[key] = value;
						break;
				}
			}
		},
		setIsCancelButtonClicked: (state, action: PayloadAction<boolean>) => {
			state.is_default_selected = action.payload;
		},
		setIsDefaultSelected: (state, action: PayloadAction<boolean>) => {
			state.is_default_selected = action.payload;
		},
		setIsFieldEdited: (state, action: PayloadAction<boolean>) => {
			state.is_field_edited = action.payload;
		},
		setRemoveCartItems: (state, action: PayloadAction<any>) => {
			state.vote_cart_data = action.payload;
		},
		setRemoveVoteCardInfo: (state, action: PayloadAction<number>) => {
			state.vote_card_info_array = state.vote_card_info_array.filter((voteCard) => voteCard.post_id !== action.payload);
			state.total_proposals_added_in_Cart = state.vote_card_info_array.length;
		},
		setRemoveVoteCartItem: (state, action: PayloadAction<number>) => {
			state.vote_cart_data = state.vote_cart_data.filter((item) => item.id !== action.payload);
		},
		setShowCartMenu: (state, action: PayloadAction<boolean>) => {
			state.show_cart_menu = action.payload;
		},
		setShowDefaultOptionsModal: (state, action: PayloadAction<boolean>) => {
			state.show_default_options_modal = action.payload;
		},
		setTotalActivePosts: (state, action: PayloadAction<number>) => {
			state.total_active_posts = action.payload;
		},
		setTotalVotesAddedInCart: (state, action: PayloadAction<number>) => {
			state.total_proposals_added_in_Cart = action.payload;
		},
		setVote: (state, action: PayloadAction<string | EVoteDecisionType>) => {
			state.vote = action.payload;
		},
		setVoteCartData: (state, action: PayloadAction<any[]>) => {
			state.vote_cart_data = action.payload;
		},
		setVotedPostsIdsArray: (state, action: PayloadAction<number[]>) => {
			state.voted_post_ids_array = action.payload;
		},
		setVotedProposalId: (state, action: PayloadAction<number>) => {
			state.voted_proposal_id = action.payload;
			state.voted_post_ids_array.push(action.payload);
		},
		setVotesCardInfoArray: (state, action: PayloadAction<any>) => {
			state.vote_card_info_array = action.payload;
		},
		setvoteCardInfo: (state, action: PayloadAction<IVoteCardInfo>) => {
			state.vote_card_info = action.payload;
			state.vote_card_info_array.push(action.payload);

			const uniqueVoteCardInfoMap = new Map();
			state.vote_card_info_array.forEach((voteCard) => {
				uniqueVoteCardInfoMap.set(voteCard.post_id, voteCard);
			});
			state.vote_card_info_array = Array.from(uniqueVoteCardInfoMap.values());
			state.post_ids_array = state.vote_card_info_array.map((voteCard) => voteCard.post_id);
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
					case 'decision':
						state.vote_card_info[key] = value;
						break;
					case 'voteBalance':
						state.vote_card_info[key] = value;
						break;
					case 'voteConviction':
						state.vote_card_info[key] = value;
						break;
					case 'abstainAyeBalance':
						state.vote_card_info[key] = value;
						break;
					case 'abstainNayBalance':
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
