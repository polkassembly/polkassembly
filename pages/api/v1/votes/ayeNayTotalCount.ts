// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import { isProposalTypeValid, isValidNetwork } from '~src/api-utils';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { GET_AYE_NAY_TOTAL_COUNT } from '~src/queries';

interface Props {
	proposalType: string;
	postId: number;
}

const handler: NextApiHandler<any | MessageType> = async (req, res) => {
	const { proposalType, postId } = req.body as unknown as Props;

	const network = String(req.headers['x-network']);
	if (network === 'undefined' || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });
	if (isNaN(Number(postId)) || isProposalTypeValid(proposalType)) return res.status(400).json({ message: messages.INVALID_PARAMS });
	const query = GET_AYE_NAY_TOTAL_COUNT;

	const variables: any = {
		proposalIndex_eq: postId,
		type_eq: proposalType
	};

	const data = await fetchSubsquid({
		network,
		query,
		variables
	});
	res.json(data['data']);
};

export default withErrorHandling(handler);
