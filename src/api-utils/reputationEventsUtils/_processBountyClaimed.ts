// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import changeProfileScoreForAddress from 'pages/api/v1/utils/changeProfileScoreForAddress';
import { getFirestoreProposalType, ProposalType, TSubsquidProposalType } from '~src/global/proposalType';
import { firestore_db } from '~src/services/firebaseInit';
import { EUserActivityType } from '~src/types';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import REPUTATION_SCORES from '~src/util/reputationScores';

export async function _processBountyClaimed({
	network,
	payeeAddress,
	proposalIndex,
	proposalType
}: {
	network: string;
	payeeAddress: string;
	proposalIndex: string;
	proposalType: TSubsquidProposalType;
}) {
	// process reputation scores for proposal 'Claim Bounty'
	console.log('Processing bounty claimed', network, payeeAddress, proposalIndex, proposalType);

	const activityPayload = {
		by: getSubstrateAddress(payeeAddress),
		created_at: new Date(), //TODO: get created at from bounty proposal
		is_deleted: false,
		network,
		post_id: proposalIndex.startsWith('0x') ? proposalIndex : Number(proposalIndex),
		post_type: getFirestoreProposalType(proposalType) as ProposalType,
		type: EUserActivityType.CLAIM_BOUNTY,
		updated_at: new Date()
	};

	await firestore_db.collection('user_activities').add(activityPayload);

	const score = REPUTATION_SCORES.claim_bounty.value;

	await changeProfileScoreForAddress(payeeAddress, score);
}
