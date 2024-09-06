// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import dayjs from 'dayjs';
import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType, ProfileDetailsResponse, User } from '~src/auth/types';
import getAddressesFromUserId from '~src/auth/utils/getAddressesFromUserId';
import messages from '~src/auth/utils/messages';
import { firestore_db } from '~src/services/firebaseInit';
import { IApiResponse } from '~src/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import getSubstrateAddress from '~src/util/getSubstrateAddress';

export async function getUserIdWithAddress(address: string): Promise<IApiResponse<number>> {
	try {
		address = getSubstrateAddress(address) || '';
		const docSnapshot = await firestore_db.collection('addresses').doc(address).get();

		if (!docSnapshot.exists) {
			return {
				data: null,
				error: messages.NO_USER_FOUND_WITH_ADDRESS,
				status: 404
			};
		}
		const data = docSnapshot.data();
		if (!data?.user_id || isNaN(Number(data?.user_id))) {
			return {
				data: null,
				error: messages.NO_USER_FOUND_WITH_ADDRESS,
				status: 404
			};
		}
		return {
			data: JSON.parse(JSON.stringify(data?.user_id)),
			error: null,
			status: 200
		};
	} catch (error) {
		return {
			data: null,
			error: error.message,
			status: Number(error.name) || 500
		};
	}
}

export async function getUserWithAddress(address: string): Promise<IApiResponse<{ userId: number; username: string }>> {
	try {
		let docSnapshot = await firestore_db.collection('addresses').doc(address).get();
		if (!docSnapshot.exists) {
			address = getSubstrateAddress(address) || '';
			docSnapshot = await firestore_db.collection('addresses').doc(address).get();
			if (!docSnapshot.exists) {
				return {
					data: null,
					error: messages.NO_USER_FOUND_WITH_ADDRESS,
					status: 404
				};
			}
		}

		const data = docSnapshot.data();
		if (!data?.user_id || isNaN(Number(data?.user_id))) {
			return {
				data: null,
				error: messages.NO_USER_FOUND_WITH_ADDRESS,
				status: 404
			};
		}

		const profile = await getUserProfileWithUserId(data.user_id);
		if (!profile?.data?.username) {
			return {
				data: null,
				error: messages.NO_USER_FOUND_WITH_ADDRESS,
				status: 404
			};
		}

		return {
			data: JSON.parse(JSON.stringify({ userId: data.user_id, username: profile.data.username })),
			error: null,
			status: 200
		};
	} catch (error) {
		return {
			data: null,
			error: error.message,
			status: Number(error.name) || 500
		};
	}
}

export async function getUserProfileWithUserId(userId: number): Promise<IApiResponse<ProfileDetailsResponse>> {
	try {
		const userDoc = await firestore_db.collection('users').doc(String(userId)).get();
		if (!userDoc.exists) {
			return {
				data: null,
				error: messages.NO_USER_FOUND_WITH_USER_ID,
				status: 404
			};
		}
		const data = userDoc.data();
		const user_addresses = await getAddressesFromUserId(userId);

		const user: ProfileDetailsResponse = {
			achievement_badges: [],
			addresses: user_addresses.map((a) => a?.address) || [],
			badges: [],
			bio: '',
			image: '',
			title: '',
			user_id: userDoc.id,
			username: data?.username,
			...data?.profile
		};

		return {
			data: JSON.parse(JSON.stringify(user)),
			error: null,
			status: 200
		};
	} catch (error) {
		return {
			data: null,
			error: error.message,
			status: Number(error.name) || 500
		};
	}
}

export async function getUserProfileWithUsername(username: string): Promise<IApiResponse<ProfileDetailsResponse>> {
	try {
		const userQuerySnapshot = await firestore_db.collection('users').where('username', '==', username).limit(1).get();

		if (userQuerySnapshot.size == 0) throw apiErrorWithStatusCode(messages.NO_USER_FOUND_WITH_USERNAME, 404);

		const userDoc = userQuerySnapshot.docs[0].data() as User;
		const user_addresses = await getAddressesFromUserId(userDoc.id);

		const user: ProfileDetailsResponse = {
			addresses: user_addresses?.map((a) => a?.address)?.filter((address) => !!address) || [],
			badges: [],
			bio: '',
			created_at: dayjs((userDoc.created_at as any)?.toDate?.() || userDoc.created_at).toDate(),
			image: userDoc?.profile?.image,
			profile_score: userDoc.profile_score,
			title: '',
			user_id: userDoc.id,
			username: userDoc.username,
			...userDoc.profile,
			achievement_badges: userDoc.profile?.achievement_badges || []
		};

		return {
			data: JSON.parse(JSON.stringify(user)),
			error: null,
			status: 200
		};
	} catch (error) {
		return {
			data: null,
			error: error.message,
			status: Number(error.name) || 500
		};
	}
}

async function handler(req: NextApiRequest, res: NextApiResponse<ProfileDetailsResponse | MessageType>) {
	storeApiKeyUsage(req);

	const { username = '' } = req.query;
	if (typeof username !== 'string' || !username) return res.status(400).json({ message: 'Invalid username.' });

	const { data, error, status } = await getUserProfileWithUsername(username);

	if (error || !data) return res.status(status).json({ message: error || messages.API_FETCH_ERROR });

	return res.status(status).json(data);
}

export default withErrorHandling(handler);
