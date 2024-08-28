// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BadgeName } from '~src/auth/types';

export interface BadgeDetails {
	description: string;
	img: string;
	name: BadgeName;
	requirements: string;
}

export const badgeNames = ['Decentralised Voice', 'Fellow', 'Council Member', 'Active Voter', 'Whale', 'Steadfast Commentor', 'GM Voter', 'Popular Delegate'];

export const badgeDetails: BadgeDetails[] = [
	{
		description: 'Receive delegation of 1,000,000 at 6x conviction from Web3 Foundation to unlock this badge.',
		img: '/assets/badges/decentralised_voice.svg',
		name: BadgeName.DECENTRALISED_VOICE,
		requirements: 'Must be a delegate on the Kusama network.'
	},
	{
		description: 'Achieve the prestigious rank of Fellow, starting from Rank 1.',
		img: '/assets/badges/fellow.svg',
		name: BadgeName.FELLOW,
		requirements: 'Must achieve a rank of 1 or higher.'
	},
	{
		description: 'Recognized as a member of the influential governance council.',
		img: '/assets/badges/Council.svg',
		name: BadgeName.COUNCIL,
		requirements: 'Must be a member of the governance council.'
	},
	{
		description: 'Consistently engages in governance by voting on key proposals.',
		img: '/assets/badges/active_voter.svg',
		name: BadgeName.ACTIVE_VOTER,
		requirements: 'Must vote on at least 15% of proposals with a minimum of 5 proposals.'
	},
	{
		description: 'A key stakeholder with significant voting power in the network.',
		img: '/assets/badges/whale.svg',
		name: BadgeName.WHALE,
		requirements: 'Must have voting power equal to or greater than 0.05% of the total supply.'
	}
];
