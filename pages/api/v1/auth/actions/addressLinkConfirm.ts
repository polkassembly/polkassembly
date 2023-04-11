// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import authServiceInstance from '~src/auth/auth';
import { ChangeResponseType, MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import getSubstrateAddress from '~src/util/getSubstrateAddress';

async function handler(req: NextApiRequest, res: NextApiResponse<ChangeResponseType | MessageType>) {
	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const { address, signature , wallet } = req.body;
	if(!address || !signature || !wallet) return res.status(400).json({ message: 'Missing parameters in request body' });

	const token = getTokenFromReq(req);
	if(!token) return res.status(400).json({ message: 'Invalid token' });

	const substrateAddress = getSubstrateAddress(address);
	if(!substrateAddress) return res.status(400).json({ message: messages.INVALID_ADDRESS });

	const updatedJWT = await authServiceInstance.AddressLinkConfirm(token, substrateAddress, signature, wallet);

	return res.status(200).json({ message: messages.ADDRESS_LINKING_SUCCESSFUL, token: updatedJWT });
}

export default withErrorHandling(handler);
