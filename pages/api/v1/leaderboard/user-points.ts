// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import messages from '~src/util/messages';
import { MessageType } from '~src/auth/types';
import { firestore_db } from '~src/services/firebaseInit';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import { LeaderboardPointsResponse } from '~src/types';

export const getUserLeaderboardPoints = async ({ page, user_id }: { page: number; user_id: number }) => {
	try {
		const userActivityQuery = firestore_db.collection('user_activities').where('by', '==', user_id).where('is_deleted', '==', false);

		const totalUserActivitiesCount = (await userActivityQuery.count().get()).data().count || 0;

		const activities = (
			await userActivityQuery
				// .orderBy('created_at', 'desc') //TODO: add created_at in all user activities
				.offset((Number(page) - 1) * LISTING_LIMIT)
				.limit(LISTING_LIMIT)
				.get()
		).docs.map((doc) => {
			const data = doc.data();
			return {
				...data,
				created_at: data.created_at?.toDate?.() || new Date(),
				updated_at: data.updated_at?.toDate?.() || new Date()
			};
		});

		console.log('activities', activities);

		return {
			data: { count: totalUserActivitiesCount, data: activities } as LeaderboardPointsResponse,
			error: null,
			status: 200
		};
	} catch (error) {
		return {
			data: null,
			error: error.message || messages.API_FETCH_ERROR,
			status: Number(error.name) || 500
		};
	}
};

const handler: NextApiHandler<LeaderboardPointsResponse | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	//get user_id from req.query
	const { page = 1, user_id } = req.query;

	if (isNaN(Number(page)) || isNaN(Number(user_id))) {
		return res.status(400).json({ message: messages.INVALID_REQUEST_BODY });
	}

	const { data, error, status } = await getUserLeaderboardPoints({
		page: Number(page),
		user_id: Number(user_id)
	});

	if (error || !data) {
		return res.status(status).json({ message: error || messages.API_FETCH_ERROR });
	}
	if (data) {
		return res.status(status).json(data);
	}
};

export default withErrorHandling(handler);
