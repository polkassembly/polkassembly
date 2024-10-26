// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { dayjs } from 'dayjs-init';
import changeProfileScoreForAddress from 'pages/api/v1/utils/changeProfileScoreForAddress';
import { getFirestoreProposalType, ProposalType, TSubsquidProposalType } from '~src/global/proposalType';
import { GET_FOREIGN_DECISION_DEPOSIT_PLACED_COUNT, GET_PROPOSER_BY_ID_AND_TYPE } from '~src/queries';
import { firestore_db } from '~src/services/firebaseInit';
import { EUserActivityType } from '~src/types';
import fetchSubsquid from '~src/util/fetchSubsquid';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import REPUTATION_SCORES from '~src/util/reputationScores';

export async function _processDecisionDepositPlaced({
	network,
	proposalIndex,
	proposalType,
	depositorAddress
}: {
	network: string;
	proposalIndex: string;
	proposalType: TSubsquidProposalType;
	depositorAddress: string;
}) {
	// process reputation scores for proposal 'User can place decision deposit on behalf of another proposal'

	// find proposer address from subsquid
	const subsquidRes = await fetchSubsquid({
		network,
		query: GET_PROPOSER_BY_ID_AND_TYPE,
		variables: {
			index_eq: Number(proposalIndex),
			type_eq: proposalType
		}
	});

	if (!subsquidRes?.data?.proposals?.length) {
		throw new Error('Failed to fetch proposal proposer');
	}

	const proposer = subsquidRes.data.proposals[0].proposer as string;

	if (!proposer) {
		throw new Error('Failed to fetch proposal proposer');
	}

	// if proposer and depositor are same, return
	if (getSubstrateAddress(proposer) === getSubstrateAddress(depositorAddress)) {
		return;
	}

	// find out if the depositor has placed any decision deposit before
	const foreignDecisionDepositPlacedCountSubsquidRes = await fetchSubsquid({
		network,
		query: GET_FOREIGN_DECISION_DEPOSIT_PLACED_COUNT,
		variables: {
			address: depositorAddress
		}
	});

	const foreignDecisionDepositPlacedCount = (foreignDecisionDepositPlacedCountSubsquidRes?.data?.proposalsConnection?.totalCount as number) || 0;
	const createdAt = foreignDecisionDepositPlacedCountSubsquidRes?.data?.proposalsConnection?.edges?.[0]?.node?.createdAt as string;

	const activityPayload = {
		by: getSubstrateAddress(depositorAddress),
		created_at: dayjs(createdAt).toDate() || new Date(),
		is_deleted: false,
		network,
		post_id: proposalIndex.startsWith('0x') ? proposalIndex : Number(proposalIndex),
		post_type: getFirestoreProposalType(proposalType) as ProposalType,
		type: EUserActivityType.DECISION_DEPOSIT_ON_FORIEGN_PROPOSAL,
		updated_at: new Date()
	};

	await firestore_db.collection('user_activities').add(activityPayload);

	await changeProfileScoreForAddress(
		depositorAddress,
		REPUTATION_SCORES.decision_deposit_on_foriegn_proposal[foreignDecisionDepositPlacedCount === 0 ? 'first' : foreignDecisionDepositPlacedCount === 1 ? 'second' : 'third_or_more']
	);
}
