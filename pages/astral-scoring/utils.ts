// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EActionType, IScoringSection } from './types';

export const scoringData: IScoringSection[] = [
	{
		icon: '/assets/astral-scoring-page/profile-icon.svg',
		items: [
			{ label: 'Add Profile Picture', points: '0.5', type: EActionType.OffChain },
			{ label: 'Add bio', points: '0.5', type: EActionType.OffChain },
			{ label: 'Link Multiple Wallet addresses', points: '0.5', type: EActionType.OffChain },
			{ label: 'Add Description', points: '0.5', type: EActionType.OffChain },
			{ label: 'Add Tags', points: '0.25', type: EActionType.OffChain }
		],
		title: 'Profile'
	},
	{
		icon: '/assets/icons/referendum-icon.svg',
		items: [
			{ label: 'Like/Dislike', points: '0.25', type: EActionType.OffChain },
			{ label: 'Post a comment or Reply to one', points: '1', type: EActionType.OffChain },
			{ label: 'Vote Successfully Passed', points: '1', type: EActionType.OnChain },
			{ label: 'Vote Failed', points: '2', type: EActionType.OnChain },
			{ label: 'Create Proposal/Referendum', points: '5', type: EActionType.OnChain },
			{ label: 'Link Discussion to Proposal', points: '0.5', type: EActionType.OnChain },
			{ label: 'Take Quiz', points: '1', type: EActionType.OnChain },
			{ label: 'Answer Quiz Correctly before Vote', points: '1', type: EActionType.OnChain },
			{ label: 'Vote on Treasury Proposal', points: '2', type: EActionType.OnChain },
			{ label: 'User can place decision deposit on behalf of another proposal', points: '1-5', type: EActionType.OnChain },
			{ label: 'Received a like on your comment/reply', points: '1', type: EActionType.OnChain }
		],
		title: 'Referendum'
	},
	{
		icon: '/assets/astral-scoring-page/delegation.svg',
		items: [
			{ label: 'User delegates their vote to another user (irrespective of # of tracks - one time)', points: '5', type: EActionType.OnChain },
			{ label: 'Received Delegation- User receives delegation from another user', points: '1', type: EActionType.OnChain }
		],
		title: 'Delegation'
	},
	{
		icon: '/assets/astral-scoring-page/discussion-icon.svg',
		items: [
			{ label: 'Like/Dislike', points: '0.25', type: EActionType.OffChain },
			{ label: 'Post a comment or Reply to one', points: '0.25', type: EActionType.OffChain },
			{ label: 'Link Discussion to Proposal', points: '0.5', type: EActionType.OnChain },
			{ label: 'Create Discussion', points: '1', type: EActionType.OffChain },
			{ label: 'Received a like on your discussions', points: '1', type: EActionType.OffChain },
			{ label: 'Received a like on your comment / reply', points: '1', type: EActionType.OffChain }
		],
		title: 'Discussions'
	},
	{
		icon: '/assets/astral-scoring-page/bounty-icon.svg',
		items: [
			{ label: 'Create Bounty', points: '5', type: EActionType.OnChain },
			{ label: 'Approve Bounty', points: '1', type: EActionType.OnChain },
			{ label: 'Create Child Bounty', points: '3', type: EActionType.OnChain },
			{ label: 'Claim Bounty', points: '0.5', type: EActionType.OnChain }
		],
		title: 'Bounties'
	},
	{
		icon: '/assets/astral-scoring-page/verfiy-id.svg',
		items: [
			{ label: 'Verify identity- Sign up for verification of on chain identity', points: '2', type: EActionType.OnChain },
			{ label: 'Verify identity- Request and complete judgement', points: '3', type: EActionType.OnChain }
		],
		title: 'Verify Identity'
	},
	{
		icon: '/assets/astral-scoring-page/tips-icon.svg',
		items: [
			{ label: 'Create Tip', points: '2', type: EActionType.OnChain },
			{ label: 'Give Tip', points: '1', type: EActionType.OnChain },
			{ label: 'User tips a new user at Polkassembly with > 0.1 Token', points: '1-5', type: EActionType.OnChain }
		],
		title: 'Tips'
	}
];
