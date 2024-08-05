import { BadgeName } from '~src/auth/types';

export interface BadgeDetails {
	id: string;
	name: BadgeName;
	description: string;
	requirements: string;
	img: string;
}

export const badgeDetails: BadgeDetails[] = [
	{
		id: '1',
		name: BadgeName.DecentralisedVoice_polkodot,
		description: 'Awarded to Polkadot delegates who have significant influence.',
		requirements: 'Must be a delegate on the Polkadot network.',
		img: ''
	},
	{
		id: '2',
		name: BadgeName.DecentralisedVoice_kusama,
		description: 'Awarded to Kusama delegates who have significant influence.',
		requirements: 'Must be a delegate on the Kusama network.',
		img: ''
	},
	{
		id: '3',
		name: BadgeName.Fellow,
		description: 'Rank 1 and above Fellow.',
		requirements: 'Must achieve a rank of 1 or higher.',
		img: ''
	},
	{
		id: '4',
		name: BadgeName.Council,
		description: 'Member of the governance council.',
		requirements: 'Must be a member of the governance council.',
		img: ''
	},
	{
		id: '5',
		name: BadgeName.ActiveVoter,
		description: 'Actively participates in voting on proposals.',
		requirements: 'Must vote on at least 15% of proposals with a minimum of 5 proposals.',
		img: ''
	},
	{
		id: '6',
		name: BadgeName.Whale,
		description: 'Holds a significant amount of voting power.',
		requirements: 'Must have voting power equal to or greater than 0.05% of the total supply.',
		img: ''
	},
	{
		id: '7',
		name: BadgeName.SteadfastCommentor,
		description: 'Regularly contributes comments.',
		requirements: 'Must have more than 50 comments.',
		img: ''
	},
	{
		id: '8',
		name: BadgeName.GMVoter,
		description: 'Regularly votes on proposals.',
		requirements: 'Must have voted on more than 50 proposals.',
		img: ''
	},
	{
		id: '9',
		name: BadgeName.PopularDelegate,
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
