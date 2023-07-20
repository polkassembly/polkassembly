// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';

import authServiceInstance from '~src/auth/auth';
import { ChallengeMessage, MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChallengeMessage | MessageType>,
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

  const { id, status } = req.body;

  if (!id || !status)
    return res
      .status(400)
      .json({ message: 'Missing parameters in request body' });

  const token = getTokenFromReq(req);

  await authServiceInstance.ProposalTrackerUpdate(id, status, token);

  return { message: 'Status updated successfully' };
}
