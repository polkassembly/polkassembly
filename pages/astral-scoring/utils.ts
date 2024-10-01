// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IScoringSection } from './types';

export const scoringData: IScoringSection[] = [
	{
		icon: '/assets/astral-scoring-page/profile-icon.svg',
		items: [
			{ label: 'Add Profile Picture', points: 20, type: 'off-chain' },
			{ label: 'Add bio', points: 20, type: 'off-chain' },
			{ label: 'Link Multiple Wallet addresses', points: 20, type: 'off-chain' },
			{ label: 'Add Description', points: 20, type: 'off-chain' },
			{ label: 'Add Tags', points: 20, type: 'off-chain' }
		],
		title: 'Profile'
	},
	{
		icon: '/assets/icons/referendum-icon.svg',
		items: [
			{ label: 'Like/Dislike', points: 20, type: 'off-chain' },
			{ label: 'Post a comment or Reply to one', points: 5, type: 'on-chain' },
			{ label: 'Vote Successfully Passed', points: 16 },
			{ label: 'Vote Failed', points: 25 },
			{ label: 'Create Proposal/Referendum', points: 25 },
			{ label: 'Link Discussion to Proposal', points: 25, type: 'on-chain' },
			{ label: 'Take Quiz', points: 25 },
			{ label: 'Answer Quiz Correctly before Vote', points: 25 },
			{ label: 'Vote on Treasury Proposal', points: 25 },
			{ label: 'User can place decision deposit on behalf of another proposal', points: 25 },
			{ label: 'Received a like on your comment/reply', points: 25 }
		],
		title: 'Referendum'
	},
	{
		icon: '/assets/astral-scoring-page/tips-icon.svg',
		items: [
			{ label: 'Create Tip', points: 20 },
			{ label: 'User tips a new user at Polkassembly with > 0.1 Token', points: 5 }
		],
		title: 'Tips'
	},
	{
		icon: '/assets/astral-scoring-page/discussion-icon.svg',
		items: [
			{ label: 'Like/Dislike', points: 20, type: 'off-chain' },
			{ label: 'Post a comment or Reply to one', points: 5, type: 'off-chain' },
			{ label: 'Link Discussion to Proposal', points: 20, type: 'on-chain' },
			{ label: 'Create Discussion', points: 5, type: 'off-chain' },
			{ label: 'Received a like on your discussions', points: 10, type: 'off-chain' },
			{ label: 'Received a like on your comment / reply', points: 25, type: 'on-chain' }
		],
		title: 'Discussions'
	},
	{
		icon: '/assets/astral-scoring-page/bounty-icon.svg',
		items: [
			{ label: 'Create Bounty', points: 20, type: 'on-chain' },
			{ label: 'Approve Bounty', points: 5, type: 'on-chain' },
			{ label: 'Create Child Bounty', points: 10, type: 'on-chain' },
			{ label: 'Claim Bounty', points: 16, type: 'on-chain' }
		],
		title: 'Bounties'
	},
	{
		icon: '/assets/astral-scoring-page/verfiy-id.svg',
		items: [
			{ label: 'Verify identity- Sign up for verification of on chain identity', points: 20 },
			{ label: 'Verify identity- Request and complete judgement', points: 5 }
		],
		title: 'Verify Identity'
	},
	{
		icon: '/assets/astral-scoring-page/delegation.svg',
		items: [
			{ label: 'Sent DelegationUser delegates their vote to another user (irrespective of # of tracks - one time)', points: 10 },
			{ label: 'Received Delegation- User receives delegation from another user', points: 16 }
		],
		title: 'Delegation'
	}
];
