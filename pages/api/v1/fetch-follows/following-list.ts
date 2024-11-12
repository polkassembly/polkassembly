// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { followsCollRef } from '~src/api-utils/firestore_refs';
import { isValidNetwork } from '~src/api-utils';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import authServiceInstance from '~src/auth/auth';
import messages from '~src/auth/utils/messages';

export interface FollowingUserIdsResponse {
	message: string;
	followingIds: number[];
}

export interface IFollowState {
	followingIds: number[];
	loading: boolean;
	error: string | null;
}

async function handler(req: NextApiRequest, res: NextApiResponse<FollowingUserIdsResponse>) {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) {
		return res.status(400).json({ message: 'Missing or invalid network name in request headers', followingIds: [] });
	}

	const token = getTokenFromReq(req);
	if (!token) return res.status(401).json({ message: 'Missing user token', followingIds: [] });

	const user = await authServiceInstance.GetUser(token);
	if (!user) return res.status(401).json({ message: messages.USER_NOT_FOUND, followingIds: [] });

	const userId = user.id;

	if (isNaN(Number(userId)) || userId === null || userId === undefined) {
		return res.status(400).json({ message: 'Missing userId in request body', followingIds: [] });
	}

	try {
		const followingSnapshot = await followsCollRef().where('follower_user_id', '==', userId).where('isFollow', '==', true).where('network', '==', network).get();

		const followingIds = followingSnapshot.docs.map((doc) => doc.data().followed_user_id);

		return res.status(200).json({ message: 'Following IDs fetched successfully', followingIds });
	} catch (err) {
		console.error('Error fetching following IDs:', err);
		return res.status(500).json({ message: 'Failed to fetch following IDs', followingIds: [] });
	}
}

export default withErrorHandling(handler);
