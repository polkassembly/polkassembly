// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import messages from '~src/util/messages';
import { MessageType, User } from '~src/auth/types';
import { firestore_db } from '~src/services/firebaseInit';
import { LEADERBOARD_LISTING_LIMIT } from '~src/global/listingLimit';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import getAddressesFromUserId from '~src/auth/utils/getAddressesFromUserId';
import { Timestamp } from 'firebase-admin/firestore';

export interface UsersResponse {
	count: number;
	data: User[];
}

export const getAllUsers = async ({ page, username, sortOption }: { page: number; username?: string; sortOption?: 'FOLLOWERS' | 'FOLLOWINGS' | 'USERNAME' }) => {
	try {
		let userDocs;

		if (username) {
			userDocs = await firestore_db?.collection('users')?.where('username', '==', username)?.get();
		} else {
			userDocs = await firestore_db?.collection('users')?.orderBy('created_at', 'desc')?.get();
		}
		const users = await Promise.all(
			userDocs?.docs?.map(async (doc) => {
				const user = doc?.data() as User;

				const createdAt = user?.created_at instanceof Timestamp ? user?.created_at?.toDate() : user?.created_at;

				const addresses = await getAddressesFromUserId(user?.id);
				return {
					...user,
					addresses: addresses?.map((a) => a?.address) || [],
					created_at: createdAt
				};
			})
		);
		let sortedUsers = users || [];
		if (sortOption === 'FOLLOWERS') {
			sortedUsers = sortedUsers.sort((a, b) => (b.followers || 0) - (a.followers || 0));
		} else if (sortOption === 'FOLLOWINGS') {
			sortedUsers = sortedUsers.sort((a, b) => (b.followings || 0) - (a.followings || 0));
		} else if (sortOption === 'USERNAME') {
			sortedUsers = sortedUsers.sort((a, b) => (a.username || '').localeCompare(b.username || '', undefined, { sensitivity: 'base' }));
		}
		const startIndex = (Number(page) - 1) * LEADERBOARD_LISTING_LIMIT;
		const paginatedUsers = sortedUsers.slice(startIndex, startIndex + LEADERBOARD_LISTING_LIMIT);
		const totalUsers = username ? userDocs?.size : (await firestore_db?.collection('users')?.count()?.get())?.data()?.count || 0;

		return {
			data: { count: totalUsers, data: paginatedUsers } as UsersResponse,
			error: null,
			status: 200
		};
	} catch (error) {
		return {
			data: null,
			error: error?.message || messages?.API_FETCH_ERROR,
			status: Number(error?.name) || 500
		};
	}
};

const handler: NextApiHandler<UsersResponse | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	const { page = 1, username, sortOption } = req.body;

	if (isNaN(page)) {
		return res?.status(400)?.json({ message: messages?.INVALID_REQUEST_BODY });
	}

	const { data, error, status } = await getAllUsers({ page, sortOption, username });

	if (error || !data) {
		return res?.status(status)?.json({ message: error || messages?.API_FETCH_ERROR });
	}
	if (data) {
		return res?.status(status)?.json(data);
	}
};

export default withErrorHandling(handler);
