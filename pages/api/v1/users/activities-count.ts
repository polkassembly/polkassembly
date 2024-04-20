// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import { firestore_db } from '~src/services/firebaseInit';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import { Filter } from 'firebase-admin/firestore';
import { EUserActivityType } from '~src/types';

interface Props {
	userId: number | null;
	network: string;
}

export const getUserActivitiesCount = async ({ userId, network }: Props) => {
	if (userId === null || isNaN(Number(userId)) || typeof Number(userId) !== 'number') return { data: null, error: messages.INVALID_PARAMS };
	try {
		const totalActivitiesSnapshot = await firestore_db
			.collection('user_activities')
			.orderBy('created_at', 'desc')
			.where('network', '==', network)
			.where('by', '==', userId)
			.where('is_deleted', '==', false)
			.count()
			.get();

		const totalReactionsSnapshot = await firestore_db
			.collection('user_activities')
			.orderBy('created_at', 'desc')
			.where('network', '==', network)
			.where('type', '==', EUserActivityType.REACTED)
			.where(Filter.or(Filter.where('comment_author_id', '==', userId), Filter.where('post_author_id', '==', userId), Filter.where('reply_author_id', '==', userId)))
			.where('is_deleted', '==', false)
			.count()
			.get();

		const totalMentionsSnapshot = await firestore_db
			.collection('user_activities')
			.orderBy('created_at', 'desc')
			.where('network', '==', network)
			.where('mentions', 'array-contains', userId)
			.where('type', '==', EUserActivityType.MENTIONED)
			.where('is_deleted', '==', false)
			.count()
			.get();

		const totalActivitiesCount = totalActivitiesSnapshot.data().count || 0;
		const totalMentionsCount = totalMentionsSnapshot.data().count || 0;
		const totalReactionsCount = totalReactionsSnapshot.data().count || 0;
		return { data: { totalActivitiesCount, totalMentionsCount, totalReactionsCount }, error: null };
	} catch (err) {
		return { data: null, error: err };
	}
};

const handler: NextApiHandler<{ totalActivitiesCount: number; totalMentionsCount: number; totalReactionsCount: number } | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const { userId } = req.body;

	const { data, error } = await getUserActivitiesCount({ network, userId: userId });
	if (data) {
		return res.status(200).json({ totalActivitiesCount: data?.totalActivitiesCount, totalMentionsCount: data?.totalMentionsCount, totalReactionsCount: data?.totalReactionsCount });
	} else {
		return res.status(500).json({ message: error || 'Activities count not found!' });
	}
};
export default withErrorHandling(handler);
