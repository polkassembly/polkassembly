// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dayjs from 'dayjs';
import changeProfileScoreForAddress from 'pages/api/v1/utils/changeProfileScoreForAddress';
import { getFirestoreProposalType, ProposalType, TSubsquidProposalType } from '~src/global/proposalType';
import { EUserActivityType } from '~src/types';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import REPUTATION_SCORES from '~src/util/reputationScores';
import { getVoteCreatedAt } from './getVoteCreatedAt';
import { firestore_db } from '~src/services/firebaseInit';

export async function _processVoted({
	network,
	voterAddress,
	proposalIndex,
	proposalType
}: {
	network: string;
	voterAddress: string;
	proposalIndex: string;
	proposalType: TSubsquidProposalType;
}) {
	// process reputation scores for proposal 'Vote on Treasury Proposal'

	console.log('Processing voted', network, voterAddress, proposalIndex, proposalType);
	const createdAt = await getVoteCreatedAt(network, proposalIndex, proposalType, voterAddress);

	//create activity for user for proposal voted
	const activityPayload = {
		by: getSubstrateAddress(voterAddress),
		created_at: dayjs(createdAt).toDate() || new Date(),
		is_deleted: false,
		network,
		post_id: proposalIndex.startsWith('0x') ? proposalIndex : Number(proposalIndex),
		post_type: getFirestoreProposalType(proposalType) as ProposalType,
		type: EUserActivityType.VOTED,
		updated_at: new Date()
	};

	await firestore_db.collection('user_activities').add(activityPayload);

	const score = REPUTATION_SCORES.vote_treasury_proposal.value;

	await changeProfileScoreForAddress(voterAddress, score);
}
