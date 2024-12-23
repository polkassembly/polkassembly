// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType } from '~src/auth/types';
import { firestore_db } from '~src/services/firebaseInit';
import REPUTATION_SCORES from '~src/util/reputationScores';
import { ProposalType } from '~src/global/proposalType';

function chunkObject<T extends Record<string, any>>(obj: T, chunkSize: number): Array<{ [K in keyof T]?: T[K] }> {
	const keys = Object.keys(obj);
	if (keys.length === 0) return [];
	if (chunkSize >= keys.length) return [obj];

	const chunkedArray: Array<{ [K in keyof T]?: T[K] }> = [];
	let index = 0;

	while (index < keys.length) {
		const chunk: { [K in keyof T]?: T[K] } = {};
		keys.slice(index, index + chunkSize).forEach((key) => {
			chunk[key as keyof T] = obj[key as keyof T];
		});
		chunkedArray.push(chunk);
		index += chunkSize;
	}

	return chunkedArray;
}

const handler: NextApiHandler<MessageType> = async (req, res) => {
	try {
		storeApiKeyUsage(req);

		const { password } = req.query;

		if (!password || !process.env.REDIS_DELETE_PASSPHRASE || password !== process.env.REDIS_DELETE_PASSPHRASE) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		console.log('Calculating profile scores...');

		// key: user_id, value: total_score
		const userScores: { [index: number]: number } = {};

		// 1. loop through all users for profile based scores
		const usersCollection = await firestore_db.collection('users').get();
		const addressesCollectionData = (await firestore_db.collection('addresses').get()).docs.map((doc) => doc.data());

		// used to store user ids, in case there are invalid user ids in content (subsquare user comments etc)
		const validUserIds = usersCollection.docs.map((doc) => Number(doc.id));

		console.log('Total users: ', usersCollection.docs.length);
		console.log('\n=============================================\n');

		for (const userDoc of usersCollection.docs) {
			const userData = userDoc.data();

			console.log('Processing profile related score for user_id : ', userData.id);

			let totalScore = 0;

			// check if profile picture exists
			if (userData.profile?.image) {
				totalScore += REPUTATION_SCORES.add_profile_picture.value;
			}

			//bio
			if (userData.profile?.bio) {
				totalScore += REPUTATION_SCORES.add_bio.value;
			}

			//title
			if (userData.profile?.title) {
				totalScore += REPUTATION_SCORES.add_profile_title.value;
			}

			//tags
			if (userData.profile?.badges?.length) {
				totalScore += REPUTATION_SCORES.add_profile_tags.value;
			}

			// multiple addresses linked
			const userAddressCount = addressesCollectionData.filter((addressData) => String(addressData.user_id) === String(userData.id)).length;
			if (userAddressCount > 1) {
				totalScore += REPUTATION_SCORES.link_multiple_wallet_addresses.value;
			}

			userScores[Number(userData.id)] = totalScore;

			console.log(`Profile related score batched for update for user_id : ${userData.id} and total_score: ${totalScore}`);
		}

		//2. loop through posts
		// if post is a discussion, add score to user
		// check if post has been linked, if yes, add score to user
		// loop through post reactions, add score to users per reaction
		// loop through comments, add score to users per comment (one comment per user per post)
		// loop through comment reactions, add score to users per reaction
		// loop through replies, add score to users per reply
		// loop through reply reactions, add score to users per reaction

		const networks = await firestore_db.collection('networks').get();

		console.log('\n=============================================\n');

		console.log('Total networks: ', networks.docs.length);

		console.log('\n=============================================\n');

		for (const networkDoc of networks.docs) {
			console.log('Processing network: ', networkDoc.id);
			console.log('\n\n=============================================\n\n');

			const postTypes = await networkDoc.ref.collection('post_types').get();

			for (const postTypeDoc of postTypes.docs) {
				console.log('Processing post type: ', postTypeDoc.id, 'for network: ', networkDoc.id);

				console.log('\n=============================================\n');

				const posts = await postTypeDoc.ref.collection('posts').get();

				console.log('Total posts: ', posts.docs.length);

				for (const postDoc of posts.docs) {
					console.log('Processing post: ', postDoc.id, 'for network: ', networkDoc.id);

					const postData = postDoc.data();

					console.log('Processing post: ', postDoc.id, ' by user_id: ', postData.user_id || postData.author_id);

					// check if post is a discussion
					if (postTypeDoc.id === ProposalType.DISCUSSIONS) {
						userScores[Number(postData.user_id || postData.author_id)] = userScores[Number(postData.user_id || postData.author_id)]
							? userScores[Number(postData.user_id || postData.author_id)] + REPUTATION_SCORES.create_discussion.value
							: REPUTATION_SCORES.create_discussion.value;
					}

					// check if post is web3 and has been linked to a discussion
					if (postTypeDoc.id != ProposalType.DISCUSSIONS && postData.post_link) {
						userScores[Number(postData.user_id || postData.author_id)] = userScores[Number(postData.user_id || postData.author_id)]
							? userScores[Number(postData.user_id || postData.author_id)] + REPUTATION_SCORES.add_context.value
							: REPUTATION_SCORES.add_context.value;
					}

					// loop through post reactions
					const reactions = await postDoc.ref.collection('post_reactions').get();
					for (const reactionDoc of reactions.docs) {
						const reactionData = reactionDoc.data();

						userScores[Number(reactionData.user_id || reactionData.author_id)] = userScores[Number(reactionData.user_id || reactionData.author_id)]
							? userScores[Number(reactionData.user_id || reactionData.author_id)] + REPUTATION_SCORES.reaction.value
							: REPUTATION_SCORES.reaction.value;
					}

					// loop through comments
					const comments = await postDoc.ref.collection('comments').get();

					console.log('Total comments: ', comments.docs.length);

					const commentUserIds: number[] = [];

					for (const commentDoc of comments.docs) {
						console.log('Processing comment: ', commentDoc.id, ' by user_id: ', commentDoc.data().user_id || commentDoc.data().author_id);

						const commentData = commentDoc.data();

						if (!commentUserIds.includes(Number(commentData.user_id || commentData.author_id))) {
							commentUserIds.push(Number(commentData.user_id || commentData.author_id));
							userScores[Number(commentData.user_id || commentData.author_id)] = userScores[Number(commentData.user_id || commentData.author_id)]
								? userScores[Number(commentData.user_id || commentData.author_id)] + REPUTATION_SCORES.comment.value
								: REPUTATION_SCORES.comment.value;
						}

						// loop through comment reactions
						const commentReactions = await commentDoc.ref.collection('comment_reactions').get();

						for (const commentReactionDoc of commentReactions.docs) {
							console.log('Processing comment reaction: ', commentReactionDoc.id, ' by user_id: ', commentReactionDoc.data().user_id || commentReactionDoc.data().author_id);

							const commentReactionData = commentReactionDoc.data();

							userScores[Number(commentReactionData.user_id || commentReactionData.author_id)] = userScores[Number(commentReactionData.user_id || commentReactionData.author_id)]
								? userScores[Number(commentReactionData.user_id || commentReactionData.author_id)] + REPUTATION_SCORES.reaction.value
								: REPUTATION_SCORES.reaction.value;
						}

						console.log('Processing replies for comment: ', commentDoc.id);

						// loop through replies
						const replies = await commentDoc.ref.collection('replies').get();

						console.log('Total replies: ', replies.docs.length);

						const replyUserIds: number[] = [];

						for (const replyDoc of replies.docs) {
							console.log('Processing reply: ', replyDoc.id, ' by user_id: ', replyDoc.data().user_id || replyDoc.data().author_id);

							const replyData = replyDoc.data();

							if (!replyUserIds.includes(Number(replyData.user_id || replyData.author_id))) {
								replyUserIds.push(Number(replyData.user_id || replyData.author_id));
								userScores[Number(replyData.user_id || replyData.author_id)] = userScores[Number(replyData.user_id || replyData.author_id)]
									? userScores[Number(replyData.user_id || replyData.author_id)] + REPUTATION_SCORES.reply.value
									: REPUTATION_SCORES.reply.value;
							}

							// loop through reply reactions
							const replyReactions = await replyDoc.ref.collection('reply_reactions').get();

							console.log('Total reply reactions: ', replyReactions.docs.length);

							for (const replyReactionDoc of replyReactions.docs) {
								console.log('Processing reply reaction: ', replyReactionDoc.id, ' by user_id: ', replyReactionDoc.data().user_id || replyReactionDoc.data().author_id);

								const replyReactionData = replyReactionDoc.data();

								userScores[Number(replyReactionData.user_id || replyReactionData.author_id)] = userScores[Number(replyReactionData.user_id || replyReactionData.author_id)]
									? userScores[Number(replyReactionData.user_id || replyReactionData.author_id)] + REPUTATION_SCORES.reaction.value
									: REPUTATION_SCORES.reaction.value;
							}
						}
					}

					console.log('\n=============================================\n');
				}
			}
		}

		// update user profile score
		const chunkedUserScores = chunkObject(userScores, 480);

		for (const userScoresChunk of chunkedUserScores) {
			const firestoreBatch = firestore_db.batch();

			for (const userId in userScoresChunk) {
				if (!userId || !validUserIds.includes(Number(userId))) continue;

				const userRef = firestore_db.collection('users').doc(String(userId));

				firestoreBatch.update(userRef, { profile_score: userScoresChunk[Number(userId)] });

				console.log(`Profile score batched for update for user_id : ${userId} and profile_score: ${userScoresChunk[Number(userId)]}`);
			}

			await firestoreBatch.commit();
		}

		console.log('\n=============================================\n');

		console.log('\nSuccess\n');

		return res.status(200).json({ message: 'Success' });
	} catch (error) {
		console.log('Error: ', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
};

export default withErrorHandling(handler);
