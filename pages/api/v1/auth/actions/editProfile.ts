// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { firestore_db } from '~src/services/firebaseInit';

async function handler(req: NextApiRequest, res: NextApiResponse<MessageType>) {
	storeApiKeyUsage(req);

	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Missing network name in request headers' });

	const { manifesto } = req.body;
	if (!manifesto) return res.status(400).json({ message: 'Missing parameters in request body' });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Missing user token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user) return res.status(400).json({ message: messages.USER_NOT_FOUND });

	const userRef = firestore_db.collection('users').doc(String(user.id));
	const userDoc = await userRef.get();

	if (!userDoc.exists) {
		return res.status(403).json({ message: messages.USER_NOT_FOUND });
	}

	//update profile field in userRef
	userRef
		.update({ manifesto: manifesto })
		.then(() => {
			return res.status(200).json({ message: 'Profile updated.' });
		})
		.catch((error) => {
			// The document probably doesn't exist.
			console.error('Error updating document: ', error);
			return res.status(500).json({ message: 'Error updating profile' });
		});
}

export default withErrorHandling(handler);
