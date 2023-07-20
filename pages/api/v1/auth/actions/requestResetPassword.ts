// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import { isValidNetwork } from '~src/api-utils';
import messages from '~src/auth/utils/messages';

async function handler(req: NextApiRequest, res: NextApiResponse<MessageType>) {
  if (req.method !== 'POST')
    return res
      .status(405)
      .json({ message: 'Invalid request method, POST required.' });

  const network = String(req.headers['x-network']);
  if (!network || !isValidNetwork(network))
    res.status(400).json({ message: 'Invalid network in request header' });

  const { email } = req.body;

  if (!email)
    return res
      .status(400)
      .json({ message: 'Missing parameters in request body' });

  const err = await authServiceInstance.RequestResetPassword(email, network);
  if (err) {
    return res.status(403).json({ message: err });
  }

  return res
    .status(200)
    .json({ message: messages.RESET_PASSWORD_RETURN_MESSAGE });
}

export default withErrorHandling(handler);
