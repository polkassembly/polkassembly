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
import { EUserActivityCategory, EUserActivityType, LeaderboardPointsResponse } from '~src/types';
import REPUTATION_SCORES from '~src/util/reputationScores';

export const getUserLeaderboardPoints = async ({ page, user_id, activity_category }: { page: number; user_id: number; activity_category?: EUserActivityCategory }) => {
	try {
		let activityTypesToFetch: EUserActivityType[] = [];

		if (activity_category) {
			//find all activity types for the given category from REPUTATION_SCORES
			activityTypesToFetch = Object.values(REPUTATION_SCORES)
				.filter((activity) => activity.category === activity_category)
				.map((activity) => activity.type);
		}

		let userActivityQuery = firestore_db.collection('user_activities').where('by', '==', user_id).where('is_deleted', '==', false);

		const usersQuery = await firestore_db.collection('users').doc(String(user_id)).get();
		if (!usersQuery.exists) {
			return {
				data: null,
				error: 'User not found',
				status: 500
			};
		}

		if (activityTypesToFetch.length) {
			userActivityQuery = userActivityQuery.where('type', 'in', activityTypesToFetch);
		}

		const count = (await userActivityQuery.count().get()).data().count || 0;

		const totalUserActivitiesCount = await userActivityQuery.get();
		let totalPoints: number = 0;

		if (!totalUserActivitiesCount.empty) {
			totalUserActivitiesCount.forEach((doc) => {
				const data = doc.data();
				const type = data.type;
				const points = Object.values(REPUTATION_SCORES).find((activity) => activity.category === activity_category && activity.type === type) as any;
				totalPoints += points?.value || 0;
			});
		}

		const activities = (
			await userActivityQuery
				// .orderBy('created_at', 'desc') //TODO: script and add created_at in all user activities
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

		return {
			data: { count, data: activities, points: totalPoints || 0 } as LeaderboardPointsResponse,
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
	const { page = 1, user_id, activity_category = null } = req.query;

	if (!Number.isInteger(Number(page)) || Number(page) < 1 || !Number.isInteger(Number(user_id)) || Number(user_id) < 1) {
		return res.status(400).json({ message: messages.INVALID_REQUEST_BODY });
	}

	let parsedActivityCategory;

	if (activity_category && Object.values(EUserActivityCategory).includes(activity_category as EUserActivityCategory)) {
		parsedActivityCategory = activity_category as EUserActivityCategory;
	}

	const { data, error, status } = await getUserLeaderboardPoints({
		activity_category: parsedActivityCategory,
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
