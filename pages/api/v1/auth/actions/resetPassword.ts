// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import isValidPassowrd from '~src/auth/utils/isValidPassowrd';
import messages from '~src/auth/utils/messages';

async function handler(req: NextApiRequest, res: NextApiResponse<MessageType>) {
  if (req.method !== 'POST')
    return res
      .status(405)
      .json({ message: 'Invalid request method, POST required.' });

  const token = getTokenFromReq(req);
  if (!token) return res.status(400).json({ message: 'Invalid token' });

  const { userId, newPassword } = req.body;

  if (!userId || !newPassword)
    return res
      .status(400)
      .json({ message: 'Missing parameters in request body' });

  if (!isValidPassowrd(newPassword))
    return res.status(400).json({ message: messages.PASSWORD_LENGTH_ERROR });

  await authServiceInstance.ResetPassword(token, userId, newPassword);

  return res.status(200).json({ message: messages.PASSWORD_RESET_SUCCESSFUL });
}

export default withErrorHandling(handler);
