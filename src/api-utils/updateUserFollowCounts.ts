// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { firestore_db } from '~src/services/firebaseInit';

async function updateFollowCounts({ isFollowing, network, targetUserId, userId }: { userId: number; targetUserId: number; network: string; isFollowing: boolean }) {
	const userRef = firestore_db.collection('users').doc(String(userId));
	const targetUserRef = firestore_db.collection('users').doc(String(targetUserId));

	const [userDoc, targetUserDoc] = await Promise.all([userRef.get(), targetUserRef.get()]);

	if (!userDoc.exists || !targetUserDoc.exists) {
		throw new Error('User document not found');
	}

	const batch = firestore_db.batch();
	const increment = isFollowing ? 1 : -1;

	const currentUserFollowingsCount = (userDoc.data()?.followings_count?.[network] || 0) + increment;
	const targetUserFollowersCount = (targetUserDoc.data()?.followers_count?.[network] || 0) + increment;

	batch.update(userRef, {
		[`followings_count.${network}`]: Math.max(currentUserFollowingsCount, 0)
	});
	batch.update(targetUserRef, {
		[`followers_count.${network}`]: Math.max(targetUserFollowersCount, 0)
	});

	try {
		await batch.commit();
		console.log(`Batch update successful for ${isFollowing ? 'follow' : 'unfollow'}`);
	} catch (error) {
		console.error('Error committing batch:', error);
		throw new Error(`Failed to update ${isFollowing ? 'follow' : 'unfollow'} counts`);
	}
}

export default updateFollowCounts;
