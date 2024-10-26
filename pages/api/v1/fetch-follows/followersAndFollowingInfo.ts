// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { firestore_db } from '~src/services/firebaseInit';
import { followsCollRef } from '~src/api-utils/firestore_refs';
import { isValidNetwork } from '~src/api-utils';

export interface FollowUserData {
	follower_user_id: number;
	followed_user_id: number;
	created_at: Date;
	username: string;
	image: string | null;
}

export interface FollowersResponse {
	message: string;
	followers: FollowUserData[];
	following: FollowUserData[];
}

async function handler(req: NextApiRequest, res: NextApiResponse<FollowersResponse>) {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) {
		return res.status(400).json({ message: 'Missing or invalid network name in request headers', followers: [], following: [] });
	}

	const { userId } = req.body;
	if (isNaN(Number(userId)) || userId === null || userId === undefined) return res.status(400).json({ message: 'Missing userId in request body', followers: [], following: [] });

	try {
		const followersSnapshot = await followsCollRef().where('followed_user_id', '==', userId).where('network', '==', network).get();
		const followerIds = followersSnapshot.docs.map((doc) => doc.data().follower_user_id);

		const followingSnapshot = await followsCollRef().where('follower_user_id', '==', userId).where('network', '==', network).get();
		const followingIds = followingSnapshot.docs.map((doc) => doc.data().followed_user_id);

		let followerUsersData: Record<number, { username: string; image: string | null }> = {};
		let followingUsersData: Record<number, { username: string; image: string | null }> = {};

		if (followerIds.length > 0) {
			const followerUsersSnapshot = await firestore_db.collection('users').where('id', 'in', followerIds).get();
			followerUsersData = followerUsersSnapshot.docs.reduce(
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
		}

		if (followingIds.length > 0) {
			const followingUsersSnapshot = await firestore_db.collection('users').where('id', 'in', followingIds).get();
			followingUsersData = followingUsersSnapshot.docs.reduce(
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
		}

		const followers: FollowUserData[] = followersSnapshot.docs.map((doc) => {
			const follower_user_id = doc.data().follower_user_id;
			return {
				follower_user_id,
				followed_user_id: doc.data().followed_user_id,
				created_at: doc.data().created_at.toDate(),
				username: followerUsersData[follower_user_id]?.username || 'Unknown',
				image: followerUsersData[follower_user_id]?.image || null
			};
		});

		const following: FollowUserData[] = followingSnapshot.docs.map((doc) => {
			const followed_user_id = doc.data().followed_user_id;
			return {
				follower_user_id: doc.data().follower_user_id,
				followed_user_id,
				created_at: doc.data().created_at.toDate(),
				username: followingUsersData[followed_user_id]?.username || 'Unknown',
				image: followingUsersData[followed_user_id]?.image || null
			};
		});

		return res.status(200).json({ message: 'Followers and following fetched successfully', followers, following });
	} catch (err) {
		console.error('Error fetching followers and following:', err);
		return res.status(500).json({ message: 'Failed to fetch followers and following', followers: [], following: [] });
	}
}

export default withErrorHandling(handler);
