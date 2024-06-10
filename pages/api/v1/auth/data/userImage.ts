// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType } from '~src/auth/types';
import { firestore_db } from '~src/services/firebaseInit';

export interface UserProfileImage {
	id: number;
	image: string | null;
}

async function handler(req: NextApiRequest, res: NextApiResponse<UserProfileImage[] | MessageType>) {
	storeApiKeyUsage(req);

	const { userIds } = req.body;

	if (!userIds || !Array.isArray(userIds) || userIds.some((id) => isNaN(Number(id)))) {
		return res.status(400).json({ message: 'Invalid ids.' });
	}

	const userIdsArray = userIds.map((id) => Number(id));

	if (userIdsArray.length === 0) {
		return res.status(400).json({ message: 'No ids provided.' });
	}

	const querySnapshot = await firestore_db.collection('users').where('id', 'in', userIdsArray).get();

	const userData: UserProfileImage[] = querySnapshot.docs.map((doc) => {
		const data = doc.data();
		return {
			id: data.id,
			image: data.profile?.image || null
		};
	});

	return res.status(200).json(userData);
}

export default withErrorHandling(handler);
