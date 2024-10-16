// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { getFirestoreProposalType, ProposalType, TSubsquidProposalType } from '~src/global/proposalType';
import { GET_PROPOSER_BY_ID_AND_TYPE } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { postsByTypeRef } from './firestore_refs';
import getSubstrateAddress from '~src/util/getSubstrateAddress';

export async function getProposerByIndexAndType(network: string, index: string, type: TSubsquidProposalType) {
	let proposer: string | null = null;

	// 1. fetch from subsquid
	const subsquidRes = await fetchSubsquid({
		network,
		query: GET_PROPOSER_BY_ID_AND_TYPE,
		variables: {
			index_eq: index,
			type_eq: type
		}
	});

	const subsquidPost = subsquidRes.data?.proposals?.[0];

	proposer = subsquidPost.proposer || subsquidPost.preimage.proposer || null;

	if (proposer) return getSubstrateAddress(proposer);

	//2. If not found yet, fetch from firebase
	const firestoreProposalType = getFirestoreProposalType(type);
	const postDoc = await postsByTypeRef(network, firestoreProposalType as ProposalType)
		.doc(index)
		.get();
	const firestorePost = postDoc.data();

	proposer = firestorePost?.proposer_address || null;

	if (proposer) return getSubstrateAddress(proposer);

	//TODO: 3. If not found yet, fetch from subsquare

	//TODO: 4. If not found yet, fetch from subscan

	return proposer;
}
