// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { dayjs } from 'dayjs-init';
import changeProfileScoreForAddress from 'pages/api/v1/utils/changeProfileScoreForAddress';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { getFirestoreProposalType, ProposalType, TSubsquidProposalType } from '~src/global/proposalType';
import { GET_FIRST_AND_CURRENT_CONVICTION_VOTE_TIMESTAMP_BY_PROPOSAL_ID_AND_TYPE, GET_FIRST_AND_CURRENT_VOTE_TIMESTAMP_BY_PROPOSAL_ID_AND_TYPE } from '~src/queries';
import { firestore_db } from '~src/services/firebaseInit';
import { EUserActivityType } from '~src/types';
import fetchSubsquid from '~src/util/fetchSubsquid';
import REPUTATION_SCORES from '~src/util/reputationScores';

export async function _processRemovedVote({
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
	// process reputation scores for proposal 'Removing casted vote or reducing conviction (6+ hours after first vote)'

	// find timestamp of first vote on proposal and current vote timestamp
	const voteTimestampsSubsquidRes = await fetchSubsquid({
		network,
		query: isOpenGovSupported(network) ? GET_FIRST_AND_CURRENT_CONVICTION_VOTE_TIMESTAMP_BY_PROPOSAL_ID_AND_TYPE : GET_FIRST_AND_CURRENT_VOTE_TIMESTAMP_BY_PROPOSAL_ID_AND_TYPE,
		variables: {
			index_eq: Number(proposalIndex),
			type_eq: proposalType,
			voter_eq: voterAddress
		}
	});

	const firstVoteTimestamp = voteTimestampsSubsquidRes?.data?.firstVoteTimestamp?.createdAt;
	const currentVoteTimestamp = voteTimestampsSubsquidRes?.data?.currentVoteTimestamp?.createdAt;

	if (!firstVoteTimestamp || !currentVoteTimestamp) {
		throw new Error('Failed to fetch vote timestamps');
	}

	//time difference in hours using dayjs
	const timeDiff = dayjs(currentVoteTimestamp).diff(dayjs(firstVoteTimestamp), 'hour');

	// TODO: handle for reduce conviction

	if (timeDiff < 6) {
		return;
	}

	// create activity for removed vote, TODO: add Activity interface in revamp
	const activityPayload = {
		by: voterAddress,
		created_at: dayjs(currentVoteTimestamp).toDate(),
		is_deleted: false,
		network,
		post_id: proposalIndex.startsWith('0x') ? proposalIndex : Number(proposalIndex),
		post_type: getFirestoreProposalType(proposalType) as ProposalType,
		type: EUserActivityType.REMOVED_VOTE,
		updated_at: dayjs(currentVoteTimestamp).toDate()
	};

	//save activity to firestore
	await firestore_db.collection('user_activities').add(activityPayload);

	//check how many times the user has removed their vote before
	const removedVoteCount =
		(await firestore_db.collection('user_activities').where('type', '==', EUserActivityType.REMOVED_VOTE).where('by', '==', voterAddress).count().get()).data().count || 0;

	await changeProfileScoreForAddress(
		voterAddress,
		REPUTATION_SCORES.removed_vote_or_reduced_conviction_after_six_hours[removedVoteCount > 10 ? 'more_than_ten' : removedVoteCount > 3 ? 'fourth_to_tenth' : 'first_three']
	);
}
