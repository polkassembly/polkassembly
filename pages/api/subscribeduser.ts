// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiRequest, NextApiResponse } from 'next';
import console_pretty from '~src/api-utils/console_pretty';
import { ProposalType } from '~src/global/proposalType';
import { firestore_db } from '~src/services/firebaseInit';

const chunkArray = (arr: any[], size: number) => {
	const chunkedArr = [];
	for (let i = 0; i < arr.length; i += size) {
		chunkedArr.push(arr.slice(i, i + size));
	}
	return chunkedArr;
};

interface SubscribedPost {
	post_id: number;
	post_type: ProposalType;
	network: string;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
	const userSubscriptions: { [userId: number]: SubscribedPost[] } = {};
	const network = 'polkadot';
	const postsTypeSnapshot = firestore_db.collection('networks').doc(network).collection('post_types');
	const postsTypesDocs = await postsTypeSnapshot.get();
	for (const postsTypeDoc of postsTypesDocs.docs) {
		const postSnapshot = await postsTypeSnapshot.doc(postsTypeDoc.id).collection('posts').get();
		if (!postSnapshot.empty) {
			for (const post of postSnapshot.docs) {
				const postData = post.data();
				if (!postData.id || !Array.isArray(postData.subscribers)) {
					console.warn(`Skipping post with missing ID or subscribers: ${postData}`);
					continue;
				}
				for (const userId of postData.subscribers) {
					const subscribedPost: SubscribedPost = {
						network,
						post_id: postData.id,
						post_type: postsTypeDoc.id as ProposalType
					};
					if (userSubscriptions[userId]) {
						const isAlreadySubscribed = userSubscriptions[userId].some((sub) => sub.post_id === postData.id);
						if (!isAlreadySubscribed) {
							userSubscriptions[userId].push(subscribedPost);
						}
					} else {
						userSubscriptions[userId] = [subscribedPost];
					}
				}
			}
		}
	}
	console_pretty(userSubscriptions);
	const userChunks = chunkArray(Object.keys(userSubscriptions), 400);
	for (const chunk of userChunks) {
		const batch = firestore_db.batch();
		for (const userId of chunk) {
			const userRef = firestore_db.collection('users').doc(userId);
			const userSubscribedPosts = userSubscriptions[userId];
			const userDoc = await userRef.get();
			const existingPosts = (userDoc.data()?.subscribed_posts || []) as SubscribedPost[];
			const validSubscribedPosts = userSubscribedPosts.filter((subscribedPost) => subscribedPost.post_id && subscribedPost.post_type);
			if (validSubscribedPosts.length === 0) {
				continue;
			}
			const mergedPosts = [...existingPosts, ...validSubscribedPosts.filter((subscribedPost) => !existingPosts.some((post) => post.post_id === subscribedPost.post_id))];
			if (mergedPosts.length > 0) {
				batch.set(userRef, { subscribed_posts: mergedPosts }, { merge: true });
			}
		}
		try {
			await batch.commit();
			console.log('Batch committed successfully for users:', chunk);
		} catch (err) {
			console.error('Error committing batch:', err);
		}
	}
	res.status(200).json({ message: 'User subscriptions updated for all posts successfully' });
}
export default handler;
