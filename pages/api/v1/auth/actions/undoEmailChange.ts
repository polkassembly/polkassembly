// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import authServiceInstance from '~src/auth/auth';
import { MessageType, UndoEmailChangeResponseType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';

async function handler(req: NextApiRequest, res: NextApiResponse<UndoEmailChangeResponseType | MessageType>) {
	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const token = getTokenFromReq(req);
	if(!token) return res.status(400).json({ message: 'Invalid token' });

	const { updatedToken, email } = await authServiceInstance.UndoEmailChange(token);

	return res.status(200).json({ email, message: messages.EMAIL_UNDO_SUCCESSFUL, token: updatedToken });
}

export default withErrorHandling(handler);
