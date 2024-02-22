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
import { EUserActivityIn, EUserActivityType } from '~src/components/UserProfile/ProfileUserActivity';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';

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

	const { userId = 5807, page = 1 } = req.body as Props;
	if (isNaN(userId) || typeof userId !== 'number') return res.status(400).send({ message: messages.INVALID_PARAMS });
	const activitiesSnapshot = await firestore_db
		.collection('user_activities')
		.where('network', '==', network)
		.where('mentions', 'array-contains', userId)
		.where('type', '==', EUserActivityType.MENTIONED)
		.limit(LISTING_LIMIT)
		.offset((Number(page) - 1) * LISTING_LIMIT)
		.get();

	const totalCountSnapshot = await firestore_db
		.collection('user_activities')
		.where('network', '==', network)
		.where('mentions', 'array-contains', userId)
		.where('type', '==', EUserActivityType.MENTIONED)
		.count()
		.get();

	const totalCount = totalCountSnapshot.data().count;
	const activitiesDocs = activitiesSnapshot.docs;

	const refs = [];
	const userRefs = [];
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
		userRefs.push(firestore_db.collection('users').doc(String(activityData?.by)));
	}

	let results: any[] = [];
	let userResults: any[] = [];
	if (results?.length) {
		results = await firestore_db.getAll(...refs);
	}
	if (userResults?.length) {
		userResults = await firestore_db.getAll(...userRefs);
	}
	const postReplyCommentData: any = {};
	const usersData: any = {};
	results.map((result) => {
		if (result.exists) {
			const data = result.data();
			postReplyCommentData[data?.id] = data;
		}
	});
	userResults.map((result) => {
		const data = result.data();
		usersData[data?.id] = data;
	});

	for (const activity of activitiesDocs) {
		const activityData = activity.data() as IUserActivity;
		if (!activityData?.comment_id && !activityData?.reply_id && activityData?.post_id) {
			data.push({
				activityIn: EUserActivityIn.POST,
				by: usersData[activityData?.by]?.username || '',
				content: postReplyCommentData[activityData?.post_id]?.title || noTitle,
				createdAt: postReplyCommentData[activityData?.post_id]?.created_at?.toDate
					? postReplyCommentData[activityData?.post_id]?.created_at?.toDate()
					: postReplyCommentData[activityData?.post_id]?.created_at,
				postId: activityData.post_id,
				postTitle: postReplyCommentData[activityData?.post_id]?.title || noTitle,
				postType: activityData.post_type,
				type: activityData?.type
			});
		}
		if (!activityData.reply_id && activityData?.comment_id && activityData?.post_id) {
			data.push({
				activityIn: EUserActivityIn.COMMENT,
				by: usersData[activityData?.by]?.username || '',
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
		}
		if (activityData.reply_id && activityData?.comment_id && activityData?.post_id && activityData?.comment_author_id) {
			data.push({
				activityIn: EUserActivityIn.REPLY,
				by: usersData[activityData?.by]?.username || '',
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

	return res.status(200).json({ data: data.sort((a, b) => a.createdAt - b.createdAt), totalCount });
};
export default withErrorHandling(handler);
