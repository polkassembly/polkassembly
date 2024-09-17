// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { dayjs } from 'dayjs-init';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { TSubsquidProposalType } from '~src/global/proposalType';
import { GET_FIRST_AND_CURRENT_CONVICTION_VOTE_TIMESTAMP_BY_PROPOSAL_ID_AND_TYPE, GET_FIRST_AND_CURRENT_VOTE_TIMESTAMP_BY_PROPOSAL_ID_AND_TYPE } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';

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
	
	// TODO: handle for conviction and repeat removes

	if (timeDiff > 6) {
		await changeProfileScoreForAddress(voterAddress, REPUTATION_SCORES.removed_vote[timeDiff === 6 ? 'first' : 'second_or_more']);
	}
}
