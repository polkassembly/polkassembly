// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ProposalType } from '~src/global/proposalType';
import Tipper from '~assets/icons/small-tipper.svg';
import Referendum from '~assets/icons/referendum-canceller.svg';
import Fellowship from '~assets/icons/fellowship-admin.svg';

// of the Apache-2.0 license. See the LICENSE file for details.
const technicalPips = [
	{
		label: 'New Technical Pips submitted',
		triggerName: 'pipSubmitted',
		triggerPreferencesName: 'pipSubmitted',
		value: 'New Technical Pips submitted'
	},
	{
		label: 'Technical Pips opened',
		triggerName: 'pipInVoting',
		triggerPreferencesName: 'pipInVoting',
		value: 'Technical Pips opened'
	},
	{
		label: 'Technical Pips closed / retracted',
		triggerName: 'pipClosed',
		triggerPreferencesName: 'pipClosed',
		value: 'Technical Pips closed / retracted'
	}
];

const upgradePips = [
	{
		label: 'New Upgrade Pips submitted',
		triggerName: 'pipSubmitted',
		triggerPreferencesName: 'pipSubmitted',
		value: 'New Upgrade Pips submitted'
	},
	{
		label: 'Upgrade Pips opened',
		triggerName: 'pipInVoting',
		triggerPreferencesName: 'pipInVoting',
		value: 'Upgrade Pips opened'
	},
	{
		label: 'Upgrade Pips closed',
		triggerName: 'pipClosed',
		triggerPreferencesName: 'pipClosed',
		value: 'Upgrade Pips closed'
	}
];

const communityPips = [
	{
		label: 'Community Pips submitted',
		triggerName: 'pipSubmitted',
		triggerPreferencesName: 'pipSubmitted',
		value: 'Community Pips submitted'
	},
	{
		label: 'Community Pips opened',
		triggerName: 'pipInVoting',
		triggerPreferencesName: 'pipInVoting',
		value: 'Community Pips opened'
	},
	{
		label: 'Community Pips closed',
		triggerName: 'pipClosed',
		triggerPreferencesName: 'pipClosed',
		value: 'Community Pips closed'
	}
];

const pipNotification = {
	[ProposalType.TECHNICAL_PIPS]: technicalPips,
	[ProposalType.UPGRADE_PIPS]: upgradePips,
	[ProposalType.COMMUNITY_PIPS]: communityPips
};

const titleMapper = (title: string) => {
	switch (title) {
		case 'Technical Pips': {
			return ProposalType.TECHNICAL_PIPS;
		}
		case 'Upgrade Pips': {
			return ProposalType.UPGRADE_PIPS;
		}
		case 'Community Pips': {
			return ProposalType.COMMUNITY_PIPS;
		}
	}
};

const postOriginMapper = (origin: string) => {
	switch (origin) {
		case ProposalType.TECHNICAL_PIPS: {
			return 'Technical Pips';
		}
		case ProposalType.UPGRADE_PIPS: {
			return 'Upgrade Pips';
		}
		case ProposalType.COMMUNITY_PIPS: {
			return 'Community Pips';
		}
	}
};
export const iconMapper = (origin: string) => {
	switch (origin) {
		case ProposalType.TECHNICAL_PIPS: {
			return Tipper;
		}
		case ProposalType.UPGRADE_PIPS: {
			return Fellowship;
		}
		case ProposalType.COMMUNITY_PIPS: {
			return Referendum;
		}
	}
};
export { pipNotification, titleMapper, technicalPips, upgradePips, communityPips, postOriginMapper };
