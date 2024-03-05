// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';
import { isValidNetwork } from '~src/api-utils';

import authServiceInstance from '~src/auth/auth';
import { ChallengeMessage, MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ChallengeMessage | MessageType>) {
	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Missing network name in request headers' });

	const { onchain_proposal_id, status, deadline, start_time } = req.body;

	if (isNaN(onchain_proposal_id) || !status || !deadline || !start_time) return res.status(400).json({ message: 'Missing parameters in request body' });

	const token = getTokenFromReq(req);
	if (!token) {
		return res.status(400).json({ message: messages.INVALID_JWT });
	}

	await authServiceInstance.ProposalTrackerCreate(onchain_proposal_id, status, deadline, token, network, start_time);

	return res.json({ message: 'Status set successfully' });
}
