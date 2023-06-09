// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { PostOrigin } from '~src/types';

// of the Apache-2.0 license. See the LICENSE file for details.
const options = [
	{
		label: 'New Referendum submitted',
		triggerName: 'openGovReferendumSubmitted',
		triggerPreferencesName: 'openGovReferendumSubmitted',
		value: 'New Referendum submitted'
	},
	{
		label: 'Referendum in voting',
		triggerName: 'openGovReferendumInVoting',
		triggerPreferencesName: 'openGovReferendumInVoting',
		value: 'Referendum in voting'
	},
	{
		label: 'Referendum closed',
		triggerName: 'openGovReferendumClosed',
		triggerPreferencesName: 'openGovReferendumClosed',
		value: 'Referendum closed'
	}
];

export const openGov = {
	[PostOrigin.ROOT]: options,
	[PostOrigin.SMALL_TIPPER]: options,
	[PostOrigin.STAKING_ADMIN]: options,
	// eslint-disable-next-line sort-keys
	[PostOrigin.BIG_TIPPER]: options,
	// eslint-disable-next-line sort-keys
	[PostOrigin.AUCTION_ADMIN]: options,
	[PostOrigin.SMALL_SPENDER]: options,
	[PostOrigin.TREASURER]: options,
	// eslint-disable-next-line sort-keys
	[PostOrigin.MEDIUM_SPENDER]: options,
	[PostOrigin.REFERENDUM_CANCELLER]: options,
	// eslint-disable-next-line sort-keys
	[PostOrigin.BIG_SPENDER]: options,
	[PostOrigin.REFERENDUM_KILLER]: options,
	// eslint-disable-next-line sort-keys
	[PostOrigin.FELLOWSHIP_ADMIN]: options,
	[PostOrigin.LEASE_ADMIN]: options,
	// eslint-disable-next-line sort-keys
	[PostOrigin.GENERAL_ADMIN]: options,
	[PostOrigin.MEMBERS]: options,
	[PostOrigin.WHITELISTED_CALLER]: options
};

export const titleMapper = (title:string) => {
	switch(title){
	case 'Root': {
		return PostOrigin.ROOT;
	}
	case 'Small Tipper': {
		return PostOrigin.SMALL_TIPPER;
	}
	case 'Staking Admin': {
		return PostOrigin.STAKING_ADMIN;
	}
	case 'Big Tipper': {
		return PostOrigin.BIG_TIPPER;
	}
	case 'Auction Admin': {
		return PostOrigin.AUCTION_ADMIN;
	}
	case 'Small Spender': {
		return PostOrigin.SMALL_SPENDER;
	}
	case 'Treasurer': {
		return PostOrigin.TREASURER;
	}
	case 'Medium Spender': {
		return PostOrigin.MEDIUM_SPENDER;
	}
	case 'Referendum Canceler': {
		return PostOrigin.REFERENDUM_CANCELLER;
	}
	case 'Big Spender': {
		return PostOrigin.BIG_SPENDER;
	}
	case 'Referendum Killer': {
		return PostOrigin.REFERENDUM_KILLER;
	}
	case 'Fellowship Admin': {
		return PostOrigin.FELLOWSHIP_ADMIN;
	}
	case 'Lease Admin': {
		return PostOrigin.LEASE_ADMIN;
	}
	case 'General Admin': {
		return PostOrigin.GENERAL_ADMIN;
	}
	case 'Member Referenda': {
		return PostOrigin.MEMBERS;
	}
	case 'Whitelisted Call': {
		return PostOrigin.WHITELISTED_CALLER;
	}
	default: {
		return title;
	}
	}
};