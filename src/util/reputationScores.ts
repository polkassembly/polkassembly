// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */

// Refers to https://docs.google.com/spreadsheets/d/1Yqqjsg9d1VYl4Da8Hz8hYX24cKgAlqfa_dPnT7C6AcU

const REPUTATION_SCORES = {
	reaction: {
		value: 0.25
	},
	comment: {
		value: 1
	},
	reply: {
		value: 0.5
	},
	vote_passed: {
		value: 1
	},
	vote_failed: {
		value: -2
	},
	create_discussion: {
		value: 1
	},
	create_referendum: {
		value: 5
	},
	add_context: {
		value: 0.5
	},
	take_quiz: {
		value: 1
	},
	quiz_answer_correct: {
		value: 1
	},
	create_tip: {
		value: 2
	},
	vote_treasury_proposal: {
		value: 2
	},
	create_bounty: {
		value: 5
	},
	approve_bounty: {
		value: 1
	},
	create_child_bounty: {
		value: 3
	},
	claim_bounty: {
		value: 0.5
	},
	add_profile_picture: {
		value: 0.5
	},
	add_bio: {
		value: 0.5
	},
	link_multiple_wallet_addresses: {
		value: 0.5
	},
	add_profile_title: {
		value: 0.5
	},
	add_profile_tags: {
		value: 0.5
	},
	comment_taken_down: {
		first: -10,
		second: -20,
		third_or_more: -30
	},
	post_reported: {
		value: -10
	},
	post_taken_down_or_marked_as_spam: {
		first: -25,
		second: -50,
		third_or_more: -100
	},
	on_chain_identity_verification_sign_up: {
		value: 2
	},
	complete_on_chain_identity_judgement: {
		value: 3
	},
	spam_report: {
		first: -5,
		second: -10,
		third_or_more: -20
	},
	first_delegation: {
		value: 5
	},
	recieved_delegation: {
		value: 1
	},
	loss_due_to_slashing_tip_or_proposal: {
		first: -20,
		second: -40,
		third_or_more: -50
	},
	tip_new_user: {
		first: 5,
		second: 2,
		third_or_more: 1
	},
	decision_deposit_on_foriegn_proposal: {
		first: 5,
		second: 2,
		third_or_more: 1
	},
	recieved_like_on_discussion: {
		first_five: 0.1,
		sixth_to_tenth: 0.5,
		more_than_ten: 1
	},
	recieved_like_on_comment_or_reply: {
		first_five: 0.1,
		sixth_to_tenth: 0.5,
		more_than_ten: 1
	},
	removed_vote_or_reduced_conviction_after_six_hours: {
		first_three: -10,
		fourth_to_tenth: -15,
		more_than_ten: -30
	},
	failed_proposal: {
		first: -10,
		second: -20,
		third_or_more: -50
	},
	passed_proposal: {
		first: 10,
		second: 20,
		third_or_more: 50
	}
};

export default REPUTATION_SCORES;
