// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { TSubsquidProposalType } from '~src/global/proposalType';
import { GET_PROPOSAL_CREATED_AT } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';

export async function getProposalCreatedAt(network: string, proposalIndex: string, proposalType: TSubsquidProposalType) {
	const subsquidRes = await fetchSubsquid({
		network,
		query: GET_PROPOSAL_CREATED_AT,
		variables: {
			index_eq: proposalIndex,
			type_eq: proposalType
		}
	});

	return (subsquidRes?.data?.proposals?.[0]?.createdAt as string) || null;
}
