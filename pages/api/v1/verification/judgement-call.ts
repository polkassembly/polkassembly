// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';

export interface IJudgementProps {
	identityHash: string;
	userAddress: string;
}
const handler: NextApiHandler<{ hash: string } | MessageType> = async (req, res) => {
	const network = String(req.headers['x-network']);
	const { identityHash, userAddress } = req.body as IJudgementProps;

	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

	if (!identityHash || !userAddress) return res.status(400).json({ message: 'Invalid identityHash or userAddress' });

	const response = await fetch('https://us-central1-individual-node-watcher.cloudfunctions.net/judgementCall', {
		body: JSON.stringify({ identityHash, userAddress }),
		headers: {
			Authorization: `${process.env.IDENTITY_JUDGEMENT_AUTH}`,
			'Content-Type': 'application/json'
		},
		method: 'POST'
	});

	if (response.status === 200) {
		return res.status(200).json(response as any);
	} else {
		return res.status(500).json({ message: response?.statusText });
	}
};
export default withErrorHandling(handler);
