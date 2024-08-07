// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import authServiceInstance from '~src/auth/auth';
import { ChangeResponseType, MessageType } from '~src/auth/types';
import getDecodedAccessToken from '~src/auth/utils/getDecodedAccessToken';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import changeProfileScore from '../../utils/changeProfileScore';
import REPUTATION_SCORES from '~src/util/reputationScores';

async function handler(req: NextApiRequest, res: NextApiResponse<ChangeResponseType | MessageType>) {
	storeApiKeyUsage(req);

	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const { address } = req.body;
	if (!address) return res.status(400).json({ message: 'Missing parameters in request body' });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Invalid token' });

	const updatedJWT = await authServiceInstance.AddressUnlink(token, address);

	res.status(200).json({ message: messages.ADDRESS_UNLINKING_SUCCESS, token: updatedJWT });

	try {
		// TODO: when a user deletes or unlinks address, only soft delete the entry in the database

		// if user does not have multiple addresses, remove the profile score
		const jwt = getDecodedAccessToken(updatedJWT);

		if (jwt.addresses.length == 1) {
			// this is the second address being linked, reward profile score
			await changeProfileScore(jwt.id, -REPUTATION_SCORES.link_multiple_wallet_addresses.value);
		}
	} catch (e) {
		console.error('Error updating profile score', e);
	}
}

export default withErrorHandling(handler);
