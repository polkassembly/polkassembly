// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EUserActivityCategory, EUserActivityType } from '~src/types';

/* eslint-disable sort-keys */

// Refers to https://docs.google.com/spreadsheets/d/1Yqqjsg9d1VYl4Da8Hz8hYX24cKgAlqfa_dPnT7C6AcU

const REPUTATION_SCORES = {
	reaction: {
		value: 0.25,
		category: EUserActivityCategory.OFF_CHAIN,
		type: EUserActivityType.REACTED
	},
	comment: {
		value: 1,
		category: EUserActivityCategory.OFF_CHAIN,
		type: EUserActivityType.COMMENTED
	},
	reply: {
		value: 0.5,
		category: EUserActivityCategory.OFF_CHAIN,
		type: EUserActivityType.REPLIED
	},
	vote_passed: {
		value: 1,
		category: EUserActivityCategory.ON_CHAIN,
		type: EUserActivityType.VOTE_PASSED
	},
	vote_failed: {
		value: -2,
		category: EUserActivityCategory.ON_CHAIN,
		type: EUserActivityType.VOTE_FAILED
	},
	create_discussion: {
		value: 1,
		category: EUserActivityCategory.OFF_CHAIN,
		type: EUserActivityType.CREATE_DISCUSSION
	},
	create_referendum: {
		value: 5,
		category: EUserActivityCategory.ON_CHAIN,
		type: EUserActivityType.CREATE_REFERENDUM
	},
	add_context: {
		value: 0.5,
		category: EUserActivityCategory.OFF_CHAIN,
		type: EUserActivityType.ADD_CONTEXT
	},
	take_quiz: {
		value: 1,
		category: EUserActivityCategory.OFF_CHAIN,
		type: EUserActivityType.TAKE_QUIZ
	},
	quiz_answer_correct: {
		value: 1,
		category: EUserActivityCategory.OFF_CHAIN,
		type: EUserActivityType.QUIZ_ANSWER_CORRECT
	},
	create_tip: {
		value: 2,
		category: EUserActivityCategory.ON_CHAIN,
		type: EUserActivityType.CREATE_TIP
	},
	give_tip: {
		value: 1,
		category: EUserActivityCategory.ON_CHAIN,
		type: EUserActivityType.GIVE_TIP
	},
	vote_treasury_proposal: {
		value: 2,
		category: EUserActivityCategory.ON_CHAIN,
		type: EUserActivityType.VOTED
	},
	create_bounty: {
		value: 5,
		category: EUserActivityCategory.ON_CHAIN,
		type: EUserActivityType.CREATE_BOUNTY
	},
	approve_bounty: {
		value: 1,
		category: EUserActivityCategory.ON_CHAIN,
		type: EUserActivityType.APPROVE_BOUNTY
	},
	create_child_bounty: {
		value: 3,
		category: EUserActivityCategory.ON_CHAIN,
		type: EUserActivityType.CREATE_CHILD_BOUNTY
	},
	claim_bounty: {
		value: 0.5,
		category: EUserActivityCategory.ON_CHAIN,
		type: EUserActivityType.CLAIM_BOUNTY
	},
	add_profile_picture: {
		value: 0.5,
		category: EUserActivityCategory.PROFILE,
		type: EUserActivityType.UPDATE_PROFILE
	},
	add_bio: {
		value: 0.5,
		category: EUserActivityCategory.PROFILE,
		type: EUserActivityType.UPDATE_PROFILE
	},
	link_multiple_wallet_addresses: {
		value: 0.5,
		category: EUserActivityCategory.PROFILE,
		type: EUserActivityType.UPDATE_PROFILE
	},
	add_profile_title: {
		value: 0.5,
		category: EUserActivityCategory.PROFILE,
		type: EUserActivityType.UPDATE_PROFILE
	},
	add_profile_tags: {
		value: 0.5,
		category: EUserActivityCategory.PROFILE,
		type: EUserActivityType.UPDATE_PROFILE
	},
	comment_taken_down: {
		first: -10,
		second: -20,
		third_or_more: -30,
		category: EUserActivityCategory.OFF_CHAIN,
		type: EUserActivityType.CENSORED
	},
	post_reported: {
		value: -10,
		category: EUserActivityCategory.OFF_CHAIN,
		type: EUserActivityType.CENSORED
	},
	post_taken_down_or_marked_as_spam: {
		first: -25,
		second: -50,
		third_or_more: -100,
		category: EUserActivityCategory.OFF_CHAIN,
		type: EUserActivityType.CENSORED
	},
	on_chain_identity_verification_sign_up: {
		value: 2,
		category: EUserActivityCategory.ON_CHAIN,
		type: EUserActivityType.ON_CHAIN_IDENTITY_INITIATED
	},
	complete_on_chain_identity_judgement: {
		value: 3,
		category: EUserActivityCategory.ON_CHAIN,
		type: EUserActivityType.ON_CHAIN_IDENTITY_INITIATED
	},
	spam_report: {
		first: -5,
		second: -10,
		third_or_more: -20,
		category: EUserActivityCategory.OFF_CHAIN,
		type: EUserActivityType.CENSORED
	},
	first_delegation: {
		value: 5,
		category: EUserActivityCategory.ON_CHAIN,
		type: EUserActivityType.DELEGATED
	},
	recieved_delegation: {
		value: 1,
		category: EUserActivityCategory.ON_CHAIN,
		type: EUserActivityType.RECEIVED_DELEGATION
	},
	loss_due_to_slashing_tip_or_proposal: {
		first: -20,
		second: -40,
		third_or_more: -50,
		category: EUserActivityCategory.ON_CHAIN,
		type: EUserActivityType.CENSORED
	},
	tip_new_user: {
		first: 5,
		second: 2,
		third_or_more: 1,
		category: EUserActivityCategory.ON_CHAIN,
		type: EUserActivityType.GIVE_TIP
	},
	decision_deposit_on_foriegn_proposal: {
		first: 5,
		second: 2,
		third_or_more: 1,
		category: EUserActivityCategory.ON_CHAIN,
		type: EUserActivityType.DECISION_DEPOSIT_ON_FORIEGN_PROPOSAL
	},
	recieved_like_on_discussion: {
		first_five: 0.1,
		sixth_to_tenth: 0.5,
		more_than_ten: 1,
		category: EUserActivityCategory.OFF_CHAIN,
		type: EUserActivityType.RECIEVED_REACTION
	},
	recieved_like_on_comment_or_reply: {
		first_five: 0.1,
		sixth_to_tenth: 0.5,
		more_than_ten: 1,
		category: EUserActivityCategory.OFF_CHAIN,
		type: EUserActivityType.RECIEVED_REACTION
	},
	removed_vote_or_reduced_conviction_after_six_hours: {
		first_three: -10,
		fourth_to_tenth: -15,
		more_than_ten: -30,
		category: EUserActivityCategory.ON_CHAIN,
		type: EUserActivityType.REMOVED_VOTE
	},
	failed_proposal: {
		first: -10,
		second: -20,
		third_or_more: -50,
		category: EUserActivityCategory.ON_CHAIN,
		type: EUserActivityType.FAILED_PROPOSAL
	}
};

export default REPUTATION_SCORES;
