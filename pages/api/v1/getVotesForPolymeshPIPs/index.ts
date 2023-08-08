// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isProposalTypeValid, isValidNetwork } from '~src/api-utils';
import { GET_VOTES_FOR_POLYMESH } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { isDataExist } from '../posts/on-chain-post';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import { ProposalType } from '~src/global/proposalType';

const checkProposalType = (proposalType: ProposalType) => {
	const isValidProposalType = ([ProposalType.TECHNICAL_PIPS, ProposalType.UPGRADE_PIPS, ProposalType.COMMUNITY_PIPS].includes(proposalType));
	return isValidProposalType;
};

const handler: NextApiHandler<{ data: any } | { error: string | null }> = async (req, res) => {
	const { proposalType, postId  } = req.body;

	const network = String(req.headers['x-network']);

	if (!network || !isValidNetwork(network)) {
		return res.status(400).json({ data: null, error: 'Invalid network in request header' });
	}
	const numPostId = Number(postId);
	if (isNaN(numPostId) || numPostId < 0) {
		throw apiErrorWithStatusCode(`The postId "${postId}" is invalid.`, 400);
	}

	const strProposalType = String(proposalType) as ProposalType;
	if (!isProposalTypeValid(strProposalType) && checkProposalType(proposalType)) {
		throw apiErrorWithStatusCode(`The proposal type "${proposalType}" is invalid.`, 400);
	}
	const variables = {
		index_eq: postId,
		type_eq: proposalType
	};

	const subsquidRes = await fetchSubsquid({
		network,
		query: GET_VOTES_FOR_POLYMESH,
		variables
	});

	const subsquidData = subsquidRes?.data;
	if (!isDataExist(subsquidData)) {
		throw apiErrorWithStatusCode(`The Post with index "${postId}" is not found.`, 404);
	}

	res.status(200).json(subsquidData);
};
export default  withErrorHandling(handler);