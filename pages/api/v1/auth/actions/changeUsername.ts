// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import authServiceInstance from '~src/auth/auth';
import { ChangeResponseType, MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import isValidUsername from '~src/auth/utils/isValidUsername';
import messages from '~src/auth/utils/messages';

async function handler(req: NextApiRequest, res: NextApiResponse<ChangeResponseType | MessageType>) {
	storeApiKeyUsage(req);

	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const { username } = req.body;

	if (!username) return res.status(400).json({ message: 'Missing parameters in request body' });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Invalid token' });

	if (!isValidUsername(username)) return res.status(400).json({ message: messages.USERNAME_INVALID_ERROR });

	const updatedJWT = await authServiceInstance.ChangeUsername(token, username);

	return res.status(200).json({ message: messages.NOTIFICATION_PREFERENCE_CHANGE_SUCCESSFUL, token: updatedJWT });
}

export default withErrorHandling(handler);
