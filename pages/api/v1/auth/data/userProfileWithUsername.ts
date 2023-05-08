// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType, ProfileDetailsResponse, User } from '~src/auth/types';
import getAddressesFromUserId from '~src/auth/utils/getAddressesFromUserId';
import messages from '~src/auth/utils/messages';
import { firestore_db } from '~src/services/firebaseInit';
import { IApiResponse } from '~src/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';

export async function getUserProfileWithUsername(username: string) : Promise<IApiResponse<ProfileDetailsResponse>> {
	try{
		const userQuerySnapshot = await firestore_db.collection('users').where('username', '==', username).limit(1).get();

		if(userQuerySnapshot.size == 0) throw apiErrorWithStatusCode(messages.NO_USER_FOUND_WITH_USERNAME, 404);

		const userDoc = userQuerySnapshot.docs[0].data() as User;
		const user_addresses = await getAddressesFromUserId(userDoc.id);

		const user: ProfileDetailsResponse = {
			addresses: user_addresses.map((a) => a?.address) || [],
			badges: [],
			bio: '',
			image: '',
			title: '',
			user_id: userDoc.id,
			username: userDoc.username,
			...userDoc.profile
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
	const { username = '' } = req.body || req.query;
	if (typeof username !== 'string' || !username) return res.status(400).json({ message: 'Invalid username.' });

	const { data, error, status } = await getUserProfileWithUsername(username);

	if(error || !data) {
		res.status(status).json({ message: error || messages.API_FETCH_ERROR });
	}else {
		res.status(status).json(data);
	}

}

export default withErrorHandling(handler);