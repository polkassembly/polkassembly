// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import authServiceInstance from '~src/auth/auth';
import { MessageType, TokenType } from '~src/auth/types';

async function handler(
	req: NextApiRequest,
	res: NextApiResponse<TokenType | MessageType>
) {
	if (req.method !== 'POST')
		return res
			.status(405)
			.json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if (!network)
		return res
			.status(400)
			.json({ message: 'Missing network name in request headers' });

	const { address, signature, wallet } = req.body;

	if (!address || !signature || !wallet)
		return res
			.status(400)
			.json({ message: 'Missing parameters in request body' });

	const { token } = await authServiceInstance.AddressSignupConfirm(
		network,
		address,
		signature,
		wallet
	);

	return res.status(200).json({ token });
}

export default withErrorHandling(handler);
