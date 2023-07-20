// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { networkTrackInfo } from '~src/global/post_trackInfo';
import { PostOrigin } from '~src/types';
import Root from '~assets/icons/root-open-gov.svg';
import Tips from '~assets/icons/tips.svg';
import Tipper from '~assets/icons/small-tipper.svg';
import Stacking from '~assets/icons/stacking-admin.svg';
import Auction from '~assets/icons/action-admin.svg';
import Referendum from '~assets/icons/referendum-canceller.svg';
import Fellowship from '~assets/icons/fellowship-admin.svg';

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

export const fellowShipOptions = [
	{
		label: 'New Referendum submitted',
		triggerName: 'fellowShipReferendumSubmitted',
		triggerPreferencesName: 'fellowShipReferendumSubmitted',
		value: 'New Referendum submitted'
	},
	{
		label: 'Referendum in voting',
		triggerName: 'fellowShipReferendumInVoting',
		triggerPreferencesName: 'fellowShipReferendumInVoting',
		value: 'Referendum in voting'
	},
	{
		label: 'Referendum closed',
		triggerName: 'fellowShipReferendumClosed',
		triggerPreferencesName: 'fellowShipReferendumClosed',
		value: 'Referendum closed'
	}
];

export const getOpenGov = (network: string) => {
	const availableOption = Object.keys(networkTrackInfo[network] || {});
	const obj: any = {};
	availableOption.forEach((opt) => {
		obj[opt] = options;
	});
	return obj;
};

export const titleMapper = (title: string) => {
	switch (title) {
	case 'Auction Admin': {
		return PostOrigin.AUCTION_ADMIN;
	}
	case 'Big Spender': {
		return PostOrigin.BIG_SPENDER;
	}
	case 'Big Tipper': {
		return PostOrigin.BIG_TIPPER;
	}
	case 'Candidates': {
		return PostOrigin.CANDIDATES;
	}
	case 'Experts': {
		return PostOrigin.EXPERTS;
	}
	case 'Fellows': {
		return PostOrigin.FELLOWS;
	}
	case 'Fellowship Admin': {
		return PostOrigin.FELLOWSHIP_ADMIN;
	}
	case 'General Admin': {
		return PostOrigin.GENERAL_ADMIN;
	}
	case 'Grand Masters': {
		return PostOrigin.GRAND_MASTERS;
	}
	case 'Lease Admin': {
		return PostOrigin.LEASE_ADMIN;
	}
	case 'Masters': {
		return PostOrigin.MASTERS;
	}
	case 'Medium Spender': {
		return PostOrigin.MEDIUM_SPENDER;
	}
	case 'Member Referenda': {
		return PostOrigin.MEMBERS;
	}
	case 'Proficients': {
		return PostOrigin.PROFICIENTS;
	}
	case 'Referendum Canceller': {
		return PostOrigin.REFERENDUM_CANCELLER;
	}
	case 'Referendum Killer': {
		return PostOrigin.REFERENDUM_KILLER;
	}
	case 'Root': {
		return PostOrigin.ROOT;
	}
	case 'Senior Experts': {
		return PostOrigin.SENIOR_EXPERTS;
	}
	case 'Senior Fellows': {
		return PostOrigin.SENIOR_FELLOWS;
	}
	case 'Senior Masters': {
		return PostOrigin.SENIOR_MASTERS;
	}
	case 'Small Spender': {
		return PostOrigin.SMALL_SPENDER;
	}
	case 'Small Tipper': {
		return PostOrigin.SMALL_TIPPER;
	}
	case 'Staking Admin': {
		return PostOrigin.STAKING_ADMIN;
	}
	case 'Treasure': {
		return PostOrigin.TREASURER;
	}
	case 'Whitelisted Caller': {
		return PostOrigin.WHITELISTED_CALLER;
	}
	default: {
		return title;
	}
	}
};

