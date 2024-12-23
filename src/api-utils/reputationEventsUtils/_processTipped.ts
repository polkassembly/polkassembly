// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getFirestoreProposalType, ProposalType, TSubsquidProposalType } from '~src/global/proposalType';
import { GET_TIP_PAYEE_AND_ALL_TIPPER_COUNTS, GET_TIP_VALUE_AND_PAYEE_BY_PROPOSAL_ID_AND_TYPE } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';
import changeProfileScoreForAddress from 'pages/api/v1/utils/changeProfileScoreForAddress';
import REPUTATION_SCORES from '~src/util/reputationScores';
import { EUserActivityType } from '~src/types';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { firestore_db } from '~src/services/firebaseInit';
import { dayjs } from 'dayjs-init';

export async function _processTipped({
	network,
	tipperAddress,
	proposalIndex,
	proposalType
}: {
	network: string;
	tipperAddress: string;
	proposalIndex: string;
	proposalType: TSubsquidProposalType;
}) {
	// 2. process reputation scores for 'User tips a new unique user at Polkassembly with > 0.1 DOT'

	console.log('Processing tipped', network, tipperAddress, proposalIndex, proposalType);

	// get payee address from proposal from subsquid
	const subsquidRes = await fetchSubsquid({
		network,
		query: GET_TIP_VALUE_AND_PAYEE_BY_PROPOSAL_ID_AND_TYPE,
		variables: {
			index_eq: Number(proposalIndex),
			type_eq: proposalType
		}
	});

	if (!subsquidRes?.data?.proposals?.length) {
		throw new Error('Failed to fetch tip payee');
	}

	const payee = subsquidRes.data.proposals[0].payee as string;
	const reward = subsquidRes.data.proposals[0].reward as string;
	const createdAt = subsquidRes.data.proposals[0].createdAt as string;

	if (!payee || !reward) {
		throw new Error('Failed to fetch tip payee or reward');
	}

	// find out if the tipper has given any tip to the payee before
	const tipperCountsSubsquidRes = await fetchSubsquid({
		network,
		query: GET_TIP_PAYEE_AND_ALL_TIPPER_COUNTS,
		variables: {
			payee_eq: payee,
			tipper_eq: tipperAddress
		}
	});

	// not unique user, does not qualify
	if (tipperCountsSubsquidRes?.data?.tippersConnection?.totalCount) {
		return;
	}

	const activityPayload = {
		by: getSubstrateAddress(tipperAddress),
		created_at: dayjs(createdAt).toDate() || new Date(),
		is_deleted: false,
		network,
		post_id: proposalIndex.startsWith('0x') ? proposalIndex : Number(proposalIndex),
		post_type: getFirestoreProposalType(proposalType) as ProposalType,
		type: EUserActivityType.GIVE_TIP,
		updated_at: new Date()
	};

	await firestore_db.collection('user_activities').add(activityPayload);

	const timesTipperHasTipped = (tipperCountsSubsquidRes?.data?.allTipsConnection?.totalCount as number) || 0;

	await changeProfileScoreForAddress(tipperAddress, REPUTATION_SCORES.tip_new_user[timesTipperHasTipped === 0 ? 'first' : timesTipperHasTipped === 1 ? 'second' : 'third_or_more']);
}
