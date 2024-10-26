// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BadgeName } from '~src/auth/types';

export interface BadgeDetails {
	img: string;
	name: BadgeName;
	lockImg?: string;
	requirements: {
		locked: string | ((network: string) => string);
		unlocked: string | ((network: string) => string);
	};
}

export const badgeNames = ['Decentralised Voice', 'Fellow', 'Council Member', 'Active Voter', 'Whale', 'Steadfast Commentor', 'GM Voter', 'Popular Delegate'];

export const badgeDetails: BadgeDetails[] = [
	{
		img: '/assets/badges/decentralised_voice.svg',
		lockImg: '/assets/badges/decentralised_voice_locked.svg',
		name: BadgeName.DECENTRALISED_VOICE,
		requirements: {
			locked: (network: string) => `You must become a delegate on the ${network} network and aim to receive 1,000,000 tokens with a 6x conviction.`,
			unlocked: (network: string) => `Congratulations! You’ve received a delegation of 1,000,000 tokens at 6x conviction from the Web3 Foundation on the ${network} network.`
		}
	},
	{
		img: '/assets/badges/fellow.svg',
		lockImg: '/assets/badges/fellow_locked.svg',
		name: BadgeName.FELLOW,
		requirements: {
			locked: 'You must achieve a minimum rank of 1 to unlock the Fellow badge.',
			unlocked: 'Well done! You’ve achieved Rank 1 or higher and unlocked the Fellow badge.'
		}
	},
	{
		img: '/assets/badges/Council.svg',
		lockImg: '/assets/badges/council_locked.svg',
		name: BadgeName.COUNCIL,
		requirements: {
			locked: 'You must be elected as a member of the governance council to unlock this badge.',
			unlocked: 'You are recognized as a member of the governance council. Badge unlocked!'
		}
	},
	{
		img: '/assets/badges/active_voter.svg',
		lockImg: '/assets/badges/active_voter_locked.svg',
		name: BadgeName.ACTIVE_VOTER,
		requirements: {
			locked: 'To unlock, vote on at least 15% of proposals, with a minimum participation in 5 proposals.',
			unlocked: 'You have actively voted on at least 15% of key proposals and unlocked the Active Voter badge.'
		}
	},
	{
		img: '/assets/badges/whale.svg',
		lockImg: '/assets/badges/whalelocked.svg',
		name: BadgeName.WHALE,
		requirements: {
			locked: 'You must accumulate voting power equal to or greater than 0.05% of the total network supply.',
			unlocked: 'You hold significant voting power, equal to or greater than 0.05% of the total supply, and have unlocked the Whale badge.'
		}
	}
];
