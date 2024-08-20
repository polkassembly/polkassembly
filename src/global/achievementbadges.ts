// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BadgeName } from '~src/auth/types';

export interface BadgeDetails {
	description: string;
	id: string;
	img: string;
	name: BadgeName;
	requirements: string;
}

export const badgeDetails: BadgeDetails[] = [
	{
		description: 'Awarded to Polkadot delegates who have significant influence.',
		id: '1',
		img: '',
		name: BadgeName.DecentralisedVoice_polkodot,
		requirements: 'Must be a delegate on the Polkadot network.'
	},
	{
		description: 'Awarded to Kusama delegates who have significant influence.',
		id: '2',
		img: '',
		name: BadgeName.DecentralisedVoice_kusama,
		requirements: 'Must be a delegate on the Kusama network.'
	},
	{
		description: 'Rank 1 and above Fellow.',
		id: '3',
		img: '',
		name: BadgeName.Fellow,
		requirements: 'Must achieve a rank of 1 or higher.'
	},
	{
		description: 'Member of the governance council.',
		id: '4',
		img: '',
		name: BadgeName.Council,
		requirements: 'Must be a member of the governance council.'
	},
	{
		description: 'Actively participates in voting on proposals.',
		id: '5',
		img: '',
		name: BadgeName.ActiveVoter,
		requirements: 'Must vote on at least 15% of proposals with a minimum of 5 proposals.'
	},
	{
		description: 'Holds a significant amount of voting power.',
		id: '6',
		img: '',
		name: BadgeName.Whale,
		requirements: 'Must have voting power equal to or greater than 0.05% of the total supply.'
	},
	{
		description: 'Regularly contributes comments.',
		id: '7',
		img: '',
		name: BadgeName.SteadfastCommentor,
		requirements: 'Must have more than 50 comments.'
	},
	{
		description: 'Regularly votes on proposals.',
		id: '8',
		img: '',
		name: BadgeName.GMVoter,
		requirements: 'Must have voted on more than 50 proposals.'
	},
	{
		description: 'Received significant delegated tokens.',
		id: '9',
		img: '',
		name: BadgeName.PopularDelegate,
		requirements: 'Must have received delegated tokens equal to or greater than 0.01% of the total supply.'
	}
];