export const postOriginMapper = (origin: string) => {
	switch (origin) {
	case PostOrigin.AUCTION_ADMIN: {
		return 'Auction Admin';
	}
	case PostOrigin.BIG_SPENDER: {
		return 'Big Spender';
	}
	case PostOrigin.BIG_TIPPER: {
		return 'Big Tipper';
	}
	case PostOrigin.CANDIDATES: {
		return 'Candidates';
	}
	case PostOrigin.EXPERTS: {
		return 'Experts';
	}
	case PostOrigin.FELLOWS: {
		return 'Fellows';
	}
	case PostOrigin.FELLOWSHIP_ADMIN: {
		return 'Fellowship Admin';
	}
	case PostOrigin.GENERAL_ADMIN: {
		return 'General Admin';
	}
	case PostOrigin.GRAND_MASTERS: {
		return 'Grand Masters';
	}
	case PostOrigin.LEASE_ADMIN: {
		return 'Lease Admin';
	}
	case PostOrigin.MASTERS: {
		return 'Masters';
	}
	case PostOrigin.MEDIUM_SPENDER: {
		return 'Medium Spender';
	}
	case PostOrigin.MEMBERS: {
		return 'Member Referenda';
	}
	case PostOrigin.PROFICIENTS: {
		return 'Proficients';
	}
	case PostOrigin.REFERENDUM_CANCELLER: {
		return 'Referendum Canceller';
	}
	case PostOrigin.REFERENDUM_KILLER: {
		return 'Referendum Killer';
	}
	case PostOrigin.ROOT: {
		return 'Root';
	}
	case PostOrigin.SENIOR_EXPERTS: {
		return 'Senior Experts';
	}
	case PostOrigin.SENIOR_FELLOWS: {
		return 'Senior Fellows';
	}
	case PostOrigin.SENIOR_MASTERS: {
		return 'Senior Masters';
	}
	case PostOrigin.SMALL_SPENDER: {
		return 'Small Spender';
	}
	case PostOrigin.SMALL_TIPPER: {
		return 'Small Tipper';
	}
	case PostOrigin.STAKING_ADMIN: {
		return 'Staking Admin';
	}
	case PostOrigin.TREASURER: {
		return 'Treasure';
	}
	case PostOrigin.WHITELISTED_CALLER: {
		return 'Whitelisted Caller';
	}
	default: {
		return origin;
	}
	}
};

export const iconMapper = (origin: string) => {
	switch (origin) {
	case PostOrigin.AUCTION_ADMIN: {
		return Auction;
	}
	case PostOrigin.BIG_SPENDER: {
		return Tipper;
	}
	case PostOrigin.BIG_TIPPER: {
		return Tipper;
	}
	case PostOrigin.CANDIDATES: {
		return Fellowship;
	}
	case PostOrigin.EXPERTS: {
		return Fellowship;
	}
	case PostOrigin.FELLOWS: {
		return Fellowship;
	}
	case PostOrigin.FELLOWSHIP_ADMIN: {
		return Fellowship;
	}
	case PostOrigin.GENERAL_ADMIN: {
		return Referendum;
	}
	case PostOrigin.GRAND_MASTERS: {
		return Fellowship;
	}
	case PostOrigin.LEASE_ADMIN: {
		return Referendum;
	}
	case PostOrigin.MASTERS: {
		return Fellowship;
	}
	case PostOrigin.MEDIUM_SPENDER: {
		return Tipper;
	}
	case PostOrigin.MEMBERS: {
		return Fellowship;
	}
	case PostOrigin.PROFICIENTS: {
		return Referendum;
	}
	case PostOrigin.REFERENDUM_CANCELLER: {
		return Referendum;
	}
	case PostOrigin.REFERENDUM_KILLER: {
		return Referendum;
	}
	case PostOrigin.ROOT: {
		return Root;
	}
	case PostOrigin.SENIOR_EXPERTS: {
		return Referendum;
	}
	case PostOrigin.SENIOR_FELLOWS: {
		return Fellowship;
	}
	case PostOrigin.SENIOR_MASTERS: {
		return Referendum;
	}
	case PostOrigin.SMALL_SPENDER: {
		return Tipper;
	}
	case PostOrigin.SMALL_TIPPER: {
		return Tipper;
	}
	case PostOrigin.STAKING_ADMIN: {
		return Stacking;
	}
	case PostOrigin.TREASURER: {
		return Tips;
	}
	case PostOrigin.WHITELISTED_CALLER: {
		return Fellowship;
	}
	}
};
