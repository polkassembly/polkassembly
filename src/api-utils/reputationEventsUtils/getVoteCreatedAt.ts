// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { TSubsquidProposalType } from '~src/global/proposalType';
import { GET_CONVICTION_VOTE_CREATED_AT, GET_VOTE_CREATED_AT } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';

export async function getVoteCreatedAt(network: string, proposalIndex: string, proposalType: TSubsquidProposalType, voterAddress: string) {
	console.log('Fetching vote created at', network, proposalIndex, proposalType, voterAddress);
	const subsquidRes = await fetchSubsquid({
		network,
		query: proposalType === 'ReferendumV2' ? GET_CONVICTION_VOTE_CREATED_AT : GET_VOTE_CREATED_AT,
		variables: {
			index_eq: proposalIndex,
			type_eq: proposalType,
			voter_address_eq: voterAddress
		}
	});

	console.log('subsquidRes', subsquidRes);

	return (subsquidRes?.data?.votes?.[0]?.createdAt as string) || null;
}
