// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType } from '~src/auth/types';
import * as admin from 'firebase-admin';
import { chainProperties } from '~src/global/networkConstants';
import { ProposalType } from '~src/global/proposalType';

const firestore_db = admin.firestore();

enum UserActivityType {
	REACTED = 'REACTED',
	COMMENTED = 'COMMENTED',
	REPLIED = 'REPLIED',
	MENTIONED = 'MENTIONED'
}

interface UserActivity {
	by: number;
	comment_author_id?: number;
	comment_id?: string;
	network: string;
	post_author_id: number;
	post_id: number;
	post_type: ProposalType;
	reply_author_id?: number;
	reply_id?: string;
	mentions?: number[];
	reaction_id?: string;
	reaction_author_id?: number;
	type: UserActivityType;
}
async function handler(req: NextApiRequest, res: NextApiResponse<any | MessageType>) {
	const networks = Object.keys(chainProperties);
	const usersSnapshot = firestore_db.collection('users');
	const usernameToId: any = {};
	const idToUsername: any = {};
	const usersDocs = (await usersSnapshot.get()).docs;
	const activities: UserActivity[] = [];
	const htmlCheck = /<[^>]+>/;
	const regex = /\[@([^\]]+)\]/g;
	// eslint-disable-next-line no-useless-escape
	const htmlContentRegex = /user\/([^"\/]+)/g;
	for (const userDoc of usersDocs) {
		const user = userDoc.data();
		const userId = user?.id;
		idToUsername[userId] = user.username;
		usernameToId[user?.username] = userId;
	}
	for (const network of networks) {
		if (network !== 'polkadot') continue;
		const postsTypesSnapshot = firestore_db.collection('networks').doc(network).collection('post_types');
		const postsTypesDocs = await postsTypesSnapshot.get();
		for (const postsTypeDoc of postsTypesDocs.docs) {
			const postSnapshot = postsTypesSnapshot.doc(postsTypeDoc.id).collection('posts');
			const postsDocs = await postSnapshot.get();
			if (!postsDocs.empty) {
				for (const post of postsDocs.docs) {
					const postData = post.data();
					const commentsSnapshot = postSnapshot.doc(String(postData.id)).collection('comments');
					const commentsDocs = await commentsSnapshot.get();
					const reactionsSnapshot = await postSnapshot.doc(String(postData.id)).collection('post_reactions').get();
					if (postData?.content?.length) {
						const matches = [...(postData?.content?.match(htmlCheck) ? postData.content.matchAll(htmlContentRegex) : postData.content.matchAll(regex))].map((item) => item[1]);
						if (matches.length) {
							const mentions = [];
							for (const match of matches) {
								if (usernameToId[match]) {
									mentions.push(usernameToId[match]);
								}
							}
							if (mentions?.length) {
								activities.push({
									by: postData?.user_id || null,
									mentions,
									network,
									post_author_id: postData.user_id || null,
									post_id: postData.id || null,
									post_type: postsTypeDoc.id as ProposalType,
									type: UserActivityType.MENTIONED
								});
								console.log('here', network, postsTypeDoc.id, 1, activities[activities.length - 1]);
							}
						}
					}

					if (!commentsDocs.empty) {
						for (const doc of commentsDocs.docs) {
							const commentData = doc.data();
							const commentReactionsSnapshot = await commentsSnapshot.doc(String(commentData.id)).collection('comment_reactions').get();
							for (const commentReactionDoc of commentReactionsSnapshot.docs) {
								const commentReactionsData = commentReactionDoc.data();
								if (idToUsername[commentReactionsData?.user_id]) {
									activities.push({
										by: commentReactionsData?.user_id || null,
										comment_author_id: commentData.user_id || null,
										comment_id: commentData.id || null,
										network,
										post_author_id: postData.user_id || null,
										post_id: postData.id || null,
										post_type: postsTypeDoc.id as ProposalType,
										reaction_author_id: commentReactionsData.user_id || null,
										reaction_id: commentReactionsData.id || null,
										type: UserActivityType.REACTED
									});
									console.log('here', network, postsTypeDoc.id, 2, activities[activities.length - 1]);
								}
							}
							const repliesSnapshot = commentsSnapshot.doc(String(commentData.id)).collection('replies');
							const repliesDocs = await repliesSnapshot.get();
							if (!repliesDocs.empty) {
								for (const repliesDoc of repliesDocs.docs) {
									const replyData = repliesDoc.data();
									if (replyData?.content?.length) {
										const replyMatches = [...(replyData?.content?.match(htmlCheck) ? replyData.content.matchAll(htmlContentRegex) : replyData.content.matchAll(regex))].map(
											(item) => item[1]
										);
										if (replyMatches.length) {
											const replyMentions = [];
											for (const match of replyMatches) {
												if (usernameToId[match]) {
													replyMentions.push(usernameToId[match]);
												}
											}

											if (replyMentions?.length) {
												activities.push({
													by: postData?.user_id || null,
													comment_author_id: commentData.user_id || null,
													comment_id: commentData.id || null,
													mentions: replyMentions || [],
													network,
													post_author_id: postData.user_id || null,
													post_id: postData.id || null,
													post_type: postsTypeDoc.id as ProposalType,
													reply_author_id: replyData.user_id || null,
													reply_id: replyData.id || null,
													type: UserActivityType.MENTIONED
												});
												console.log('here', network, postsTypeDoc.id, 3, activities[activities.length - 1]);
											}
										}
									}
									const replyReactionsDocs = (await repliesSnapshot.doc(String(replyData.id)).collection('reply_reactions').get()).docs;
									for (const repliesReactionDoc of replyReactionsDocs) {
										const repliesReactionData = repliesReactionDoc.data();
										if (idToUsername[repliesReactionData?.user_id]) {
											activities.push({
												by: repliesReactionData?.user_id || null,
												comment_author_id: commentData.user_id || null,
												comment_id: commentData.id || null,
												network,
												post_author_id: postData.user_id || null,
												post_id: postData.id || null,
												post_type: postsTypeDoc.id as ProposalType,
												reaction_author_id: repliesReactionData.user_id || null,
												reaction_id: repliesReactionData.id || null,
												reply_author_id: replyData?.user_id || null,
												reply_id: replyData.id || null,
												type: UserActivityType.REACTED
											});
											console.log('here', network, postsTypeDoc.id, 4, activities[activities.length - 1]);
										}
									}
									if (idToUsername[replyData?.user_id]) {
										activities.push({
											by: replyData?.user_id || null,
											comment_author_id: commentData.user_id || null,
											comment_id: commentData.id || null,
											network,
											post_author_id: postData.user_id || null,
											post_id: postData.id || null,
											post_type: postsTypeDoc.id as ProposalType,
											reply_author_id: replyData?.user_id,
											reply_id: replyData.id || null,
											type: UserActivityType.REPLIED
										});
										console.log('here', network, postsTypeDoc.id, 5, activities[activities.length - 1]);
									}
								}
							}
							if (idToUsername[commentData.user_id]) {
								activities.push({
									by: commentData?.user_id || null,
									comment_author_id: commentData.user_id || null,
									comment_id: commentData.id || null,
									network,
									post_author_id: postData.user_id || null,
									post_id: postData.id || null,
									post_type: postsTypeDoc.id as ProposalType,
									type: UserActivityType.COMMENTED
								});
								console.log('here', network, postsTypeDoc.id, 6, activities[activities.length - 1]);
							}

							if (commentData?.content?.length) {
								const commentMatches = [...(commentData?.content?.match(htmlCheck) ? commentData.content.matchAll(htmlContentRegex) : commentData.content.matchAll(regex))].map(
									(item) => item[1]
								);
								if (commentMatches.length) {
									const commentMentions = [];
									for (const match of commentMatches) {
										if (usernameToId[match]) {
											commentMentions.push(usernameToId[match]);
										}
									}
									if (commentMentions?.length) {
										activities.push({
											by: postData?.user_id || null,
											comment_author_id: commentData.user_id || null,
											comment_id: commentData.id || null,
											mentions: commentMentions || [],
											network,
											post_author_id: postData.user_id || null,
											post_id: postData.id || null,
											post_type: postsTypeDoc.id as ProposalType,
											type: UserActivityType.MENTIONED
										});
										console.log('here', network, postsTypeDoc.id, 7, activities[activities.length - 1]);
									}
								}
							}
						}
					}
					if (!reactionsSnapshot.empty) {
						const reactionsDocs = reactionsSnapshot.docs;
						for (const doc of reactionsDocs) {
							const reactionsData = doc.data();
							if (idToUsername[reactionsData?.user_id]) {
								activities.push({
									by: reactionsData?.user_id || null,
									network,
									post_author_id: postData.user_id || null,
									post_id: postData.id || null,
									post_type: postsTypeDoc.id as ProposalType,
									reaction_author_id: reactionsData.user_id || null,
									reaction_id: reactionsData?.id || null,
									type: UserActivityType.REACTED
								});
								console.log('here', network, postsTypeDoc.id, 8, activities[activities.length - 1]);
							}
						}
					}
				}
			}
		}
	}
	function chunkArray(array: UserActivity[], chunkSize: number) {
		const chunks = [];
		for (let i = 0; i < array.length; i += chunkSize) {
			const chunk = array.slice(i, i + chunkSize);
			chunks.push(chunk);
		}
		return chunks;
	}
	const chunkSize = 400;
	const chunkedArray = chunkArray(activities, chunkSize);
	console.log(chunkedArray);
	for (const chunk of chunkedArray) {
		const batch = firestore_db.batch();
		for (const item of chunk) {
			const activityRef = firestore_db.collection('user_activities').doc();
			batch.set(activityRef, item, { merge: true });
		}
		try {
			console.log(chunk, chunk.length);
			await batch.commit();
		} catch (err) {
			console.log(err);
		}
	}

	return res.status(200).json({ activities });
}

export default withErrorHandling(handler);
