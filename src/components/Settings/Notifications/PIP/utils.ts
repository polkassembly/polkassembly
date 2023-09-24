// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ProposalType } from '~src/global/proposalType';

// of the Apache-2.0 license. See the LICENSE file for details.
const technicalPips = [
	{
		label: 'New Technical Pips submitted',
		triggerName: 'technicalPipsSubmitted',
		triggerPreferencesName: 'technicalPipsSubmitted',
		value: 'New Technical Pips submitted'
	},
	{
		label: 'Technical Pips opened',
		triggerName: 'technicalPipsInVoting',
		triggerPreferencesName: 'technicalPipsInVoting',
		value: 'Technical Pips opened'
	},
	{
		label: 'Technical Pips closed / retracted',
		triggerName: 'technicalPipsClosed',
		triggerPreferencesName: 'technicalPipsClosed',
		value: 'Technical Pips closed / retracted'
	}
];

const upgradePips = [
	{
		label: 'New Upgrade Pips submitted',
		triggerName: 'upgradePipsSubmitted',
		triggerPreferencesName: 'upgradePipsSubmitted',
		value: 'New Upgrade Pips submitted'
	},
	{
		label: 'Upgrade Pips opened',
		triggerName: 'upgradePipsInVoting',
		triggerPreferencesName: 'upgradePipsInVoting',
		value: 'Upgrade Pips opened'
	},
	{
		label: 'Upgrade Pips closed',
		triggerName: 'upgradePipsClosed',
		triggerPreferencesName: 'upgradePipsClosed',
		value: 'Upgrade Pips closed'
	}
];

const communityPips = [
	{
		label: 'Community Pips submitted',
		triggerName: 'communityPipsSubmitted',
		triggerPreferencesName: 'communityPipsSubmitted',
		value: 'Community Pips submitted'
	},
	{
		label: 'Community Pips opened',
		triggerName: 'communityPipsInVoting',
		triggerPreferencesName: 'communityPipsInVoting',
		value: 'Community Pips opened'
	},
	{
		label: 'Community Pips closed',
		triggerName: 'communityPipsClosed',
		triggerPreferencesName: 'communityPipsClosed',
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

export { pipNotification, titleMapper, technicalPips, upgradePips, communityPips };
