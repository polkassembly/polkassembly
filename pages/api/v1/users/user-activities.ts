// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import { noTitle } from '~src/global/noTitle';
import { ProposalType } from '~src/global/proposalType';
import { firestore_db } from '~src/services/firebaseInit';
import { getUserProfileWithUserId } from '../auth/data/userProfileWithUsername';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import { EActivityFilter, EUserActivityIn, EUserActivityType } from '~src/types';

interface Props {
	userId: number;
	page: number;
	filterBy: EActivityFilter;
}

interface IUserActivity {
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
	type: EUserActivityType;
}

const handler: NextApiHandler<any | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);
	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const { userId, page = 1, filterBy } = req.body as Props;
	if (isNaN(Number(userId)) || typeof Number(userId) !== 'number') return res.status(400).send({ message: messages.INVALID_PARAMS });
	let activitiesSnapshot = firestore_db
		.collection('user_activities')
		.orderBy('created_at', 'desc')
		.where('network', '==', network)
		.where('is_deleted', '==', false)
		.where('by', '==', userId);

	if (filterBy) {
		activitiesSnapshot = activitiesSnapshot.where('type', '==', filterBy);
	}
	const activitiesDocs = (
		await activitiesSnapshot
			.limit(LISTING_LIMIT)
			.offset((Number(page) - 1) * LISTING_LIMIT)
			.get()
	).docs;

	const totalCount = (await activitiesSnapshot.count().get()).data().count;
	const refs: any = {};
	const data = [];

	for (const activity of activitiesDocs) {
		const activityData = activity?.data() as IUserActivity;

		const postDocRef = postsByTypeRef(network, activityData.post_type).doc(String(activityData?.post_id));
		refs[activityData?.post_id] = postsByTypeRef(network, activityData.post_type).doc(String(activityData?.post_id));
		if (activityData?.comment_id) {
			refs[activityData?.comment_id] = postDocRef.collection('comments').doc(String(activityData.comment_id));
		}
		if (activityData.reply_id) {
			refs[activityData?.reply_id] = postDocRef.collection('comments').doc(String(activityData.comment_id)).collection('replies').doc(activityData.reply_id);
		}
		if (activityData?.type === EUserActivityType.REACTED) {
			if (activityData?.reaction_id?.length && !activityData?.comment_id?.length && !activityData?.reply_id?.length) {
				refs[activityData?.reaction_id] = postDocRef.collection('post_reactions').doc(String(activityData.reaction_id));
			}
			if (activityData?.reaction_id?.length && activityData?.comment_id?.length && !activityData?.reply_id?.length) {
				refs[activityData?.reaction_id] = postDocRef
					.collection('comments')
					.doc(String(activityData.comment_id))
					.collection('comment_reactions')
					.doc(activityData?.reaction_id);
			}
			if (activityData?.reaction_id?.length && activityData?.comment_id?.length && activityData?.reply_id?.length) {
				refs[activityData?.reaction_id] = postDocRef
					.collection('comments')
					.doc(String(activityData.comment_id))
					.collection('replies')
					.doc(activityData?.reply_id)
					.collection('reply_reactions')
					.doc(activityData?.reaction_id);
			}
		}
	}
	let results: any[] = [];
	if (Object.keys(refs)?.length) {
		const values: any = Object.entries(refs).map(([, value]) => value);
		results = await firestore_db?.getAll(...values);
	}
	const postReplyCommentData: any = {};
	results.map((result) => {
		if (result.exists) {
			const data = result.data();
			postReplyCommentData[data?.id] = data;
		}
	});

	for (const activity of activitiesDocs) {
		const activityData = activity.data() as IUserActivity;
		if (activityData?.type === EUserActivityType.REACTED) {
			if (!activityData?.comment_id && !activityData.reply_id && activityData?.post_id && activityData.reaction_id && activityData?.post_author_id) {
				data.push({
					activityIn: EUserActivityIn.POST,
					content: postReplyCommentData[activityData?.post_id]?.content || '',
					createdAt: postReplyCommentData[activityData?.reaction_id]?.created_at?.toDate
						? postReplyCommentData[activityData?.reaction_id]?.created_at?.toDate()
						: postReplyCommentData[activityData?.reaction_id]?.created_at,
					postId: activityData.post_id,
					postTitle: postReplyCommentData[activityData?.post_id]?.title || noTitle,
					postType: activityData.post_type,
					reaction: postReplyCommentData[activityData?.reaction_id]?.reaction,
					type: activityData?.type
				});
			}
			if (!activityData?.reply_id && activityData.reaction_id && activityData?.comment_id) {
				data.push({
					activityIn: EUserActivityIn.COMMENT,
					commentId: activityData?.comment_id,
					content: postReplyCommentData[activityData.comment_id].content || '',
					createdAt: postReplyCommentData[activityData?.reaction_id]?.created_at?.toDate
						? postReplyCommentData[activityData?.reaction_id]?.created_at?.toDate()
						: postReplyCommentData[activityData?.reaction_id]?.created_at,
					postId: activityData.post_id,
					postTitle: postReplyCommentData[activityData.comment_id]?.title || noTitle,
					postType: activityData.post_type,
					reaction: postReplyCommentData[activityData?.reaction_id]?.reaction,
					type: activityData?.type
				});
			}
			if (activityData?.reply_id && activityData?.comment_id && activityData.reaction_id) {
				data.push({
					activityIn: EUserActivityIn.REPLY,
					commentId: activityData?.comment_id,
					content: postReplyCommentData[activityData?.reply_id]?.content || '',
					createdAt: postReplyCommentData[activityData?.reaction_id]?.created_at?.toDate
						? postReplyCommentData[activityData?.reaction_id]?.created_at?.toDate()
						: postReplyCommentData[activityData?.reaction_id]?.created_at,
					postId: activityData.post_id,
					postTitle: postReplyCommentData[activityData.post_id]?.title || noTitle,
					postType: activityData.post_type,
					reaction: postReplyCommentData[activityData?.reaction_id]?.reaction,
					type: activityData?.type
				});
			}
		} else if (activityData?.type === EUserActivityType.MENTIONED) {
			if (!activityData?.comment_id && !activityData?.reply_id && activityData?.mentions && activityData?.post_id) {
				const mentions = [];
				for (const mention of activityData.mentions) {
					const mentionAuthor = await getUserProfileWithUserId(mention);
					if (mentionAuthor?.data) {
						mentions.push(mentionAuthor?.data?.username);
					}
				}

				data.push({
					activityIn: EUserActivityIn.POST,
					content: postReplyCommentData[activityData?.post_id]?.content,
					createdAt: postReplyCommentData[activityData?.post_id]?.created_at?.toDate
						? postReplyCommentData[activityData?.post_id]?.created_at?.toDate()
						: postReplyCommentData[activityData?.post_id]?.created_at,
					mentions,
					postId: activityData.post_id,
					postTitle: postReplyCommentData[activityData?.post_id]?.title || noTitle,
					postType: activityData.post_type,
					type: activityData?.type
				});
			}
			if (!activityData.reply_id && activityData.mentions && activityData?.comment_id && activityData?.post_id) {
				const mentions = [];
				for (const mention of activityData.mentions) {
					const mentionAuthor = await getUserProfileWithUserId(mention);
					if (mentionAuthor?.data) {
						mentions.push(mentionAuthor?.data?.username);
					}
				}

				data.push({
					activityIn: EUserActivityIn.COMMENT,
					commentId: activityData?.comment_id,
					content: postReplyCommentData[activityData?.comment_id]?.content || '',
					createdAt: postReplyCommentData[activityData?.comment_id]?.created_at?.toDate
						? postReplyCommentData[activityData?.comment_id]?.created_at?.toDate()
						: postReplyCommentData[activityData?.comment_id]?.created_at || null,
					mentions,
					postId: activityData.post_id,
					postTitle: postReplyCommentData[activityData?.post_id]?.title || noTitle,
					postType: activityData.post_type,
					type: activityData?.type
				});
			}
			if (activityData.reply_id && activityData.mentions && activityData?.comment_id && activityData?.post_id && activityData?.comment_author_id) {
				const mentions = [];
				for (const mention of activityData.mentions) {
					const mentionAuthor = await getUserProfileWithUserId(mention);
					if (mentionAuthor?.data) {
						mentions.push(mentionAuthor?.data?.username);
					}
				}
				data.push({
					activityIn: EUserActivityIn.REPLY,
					commentId: activityData?.comment_id,
					content: postReplyCommentData[activityData?.reply_id]?.content || '',
					createdAt: postReplyCommentData[activityData?.reply_id]?.created_at?.toDate
						? postReplyCommentData[activityData?.reply_id]?.created_at?.toDate()
						: postReplyCommentData[activityData?.reply_id]?.created_at || null,
					mentions,
					postId: activityData.post_id,
					postTitle: postReplyCommentData[activityData?.post_id]?.title || noTitle,
					postType: activityData.post_type,
					type: activityData?.type
				});
			}
		} else if (
			!activityData.reply_id &&
			activityData?.comment_id &&
			activityData.type === EUserActivityType.COMMENTED &&
			activityData?.post_id &&
			activityData?.comment_author_id
		) {
			data.push({
				activityIn: EUserActivityIn.COMMENT,
				commentId: activityData?.comment_id,
				content: postReplyCommentData[activityData?.comment_id]?.content || '',
				createdAt: postReplyCommentData[activityData?.comment_id]?.created_at?.toDate
					? postReplyCommentData[activityData?.comment_id]?.created_at?.toDate()
					: postReplyCommentData[activityData?.comment_id]?.created_at || null,
				postId: activityData.post_id,
				postTitle: postReplyCommentData[activityData?.post_id]?.title || noTitle,
				postType: activityData.post_type,
				type: activityData?.type
			});
		} else if (activityData.reply_id && activityData?.comment_id && activityData.type === EUserActivityType.REPLIED && activityData?.post_id && activityData?.reply_author_id) {
			data.push({
				activityIn: EUserActivityIn.REPLY,
				commentId: activityData?.comment_id,
				content: postReplyCommentData[activityData?.reply_id]?.content || '',
				createdAt: postReplyCommentData[activityData?.reply_id]?.created_at?.toDate
					? postReplyCommentData[activityData?.reply_id]?.created_at?.toDate()
					: postReplyCommentData[activityData?.reply_id]?.created_at || null,
				postId: activityData.post_id,
				postTitle: postReplyCommentData[activityData?.post_id]?.title || noTitle,
				postType: activityData.post_type,
				type: activityData?.type
			});
		}
	}

	return res.status(200).json({ data: data, totalCount });
};
export default withErrorHandling(handler);
