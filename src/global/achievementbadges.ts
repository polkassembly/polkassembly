// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BadgeName } from '~src/auth/types';

export interface BadgeDetails {
	description: string;
	id: string;
	img: string;
	active?: boolean;
	name: BadgeName;
	requirements: string;
}

export const badgeDetails: BadgeDetails[] = [
	{
		active: true,
		description: 'Awarded to Polkadot delegates who have significant influence.',
		id: '1',
		img: '/assets/badges/DV.svg',
		name: BadgeName.DecentralisedVoice_polkodot,
		requirements: 'Must be a delegate on the Polkadot network.'
	},
	{
		active: false,
		description: 'Awarded to Kusama delegates who have significant influence.',
		id: '2',
		img: '/assets/badges/DV.svg',
		name: BadgeName.DecentralisedVoice_kusama,
		requirements: 'Must be a delegate on the Kusama network.'
	},
	{
		active: true,
		description: 'Rank 1 and above Fellow.',
		id: '3',
		img: '/assets/badges/fellow.svg',
		name: BadgeName.Fellow,
		requirements: 'Must achieve a rank of 1 or higher.'
	},
	{
		active: true,
		description: 'Actively participates in voting on proposals.',
		id: '5',
		img: '/assets/badges/active-voter.svg',
		name: BadgeName.ActiveVoter,
		requirements: 'Must vote on at least 15% of proposals with a minimum of 5 proposals.'
	},
	{
		active: true,
		description: 'Holds a significant amount of voting power.',
		id: '6',
		img: '/assets/badges/whale-badge.svg',
		name: BadgeName.Whale,
		requirements: 'Must have voting power equal to or greater than 0.05% of the total supply.'
	},
	{
		active: true,
		description: 'Awarded to Polkadot delegates who have significant influence.',
		id: '1',
		img: '/assets/badges/DV.svg',
		name: BadgeName.DecentralisedVoice_polkodot,
		requirements: 'Must be a delegate on the Polkadot network.'
	},
	{
		active: false,
		description: 'Regularly contributes comments.',
		id: '7',
		img: '',
		name: BadgeName.SteadfastCommentor,
		requirements: 'Must have more than 50 comments.'
	},
	{
		active: false,
		description: 'Awarded to Kusama delegates who have significant influence.',
		id: '2',
		img: '/assets/badges/DV.svg',
		name: BadgeName.DecentralisedVoice_kusama,
		requirements: 'Must be a delegate on the Kusama network.'
	},
	{
		active: true,
		description: 'Member of the governance council.',
		id: '4',
		img: '/assets/badges/council.svg',
		name: BadgeName.Council,
		requirements: 'Must be a member of the governance council.'
	},
	{
		active: false,
		description: 'Regularly votes on proposals.',
		id: '8',
		img: '',
		name: BadgeName.GMVoter,
		requirements: 'Must have voted on more than 50 proposals.'
	},
	{
		active: false,
		description: 'Received significant delegated tokens.',
		id: '9',
		img: '',
		name: BadgeName.PopularDelegate,
		requirements: 'Must have received delegated tokens equal to or greater than 0.01% of the total supply.'
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
