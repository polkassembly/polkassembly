// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { dayjs } from 'dayjs-init';
import changeProfileScoreForAddress from 'pages/api/v1/utils/changeProfileScoreForAddress';
import { getFirestoreProposalType, ProposalType, TSubsquidProposalType } from '~src/global/proposalType';
import { firestore_db } from '~src/services/firebaseInit';
import { EUserActivityType } from '~src/types';
import REPUTATION_SCORES from '~src/util/reputationScores';
import { getProposalCreatedAt } from './getProposalCreatedAt';

export async function _processProposalCreated({
	network,
	proposalIndex,
	proposalType,
	proposerAddress
}: {
	network: string;
	proposalIndex: string;
	proposalType: TSubsquidProposalType;
	proposerAddress: string;
}) {
	// process reputation scores for proposal 'Create Proposal / Referendum', 'Create Tip', 'Create Bounty', 'Create Child Bounty'
	let score = 0;

	const createdAt = await getProposalCreatedAt(network, proposalIndex, proposalType);

	//create activity for user for proposal created
	const activityPayload = {
		by: proposerAddress,
		created_at: dayjs(createdAt).toDate() || new Date(),
		is_deleted: false,
		network,
		post_id: proposalIndex.startsWith('0x') ? proposalIndex : Number(proposalIndex),
		post_type: getFirestoreProposalType(proposalType) as ProposalType,
		type: EUserActivityType.CREATE_REFERENDUM,
		updated_at: new Date()
	};

	switch (proposalType) {
		case 'Bounty':
			score = REPUTATION_SCORES.create_bounty.value;
			activityPayload.type = EUserActivityType.CREATE_BOUNTY;
			break;
		case 'ChildBounty':
			score = REPUTATION_SCORES.create_child_bounty.value;
			activityPayload.type = EUserActivityType.CREATE_CHILD_BOUNTY;
			break;
		case 'Tip':
			score = REPUTATION_SCORES.create_tip.value;
			activityPayload.type = EUserActivityType.CREATE_TIP;
			break;
		default:
			score = REPUTATION_SCORES.create_referendum.value;
			activityPayload.type = EUserActivityType.CREATE_REFERENDUM;
			break;
	}

	//save activity to firestore
	await firestore_db.collection('user_activities').add(activityPayload);

	await changeProfileScoreForAddress(proposerAddress, score);
}
