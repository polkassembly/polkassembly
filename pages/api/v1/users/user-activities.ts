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
import { EUserActivityIn, EUserActivityType } from '~src/components/UserProfile/ProfileUserActivity';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import authServiceInstance from '~src/auth/auth';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';

interface Props {
	userId: number;
	page: number;
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

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user) return res.status(403).json({ message: messages.UNAUTHORISED });

	const { userId, page = 1 } = req.body as Props;
	if (isNaN(userId) || typeof userId !== 'number') return res.status(400).send({ message: messages.INVALID_PARAMS });
	const activitiesSnapshot = await firestore_db
		.collection('user_activities')
		.where('network', '==', network)
		.where('by', '==', userId)
		.limit(LISTING_LIMIT)
		.offset((Number(page) - 1) * LISTING_LIMIT)
		.get();

	const totalCountSnapshot = await firestore_db.collection('user_activities').where('network', '==', network).where('by', '==', userId).count().get();

	const totalCount = totalCountSnapshot.data().count;
	const activitiesDocs = activitiesSnapshot.docs;

	const refs = [];
	const data = [];

	for (const activity of activitiesDocs) {
		const activityData = activity?.data() as IUserActivity;
		const postDocRef = postsByTypeRef(network, activityData.post_type).doc(String(activityData?.post_id));
		refs.push(postsByTypeRef(network, activityData.post_type).doc(String(activityData?.post_id)));
		if (activityData?.comment_id) {
			refs.push(postDocRef.collection('comments').doc(String(activityData.comment_id)));
		}
		if (activityData.reply_id) {
			refs.push(postDocRef.collection('comments').doc(String(activityData.comment_id)).collection('replies').doc(activityData.reply_id));
		}
		if (activityData?.reaction_id && !activityData?.comment_id && !activityData?.reply_id) {
			refs.push(postDocRef.collection('post_reactions').doc(String(activityData.reaction_id)));
		}
		if (activityData?.reaction_id && activityData?.comment_id && !activityData?.reply_id) {
			refs.push(
				postDocRef
					.collection('comments')
					.doc(String(activityData.comment_id))
					.collection('comment_reactions')
					.doc(activityData?.reaction_id)
			);
		}
		if (activityData?.reaction_id && activityData?.comment_id && activityData?.reply_id) {
			console.log(activityData);
			refs.push(
				postDocRef
					.collection('comments')
					.doc(String(activityData.comment_id))
					.collection('replies')
					.doc(activityData?.reply_id)
					.collection('reply_reactions')
					.doc(activityData?.reaction_id)
			);
		}
	}
	let results: any[] = [];
	if (results?.length) {
		results = await firestore_db?.getAll(...refs);
	}
	const values: any = {};
	results.map((result) => {
		if (result.exists) {
			const data = result.data();
			values[data?.id] = data;
		}
	});

	for (const activity of activitiesDocs) {
		const activityData = activity.data() as IUserActivity;
		if (activityData?.type === EUserActivityType.REACTED) {
			if (!activityData?.comment_id && !activityData.reply_id && activityData?.post_id && activityData.reaction_id && activityData?.post_author_id) {
				data.push({
					activityIn: EUserActivityIn.POST,
					content: values[activityData?.post_id]?.content || '',
					createdAt: values[activityData?.reaction_id]?.created_at?.toDate
						? values[activityData?.reaction_id]?.created_at?.toDate()
						: values[activityData?.reaction_id]?.created_at,
					postId: activityData.post_id,
					postTitle: values[activityData?.post_id]?.title || noTitle,
					postType: activityData.post_type,
					reaction: values[activityData?.reaction_id].reaction,
					type: activityData?.type
				});
			}
			if (!activityData?.reply_id && activityData.reaction_id && activityData?.comment_id && activityData.reaction_id && activityData.comment_author_id) {
				data.push({
					activityIn: EUserActivityIn.COMMENT,
					commentId: activityData?.comment_id,
					content: values[activityData.comment_id].content || '',
					createdAt: values[activityData?.reaction_id]?.created_at?.toDate
						? values[activityData?.reaction_id]?.created_at?.toDate()
						: values[activityData?.reaction_id]?.created_at,
					postId: activityData.post_id,
					postTitle: values[activityData.comment_id]?.title || noTitle,
					postType: activityData.post_type,
					reaction: values[activityData?.reaction_id]?.reaction,
					type: activityData?.type
				});
			}
			if (activityData?.reply_id && activityData?.comment_id && activityData.reaction_id && activityData.reply_author_id) {
				console.log(values[activityData?.reply_id]);
				data.push({
					activityIn: EUserActivityIn.REPLY,
					commentId: activityData?.comment_id,
					content: values[activityData?.reply_id]?.content || '',
					createdAt: values[activityData?.reaction_id]?.created_at?.toDate
						? values[activityData?.reaction_id]?.created_at?.toDate()
						: values[activityData?.reaction_id]?.created_at,
					postId: activityData.post_id,
					postTitle: values[activityData.post_id]?.title || noTitle,
					postType: activityData.post_type,
					reaction: values[activityData?.reaction_id]?.reaction,
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
					content: values[activityData?.post_id]?.content,
					createdAt: values[activityData?.post_id]?.created_at?.toDate ? values[activityData?.post_id]?.created_at?.toDate() : values[activityData?.post_id]?.created_at,
					mentions,
					postId: activityData.post_id,
					postTitle: values[activityData?.post_id]?.title || noTitle,
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
					content: values[activityData?.comment_id]?.content || '',
					createdAt: values[activityData?.comment_id]?.created_at?.toDate
						? values[activityData?.comment_id]?.created_at?.toDate()
						: values[activityData?.comment_id]?.created_at || null,
					mentions,
					postId: activityData.post_id,
					postTitle: values[activityData?.post_id]?.title || noTitle,
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
					content: values[activityData?.reply_id]?.content || '',
					createdAt: values[activityData?.reply_id]?.created_at?.toDate ? values[activityData?.reply_id]?.created_at?.toDate() : values[activityData?.reply_id]?.created_at || null,
					mentions,
					postId: activityData.post_id,
					postTitle: values[activityData?.post_id]?.title || noTitle,
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
				content: values[activityData?.comment_id]?.content || '',
				createdAt: values[activityData?.comment_id]?.created_at?.toDate
					? values[activityData?.comment_id]?.created_at?.toDate()
					: values[activityData?.comment_id]?.created_at || null,
				postId: activityData.post_id,
				postTitle: values[activityData?.post_id]?.title || noTitle,
				postType: activityData.post_type,
				type: activityData?.type
			});
		} else if (activityData.reply_id && activityData?.comment_id && activityData.type === EUserActivityType.REPLIED && activityData?.post_id && activityData?.reply_author_id) {
			data.push({
				activityIn: EUserActivityIn.REPLY,
				commentId: activityData?.comment_id,
				content: values[activityData?.reply_id]?.content || '',
				createdAt: values[activityData?.reply_id]?.created_at?.toDate ? values[activityData?.reply_id]?.created_at?.toDate() : values[activityData?.reply_id]?.created_at || null,
				postId: activityData.post_id,
				postTitle: values[activityData?.post_id]?.title || noTitle,
				postType: activityData.post_type,
				type: activityData?.type
			});
		}
	}

	return res.status(200).json({ data: data.sort((a, b) => a.createdAt - b.createdAt), totalCount });
};
export default withErrorHandling(handler);
