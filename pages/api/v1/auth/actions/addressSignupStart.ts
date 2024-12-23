// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import authServiceInstance from '~src/auth/auth';
import { ChallengeMessage, MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';

async function handler(req: NextApiRequest, res: NextApiResponse<ChallengeMessage | MessageType>) {
	storeApiKeyUsage(req);

	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const { address, multisig } = req.body;
	if (!address) return res.status(400).json({ message: 'Missing parameters in request body' });

	const signMessage = await authServiceInstance.AddressSignupStart(address, multisig);

	return res.status(200).json({ message: messages.ADDRESS_SIGNUP_STARTED, signMessage });
}

export default withErrorHandling(handler);
