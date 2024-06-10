// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import messages from '~src/auth/utils/messages';
import { ProposalType } from '~src/global/proposalType';
import { firestore_db } from '~src/services/firebaseInit';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import { EUserActivityType } from '~src/types';
import { MessageType, User } from '~src/auth/types';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';

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
	post_id: number | string;
	post_type: ProposalType;
	reply_author_id?: number;
	reply_id?: string;
	mentions?: number[];
	reaction_id?: string;
	reaction_author_id?: number;
	type: EUserActivityType;
	created_at: Date;
	is_deleted: boolean;
}

const handler: NextApiHandler<any | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);
	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) {
		return res.status(400).json({ message: 'Invalid network in request header' });
	}

	const { userId, page = 1 } = req.body as Props;
	if (isNaN(userId) || typeof userId !== 'number') {
		return res.status(400).send({ message: messages.INVALID_PARAMS });
	}

	try {
		const activitiesSnapshot = await firestore_db
			.collection('user_activities')
			.where('network', '==', network)
			.where('type', '==', EUserActivityType.SUBSCRIBED)
			.where('post_author_id', '==', userId)
			.where('is_deleted', '==', false)
			.orderBy('created_at', 'desc')
			.limit(LISTING_LIMIT)
			.offset((Number(page) - 1) * LISTING_LIMIT)
			.get();

		const activitiesDocs = activitiesSnapshot.docs;

		const dataPromises = activitiesDocs.map(async (activity) => {
			const activityData = activity.data() as IUserActivity;

			const postRef = postsByTypeRef(network, activityData.post_type).doc(String(activityData.post_id));
			const postSnapshot = await postRef.get();
			const postData = postSnapshot.data();

			const userQuerySnapshot = await firestore_db.collection('users').where('id', '==', Number(activityData.by)).limit(1).get();
			if (userQuerySnapshot.size == 0) return res.status(404).json({ message: `No user found with the id '${userId}'.` });
			const userDoc = userQuerySnapshot.docs[0].data() as User;

			return {
				by: activityData.by,
				createdAt: activityData.created_at,
				id: activity.id,
				network: activityData.network,
				postAuthorId: activityData.post_author_id,
				postContent: postData ? postData.content : null,
				postId: activityData.post_id,
				postType: activityData.post_type,
				reacted_by: userDoc.username,
				type: activityData.type
			};
		});

		const data = await Promise.all(dataPromises);

		return res.status(200).json({ data });
	} catch (error) {
		console.error('Error fetching subscribed activities:', error);
		return res.status(500).json({ message: 'Internal Server Error' });
	}
};

export default withErrorHandling(handler);
