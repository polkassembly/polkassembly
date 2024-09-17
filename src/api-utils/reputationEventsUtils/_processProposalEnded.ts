// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { TSubsquidProposalType } from '~src/global/proposalType';
import { getProposerByIndexAndType } from '../getProposerByIndexAndType';
import REPUTATION_SCORES from '~src/util/reputationScores';
import { getAllVotersByProposalIdAndType } from './getAllVotersByProposalIdAndType';
import changeProfileScoreForAddress from 'pages/api/v1/utils/changeProfileScoreForAddress';

export async function _processProposalEnded({ network, proposalIndex, proposalType }: { network: string; proposalIndex: string; proposalType: TSubsquidProposalType }) {
	//TODO: 1. Find if the proposal is approved or rejected
	const isFailedProposal = true;

	// 2. get author of proposal and add or subtract reputation score from author
	const proposerAddress = await getProposerByIndexAndType(network, proposalIndex, proposalType);

	if (proposerAddress) {
		// TODO: add for approved proposal
		// TODO: find if the user is failing the proposal first or second time subtract accordingly
		await changeProfileScoreForAddress(proposerAddress, REPUTATION_SCORES.failed_proposal.first);
	}

	// 3. get all votes for this proposal and add or subtract reputation score from voters
	const voters = await getAllVotersByProposalIdAndType({
		network,
		proposalIndex,
		proposalType
	});

	const votersPromises = voters.map(async (voter) => {
		await changeProfileScoreForAddress(voter, REPUTATION_SCORES[isFailedProposal ? 'vote_failed' : 'vote_passed'].value);
	});

	await Promise.all(votersPromises);
}
