// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { GET_CONVICTION_VOTERS_BY_PROPOSAL_ID_AND_TYPE, GET_VOTERS_BY_PROPOSAL_ID_AND_TYPE } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';
import getSubstrateAddress from '~src/util/getSubstrateAddress';

export async function getAllVotersByProposalIdAndType({
	network,
	proposalIndex,
	proposalType
}: {
	network: string;
	proposalIndex: string;
	proposalType: string;
}): Promise<string[]> {
	// fetch all voters until votes array is returned empty from db
	const voters: string[] = [];

	let offset = 0;
	let fetchedVotesLength = 0;

	do {
		const subsquidRes = await fetchSubsquid({
			network,
			query: isOpenGovSupported(network) ? GET_CONVICTION_VOTERS_BY_PROPOSAL_ID_AND_TYPE : GET_VOTERS_BY_PROPOSAL_ID_AND_TYPE,
			variables: {
				index_eq: Number(proposalIndex),
				offset,
				type_eq: proposalType
			}
		});

		if (!subsquidRes || !subsquidRes.data) {
			throw new Error('Failed to fetch votes');
		}

		const fetchedVotes = subsquidRes.data[isOpenGovSupported(network) ? 'votes' : 'convictionVotes'] || [];
		fetchedVotesLength = fetchedVotes.length;
		offset += fetchedVotesLength;

		fetchedVotes.forEach(({ voter }: { voter: string }) => {
			const voterSubstrateAddress = getSubstrateAddress(voter);

			if (voterSubstrateAddress) {
				voters.push(voterSubstrateAddress);
			}
		});
	} while (fetchedVotesLength);

	return voters;
}
