// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import { GET_BOUNTY_PROPOSER_BY_INDEX } from '~src/queries';
import { IBountyProposerResponse } from '~src/types';
import fetchSubsquid from '~src/util/fetchSubsquid';

const handler: NextApiHandler<IBountyProposerResponse | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);
	const { bountyId } = req.body;

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const subsquidRes = await fetchSubsquid({
		network,
		query: GET_BOUNTY_PROPOSER_BY_INDEX,
		variables: { index_eq: bountyId }
	});

	if (!subsquidRes?.data?.proposals?.length) return res.status(200).json({ message: 'No bounty data found' });

	const proposals = subsquidRes.data.proposals.map(({ proposer, reward }: { proposer: string; reward: string }) => ({ proposer, reward }));

	return res.status(200).json({
		proposals
	});
};

export default withErrorHandling(handler);
