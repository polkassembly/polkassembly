// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import authServiceInstance from '~src/auth/auth';
import { MessageType, IAuthResponse } from '~src/auth/types';
import getRefreshTokenSerializedCookie from '~src/api-utils/getRefreshTokenSerializedCookie';

async function handler(req: NextApiRequest, res: NextApiResponse<IAuthResponse | MessageType>) {
	storeApiKeyUsage(req);

	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const { address, signature, wallet, multisig = null } = req.body;

	if (!address || !signature || !wallet) return res.status(400).json({ message: 'Missing parameters in request body' });

	const { isTFAEnabled = false, tfa_token = '', token = '', user_id, refresh_token } = await authServiceInstance.AddressLogin(address, signature, wallet, multisig);

	if (!token && !isTFAEnabled) return res.status(401).json({ message: 'Something went wrong. Please try again.' });

	if (isTFAEnabled) return res.status(200).json({ isTFAEnabled, tfa_token, user_id });

	if (!refresh_token) return res.status(500).json({ message: 'Cannot generate refresh-token. Please try again.' });

	res.setHeader('Set-Cookie', getRefreshTokenSerializedCookie(refresh_token));

	return res.status(200).json({ isTFAEnabled, token });
}

export default withErrorHandling(handler);
