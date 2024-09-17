// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import changeProfileScoreForAddress from 'pages/api/v1/utils/changeProfileScoreForAddress';
import { TSubsquidProposalType } from '~src/global/proposalType';
import REPUTATION_SCORES from '~src/util/reputationScores';

export async function _processProposalCreated({ proposalType, proposerAddress }: { proposalType: TSubsquidProposalType; proposerAddress: string }) {
	// process reputation scores for proposal 'Create Proposal / Referendum', 'Create Tip', 'Create Bounty', 'Create Child Bounty'
	let score = 0;

	switch (proposalType) {
		case 'Bounty':
			score = REPUTATION_SCORES.create_bounty.value;
			break;
		case 'ChildBounty':
			score = REPUTATION_SCORES.create_child_bounty.value;
			break;
		case 'Tip':
			score = REPUTATION_SCORES.create_tip.value;
			break;
		default:
			score = REPUTATION_SCORES.create_referendum.value;
			break;
	}

	await changeProfileScoreForAddress(proposerAddress, score);
}
