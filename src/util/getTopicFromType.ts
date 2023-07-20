// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { post_topic } from '~src/global/post_topics';
import { ProposalType } from '~src/global/proposalType';

export function getTopicFromType(proposalType: ProposalType) {
	const topic = { id: post_topic.DEMOCRACY, name: 'Democracy' };

	if (
		[
			ProposalType.DEMOCRACY_PROPOSALS,
			ProposalType.REFERENDUMS,
			ProposalType.OPEN_GOV
		].includes(proposalType)
	) {
		topic.id = post_topic.DEMOCRACY;
		topic.name = 'Democracy';
	} else if (
		[
			ProposalType.TREASURY_PROPOSALS,
			ProposalType.TIPS,
			ProposalType.BOUNTIES,
			ProposalType.CHILD_BOUNTIES
		].includes(proposalType)
	) {
		topic.id = post_topic.TREASURY;
		topic.name = 'Treasury';
	} else if ([ProposalType.COUNCIL_MOTIONS].includes(proposalType)) {
		topic.id = post_topic.COUNCIL;
		topic.name = 'Council';
	} else if ([ProposalType.TECH_COMMITTEE_PROPOSALS].includes(proposalType)) {
		topic.id = post_topic.TECHNICAL_COMMITTEE;
		topic.name = 'Tech Committee';
	} else if (proposalType === ProposalType.GRANTS) {
		topic.id = 6;
		topic.name = 'Grant';
	}
	return topic;
}

export const topicIdToNameMap = {
	1: 'Democracy',
	2: 'Council',
	3: 'Technical Committee',
	4: 'Treasury',
	5: 'General',
	6: 'Root',
	7: 'Staking Admin',
	8: 'Auction Admin',
	9: 'Governance',
	// eslint-disable-next-line sort-keys
	10: 'Fellowship'
};

export const isTopicIdValid = (topicId: any) => {
	const numTopicId = Number(topicId);
	return (
		!isNaN(numTopicId) &&
    Object.keys(topicIdToNameMap).includes(String(topicId))
	);
};

export function getTopicNameFromTopicId(
	topicId: keyof typeof topicIdToNameMap
): string {
	return topicIdToNameMap[topicId];
}
