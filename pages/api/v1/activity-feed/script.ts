// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';
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
	console.log('Handler called with request:', req.method);

	const userSubscriptions: { [userId: number]: SubscribedPost[] } = {};
	const network = 'polkadot';
	console.log('Network selected:', network);

	try {
		const postsTypeSnapshot = firestore_db.collection('networks').doc(network).collection('post_types');
		const postsTypesDocs = await postsTypeSnapshot.get();
		console.log(`Fetched ${postsTypesDocs.docs.length} post types.`);

		for (const postsTypeDoc of postsTypesDocs.docs) {
			console.log(`Processing post type: ${postsTypeDoc.id}`);
			const postSnapshot = await postsTypeSnapshot.doc(postsTypeDoc.id).collection('posts').get();

			if (!postSnapshot.empty) {
				console.log(`Found ${postSnapshot.docs.length} posts for post type: ${postsTypeDoc.id}`);
				for (const post of postSnapshot.docs) {
					const postData = post.data();
					console.log('Post data:', postData);

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
								console.log(`User ${userId} subscribed to post ${postData.id}`);
							}
						} else {
							userSubscriptions[userId] = [subscribedPost];
							console.log(`User ${userId} initially subscribed to post ${postData.id}`);
						}
					}
				}
			} else {
				console.log(`No posts found for post type: ${postsTypeDoc.id}`);
			}
		}

		const userChunks = chunkArray(Object.keys(userSubscriptions), 400);
		console.log(`Processing ${userChunks.length} user chunks.`);

		for (const chunk of userChunks) {
			const batch = firestore_db.batch();
			for (const userId of chunk) {
				if (userId != 13494) {
					continue;
				}
				console.log(`Processing user: ${userId}`);
				const userRef = firestore_db.collection('users').doc(String(userId));
				const userSubscribedPosts = userSubscriptions[userId];
				const userDoc = await userRef.get();
				const existingPosts = (userDoc.data()?.subscribed_posts || []) as SubscribedPost[];

				console.log(`User ${userId} currently has ${existingPosts.length} subscribed posts.`);

				const validSubscribedPosts = userSubscribedPosts.filter((subscribedPost) => subscribedPost.post_id && subscribedPost.post_type);
				if (validSubscribedPosts.length === 0) {
					console.log(`No valid subscribed posts for user: ${userId}`);
					continue;
				}

				const mergedPosts = [...existingPosts, ...validSubscribedPosts.filter((subscribedPost) => !existingPosts.some((post) => post.post_id === subscribedPost.post_id))];

				if (mergedPosts.length > 0) {
					console.log(`Updating user ${userId} with ${mergedPosts.length} subscribed posts.`);
					batch.update(userRef, { subscribed_posts: mergedPosts });
				}
			}

			try {
				await batch.commit();
				console.log('Batch committed successfully for chunk.');
			} catch (err) {
				console.error('Error committing batch:', err);
			}
		}

		return res.status(200).json({ message: 'User subscriptions updated for all posts successfully' });
	} catch (error) {
		console.error('Error processing subscriptions:', error);
		return res.status(500).json({ error: 'Failed to process user subscriptions' });
	}
}

export default handler;
