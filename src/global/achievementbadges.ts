// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */

import { BadgeName } from '~src/auth/types';

export interface BadgeDetails {
	id: string;
	name: BadgeName;
	description: string;
	requirements: string;
	img: string;
	active?: boolean;
}

export const badgeDetails: BadgeDetails[] = [
	{
		id: '1',
		name: BadgeName.DecentralisedVoice_polkodot,
		active: true,
		description: 'Awarded to Polkadot delegates who have significant influence.',
		requirements: 'Must be a delegate on the Polkadot network.',
		img: '/assets/badges/DV.svg'
	},
	{
		id: '2',
		name: BadgeName.DecentralisedVoice_kusama,
		active: false,
		description: 'Awarded to Kusama delegates who have significant influence.',
		requirements: 'Must be a delegate on the Kusama network.',
		img: '/assets/badges/DV.svg'
	},
	{
		id: '3',
		name: BadgeName.Fellow,
		active: true,
		description: 'Rank 1 and above Fellow.',
		requirements: 'Must achieve a rank of 1 or higher.',
		img: '/assets/badges/fellow.svg'
	},
	{
		id: '4',
		name: BadgeName.Council,
		active: true,
		description: 'Member of the governance council.',
		requirements: 'Must be a member of the governance council.',
		img: '/assets/badges/council.svg'
	},
	{
		id: '5',
		name: BadgeName.ActiveVoter,
		active: true,
		description: 'Actively participates in voting on proposals.',
		requirements: 'Must vote on at least 15% of proposals with a minimum of 5 proposals.',
		img: '/assets/badges/active-voter.svg'
	},
	{
		id: '6',
		name: BadgeName.Whale,
		active: true,
		description: 'Holds a significant amount of voting power.',
		requirements: 'Must have voting power equal to or greater than 0.05% of the total supply.',
		img: '/assets/badges/whale-badge.svg'
	},
	{
		id: '7',
		name: BadgeName.SteadfastCommentor,
		active: false,
		description: 'Regularly contributes comments.',
		requirements: 'Must have more than 50 comments.',
		img: ''
	},
	{
		id: '8',
		name: BadgeName.GMVoter,
		active: false,
		description: 'Regularly votes on proposals.',
		requirements: 'Must have voted on more than 50 proposals.',
		img: ''
	},
	{
		id: '9',
		name: BadgeName.PopularDelegate,
		active: false,
		description: 'Received significant delegated tokens.',
		requirements: 'Must have received delegated tokens equal to or greater than 0.01% of the total supply.',
		img: ''
	}
];

export const getWSProvider = (network: string) => {
	switch (network) {
		case 'kusama':
			return 'wss://kusama-rpc.polkadot.io';
		case 'polkadot':
			return 'wss://rpc.polkadot.io';
		case 'vara':
			return 'wss://rpc.vara.network';
		case 'rococo':
			return 'wss://rococo-rpc.polkadot.io';
		case 'moonbeam':
			return 'wss://wss.api.moonbeam.network';
		case 'moonriver':
			return 'wss://wss.moonriver.moonbeam.network';
		case 'moonbase':
			return 'wss://wss.api.moonbase.moonbeam.network';
		case 'picasso':
			return 'wss://picasso-rpc.composable.finance';
		case 'westend':
			return 'wss://westend-rpc.dwellir.com';
		default:
			return null;
	}
};
