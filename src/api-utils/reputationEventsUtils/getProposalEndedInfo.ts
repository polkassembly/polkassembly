// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { TSubsquidProposalType } from '~src/global/proposalType';
import { GET_PROPOSAL_ENDED_INFO } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';

export async function getProposalEndedInfo(network: string, proposalIndex: string, proposalType: TSubsquidProposalType) {
	const subsquidRes = await fetchSubsquid({
		network,
		query: GET_PROPOSAL_ENDED_INFO,
		variables: {
			index_eq: proposalIndex,
			type_eq: proposalType
		}
	});

	return {
		endedAt: (subsquidRes?.data?.proposals?.[0]?.endedAt as string) || null,
		status: (subsquidRes?.data?.proposals?.[0]?.status as string) || null
	};
}
