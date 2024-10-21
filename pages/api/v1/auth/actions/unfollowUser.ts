// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { followsCollRef } from '~src/api-utils/firestore_refs';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { firestore_db } from '~src/services/firebaseInit';

async function handler(req: NextApiRequest, res: NextApiResponse<MessageType>) {
	storeApiKeyUsage(req);

	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Missing or invalid network name in request headers' });

	// userId to follow
	const { userId } = req.body;
	if (isNaN(Number(userId)) || userId === null || userId === undefined) return res.status(400).json({ message: 'Missing or invalid user id in request body' });

	const userIdToUnfollow = Number(userId);

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Missing user token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user) return res.status(400).json({ message: messages.USER_NOT_FOUND });

	if (user.id === userIdToUnfollow) {
		return res.status(400).json({ message: 'Cannot unfollow yourself' });
	}

	const userRef = firestore_db.collection('users').doc(String(userIdToUnfollow));
	const userDoc = await userRef.get();

	if (!userDoc.exists) {
		return res.status(403).json({ message: 'User to unfollow not found' });
	}

	const followsRef = followsCollRef();
	const followsDoc = await followsRef.where('network', '==', network).where('follower_user_id', '==', user.id).where('followed_user_id', '==', userIdToUnfollow).get();

	if (followsDoc.empty) {
		return res.status(400).json({ message: 'User not followed' });
	}

	//delete the follow entry

	await followsDoc.docs[0].ref.delete();

	//TODO: delete activity for the user unfollowed
	//TODO: send notification to the user unfollowed

	return res.status(200).json({ message: 'User unfollowed' });
}

export default withErrorHandling(handler);
