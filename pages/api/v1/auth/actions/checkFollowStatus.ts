// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { followsCollRef } from '~src/api-utils/firestore_refs';
import authServiceInstance from '~src/auth/auth';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';

interface FollowStatusResponseType {
	message: string;
	isFollowing: boolean;
}

async function handler(req: NextApiRequest, res: NextApiResponse<FollowStatusResponseType>) {
	storeApiKeyUsage(req);

	const { userIdToCheck } = req.query;
	if (!userIdToCheck || isNaN(Number(userIdToCheck))) {
		return res.status(400).json({ message: 'Missing or invalid userIdToCheck in query parameters', isFollowing: false });
	}

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Missing user token', isFollowing: false });

	const user = await authServiceInstance.GetUser(token);
	if (!user) return res.status(400).json({ message: 'User not found', isFollowing: false });

	const followsDoc = await followsCollRef().where('follower_user_id', '==', user.id).where('followed_user_id', '==', Number(userIdToCheck)).get();

	if (!followsDoc.empty) {
		return res.status(200).json({ message: 'Already following', isFollowing: true });
	}

	return res.status(200).json({ message: 'Not following', isFollowing: false });
}

export default withErrorHandling(handler);
