// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isProposalTypeValid } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { MessageType } from '~src/auth/types';
import { ProposalType, getSubsquidProposalType } from '~src/global/proposalType';
import { network as AllNetworks } from '~src/global/networkConstants';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { getNetworkBasedSubsquidQuery, getResults } from '../utils/similar-proposals';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import messages from '~src/auth/utils/messages';

const handler: NextApiHandler<any | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	const { postId, proposalType, tags, trackNumber, trackGroup } = req.body;
	const network = String(req.headers['x-network']);

	if (!network || !Object.values(AllNetworks).includes(network)) {
		return res.status(400).json({ message: messages.INVALID_NETWORK });
	}
	const query = getNetworkBasedSubsquidQuery(network, proposalType);

	const strProposalType = String(proposalType);
	if (!isProposalTypeValid(strProposalType)) {
		return res.status(400).json({ message: `The proposal type of the name "${proposalType}" does not exist.` });
	}
	const postsVariables: any = {
		index_not_eq: postId,
		type_eq: getSubsquidProposalType(proposalType as any)
	};
	const subsquidRes = await fetchSubsquid({
		network,
		query,
		variables: postsVariables
	});
	let results: any = [];
	const seenProposalIds = new Set<number>();
	const subsquidData = subsquidRes?.data?.proposals;
	if (!subsquidData) {
		return res.status(400).json({ message: 'error' || messages.NO_ACTIVE_PROPOSAL_FOUND });
	}
	const onChainCollRef = postsByTypeRef(network, strProposalType as ProposalType);
	if (tags && tags?.length > 0) {
		results = await getResults(tags, subsquidData, onChainCollRef, results, seenProposalIds);
	}

	if (results.length < 3 && !isNaN(trackNumber)) {
		const filteredData = subsquidData.filter((proposal: any) => proposal.trackNumber === trackNumber);
		results = await getResults(null, filteredData, onChainCollRef, results, seenProposalIds);
	}

	if (results.length < 3 && trackGroup && Array.isArray(trackGroup) && trackGroup.length > 0) {
		const filteredData = subsquidData.filter((proposal: any) => trackGroup.includes(proposal.trackNumber));
		results = await getResults(null, filteredData, onChainCollRef, results, seenProposalIds);
	}

	if (results.length < 3) {
		results = await getResults(null, subsquidData, onChainCollRef, results, seenProposalIds);
	}

	return res.status(200).json(results || []);
};

export default withErrorHandling(handler);
