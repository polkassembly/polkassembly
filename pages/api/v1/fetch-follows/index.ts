// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { followsCollRef } from '~src/api-utils/firestore_refs';
import authServiceInstance from '~src/auth/auth';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import { firestore_db } from '~src/services/firebaseInit';

interface FollowerData {
	follower_user_id: number;
	followed_user_id: number;
	created_at: Date;
	username: string;
	image: string | null;
}

interface FollowerResponse {
	message: string;
	followers: FollowerData[];
}

async function handler(req: NextApiRequest, res: NextApiResponse<FollowerResponse>) {
	storeApiKeyUsage(req);

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Missing user token', followers: [] });

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) {
		return res.status(400).json({ message: 'Missing or invalid network name in request headers', followers: [] });
	}

	const user = await authServiceInstance.GetUser(token);
	if (!user) return res.status(400).json({ message: 'User not found', followers: [] });

	try {
		const followersSnapshot = await followsCollRef().where('network', '==', network).where('followed_user_id', '==', user.id).get();

		const followerIds = followersSnapshot.docs.map((doc) => doc.data().follower_user_id);

		if (followerIds.length === 0) {
			return res.status(200).json({ message: 'No followers found', followers: [] });
		}

		// Fetch user profile data (username and image) for the followers
		const usersSnapshot = await firestore_db.collection('users').where('id', 'in', followerIds).get();

		const usersData = usersSnapshot.docs.reduce(
			(acc, doc) => {
				const data = doc.data();
				acc[data.id] = {
					username: data.username,
					image: data.profile?.image || null
				};
				return acc;
			},
			{} as Record<number, { username: string; image: string | null }>
		);

		const followers: FollowerData[] = followersSnapshot.docs.map((doc) => {
			const follower_user_id = doc.data().follower_user_id;
			return {
				follower_user_id,
				followed_user_id: doc.data().followed_user_id,
				created_at: doc.data().created_at.toDate(), // Ensure created_at is stored as a Date
				username: usersData[follower_user_id]?.username || 'Unknown',
				image: usersData[follower_user_id]?.image || null
			};
		});

		followers.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

		return res.status(200).json({ message: 'Followers fetched successfully', followers });
	} catch (err) {
		console.error('Error fetching followers:', err);
		return res.status(500).json({ message: 'Failed to fetch followers', followers: [] });
	}
}

export default withErrorHandling(handler);
