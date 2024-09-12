// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import messages from '~src/util/messages';
import { MessageType, LeaderboardEntry } from '~src/auth/types';
import { firestore_db } from '~src/services/firebaseInit';
import { LEADERBOARD_LISTING_LIMIT } from '~src/global/listingLimit';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';

export interface LeaderboardResponse {
	count: number;
	data: LeaderboardEntry[];
}

export const getLeaderboard = async ({ page, username = '', include_addresses = false }: { page: number; username: string; include_addresses: boolean }) => {
	try {
		const totalUsers = (await firestore_db.collection('users').count().get()).data().count || 0;

		const usersQuery = username ? firestore_db.collection('users').where('username', '==', username) : firestore_db.collection('users');

		const users = (
			await usersQuery
				.orderBy('profile_score', 'desc')
				.offset(username ? 0 : (Number(page) - 1) * LEADERBOARD_LISTING_LIMIT)
				.limit(username ? 1 : LEADERBOARD_LISTING_LIMIT)
				.get()
		).docs.map((doc) => doc.data());

		const leaderBoardDataPromise = users.map(async (userData) => {
			//calculate rank based on profile score
			const rank = (await firestore_db.collection('users').where('profile_score', '>', Number(userData.profile_score)).count().get()).data().count + 1;

			let userAddresses: string[] = [];

			if (include_addresses) {
				//fetch all addresses for a user
				userAddresses = (await firestore_db.collection('addresses').where('user_id', '==', Number(userData.id)).get()).docs.map((doc) => doc.id);
			}

			return {
				addresses: userAddresses,
				created_at: userData?.created_at?.toDate?.() || new Date(),
				image: userData?.profile?.image,
				profile_score: userData?.profile_score,
				user_id: userData?.id,
				username: userData?.username,
				...userData?.profile,
				rank
			} as LeaderboardEntry;
		});

		const leaderBoardDataResponse = await Promise.allSettled(leaderBoardDataPromise);
		const leaderBoardData = leaderBoardDataResponse.map((entry) => (entry.status === 'fulfilled' ? entry.value : null)).filter(Boolean) as LeaderboardEntry[];

		return {
			data: { count: totalUsers, data: leaderBoardData } as LeaderboardResponse,
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

const handler: NextApiHandler<LeaderboardResponse | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	const { page = 1, username = '', include_addresses = false } = req.body;

	if (isNaN(page) || (username && typeof username !== 'string')) {
		return res.status(400).json({ message: messages.INVALID_REQUEST_BODY });
	}

	const { data, error, status } = await getLeaderboard({
		include_addresses: Boolean(include_addresses),
		page,
		username
	});

	if (error || !data) {
		return res.status(status).json({ message: error || messages.API_FETCH_ERROR });
	}
	if (data) {
		return res.status(status).json(data);
	}
};

export default withErrorHandling(handler);
