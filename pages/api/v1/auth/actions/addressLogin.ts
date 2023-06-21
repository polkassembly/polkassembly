// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import authServiceInstance from '~src/auth/auth';
import { MessageType, IAuthResponse } from '~src/auth/types';

async function handler(req: NextApiRequest, res: NextApiResponse<IAuthResponse | MessageType>) {
	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const { address, signature, wallet, multisig } = req.body;

	if(!address || !signature || !wallet) return res.status(400).json({ message: 'Missing parameters in request body' });

	if(!address || !signature || !wallet) return res.status(400).json({ message: 'Missing parameters in request body' });

	const { isTFAEnabled = false, tfa_token = '', token = '', user_id } = await authServiceInstance.AddressLogin(address, signature, wallet, multisig);
	if(!token && !isTFAEnabled) return res.status(401).json({ message: 'Something went wrong. Please try again.' });

	if(isTFAEnabled) return res.status(200).json({ isTFAEnabled, tfa_token, user_id });

	return res.status(200).json({ isTFAEnabled, token });
}

export default withErrorHandling(handler);
