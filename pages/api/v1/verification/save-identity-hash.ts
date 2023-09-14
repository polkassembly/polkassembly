// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import messages from '~src/auth/utils/messages';
import { firestore_db } from '~src/services/firebaseInit';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';

const handler: NextApiHandler<MessageType> = async (req, res) => {
	const network = String(req.headers['x-network']);
	const { identityHash } = req.query;
	if (req.method !== 'POST') {
		return res.status(405).json({ message: 'Invalid method in request' });
	}

	if (!isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });
	if (!identityHash) return res.status(400).json({ message: 'Invalid identity hash' });

	const token = getTokenFromReq(req);
	if (!token) return res.status(403).json({ message: messages.UNAUTHORISED });

	const user = await authServiceInstance.GetUser(token);
	const userId = user?.id;

	if (!userId) return res.status(403).json({ message: messages.UNAUTHORISED });

	const userDocRef = firestore_db.collection('users').doc(String(userId));
	const userDoc = await userDocRef.get();

	if (!userDoc.exists) return res.status(404).json({ message: 'User not found' });

	await userDocRef.set(
		{
			identity_hash: identityHash
		},
		{ merge: true }
	);

	return res.status(200).json({ message: messages.SUCCESS });
};
export default withErrorHandling(handler);
