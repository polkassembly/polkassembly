// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { networkDocRef } from '~src/api-utils/firestore_refs';
import authServiceInstance from '~src/auth/auth';
import { User } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { GET_SUBSCRIBED_POSTS } from '~src/queries';
import { firestore_db } from '~src/services/firebaseInit';
import fetchSubsquid from '~src/util/fetchSubsquid';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { getUserProfileWithUsername } from '../data/userProfileWithUsername';
import { getSubsquidProposalType, ProposalType } from '~src/global/proposalType';

interface SubscribedPost {
	postId: number;
	postType: string;
	network: string;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'GET') return res.status(405).json({ message: 'Invalid request method, GET required.' });

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Invalid token' });

	const user = (await authServiceInstance.GetUser(token)) as User;
	if (!user) return res.status(400).json({ message: messages.USER_NOT_FOUND });

	try {
		const userRef = firestore_db.collection('users').doc(String(user.id));
		const userDoc = await userRef.get();
		const subscribedPosts = (userDoc.data()?.subscribed_posts || []) as SubscribedPost[];

		if (subscribedPosts.length === 0) {
			return res.status(200).json({ message: 'No subscribed posts found for this user.', posts: [] });
		}

		const postsByType = subscribedPosts.reduce((acc: Record<string, number[]>, post: SubscribedPost) => {
			if (!acc[post.postType]) acc[post.postType] = [];
			acc[post.postType].push(post.postId);
			return acc;
		}, {});

		const subsquidCalls = Object.entries(postsByType).map(async ([postType, postIds]) => {
			if (postType === 'discussions') {
				// Handle Firebase fetch for discussion posts
				const discussionPosts = await Promise.all(
					(postIds as number[]).map(async (postId: number) => {
						const postRef = networkDocRef(network).collection('post_types').doc(postType).collection('posts').doc(String(postId));
						const postDoc = await postRef.get();
						if (postDoc.exists) {
							return { ...postDoc.data(), id: postId, network, postType };
						} else {
							console.warn(`Discussion post not found for id: ${postId}`);
							return null;
						}
					})
				);
				return discussionPosts.filter(Boolean);
			} else {
				// Get user profile and map addresses if username is valid
				const addresses = (await getUserProfileWithUsername(user?.username)) || [];
				const data = addresses.data?.addresses || [];
				const voter_in = data.map((address: string) => getEncodedAddress(address, network));

				const onchainPostType = getSubsquidProposalType(postType as Exclude<ProposalType, 'discussions' | 'grants'>);

				// Fetch data from Subsquid
				const subsquidResponse = await fetchSubsquid({
					network: network,
					query: GET_SUBSCRIBED_POSTS,
					variables: {
						ids: postIds as number[],
						type_eq: onchainPostType,
						voter_in
					}
				});

				// Fetch data from Firebase for the same post
				const onchaindbpostdata = await Promise.all(
					(postIds as number[]).map(async (postId: number) => {
						const postRef = networkDocRef(network).collection('post_types').doc(postType).collection('posts').doc(String(postId));
						const postDoc = await postRef.get();
						if (postDoc.exists) {
							return { ...postDoc.data(), id: postId, network, postType };
						} else {
							console.warn(`Post not found in Firebase for id: ${postId}`);
							return null;
						}
					})
				);

				const combinedPosts = (subsquidResponse.data?.proposals || []).map((proposal: any) => {
					const firebaseData = onchaindbpostdata.find((post) => post?.id === proposal.index);

					return {
						...proposal,
						...firebaseData
					};
				});

				return combinedPosts;
			}
		});

		const allPostResults = await Promise.allSettled(subsquidCalls);

		// Combine the resolved posts (both discussion and non-discussion posts)
		const allPosts = allPostResults.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));

		return res.status(200).json({ message: 'Subscribed posts retrieved successfully.', posts: allPosts });
	} catch (err) {
		console.error('Error fetching subscribed posts:', err);
		return res.status(500).json({ message: messages.INTERNAL });
	}
}

export default withErrorHandling(handler);
