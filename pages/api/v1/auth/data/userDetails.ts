// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType, ProfileDetailsResponse, User } from '~src/auth/types';
import getAddressesFromUserId from '~src/auth/utils/getAddressesFromUserId';
import firebaseAdmin from '~src/services/firebaseInit';

async function handler(req: NextApiRequest, res: NextApiResponse<ProfileDetailsResponse | MessageType>) {
	const firestore = firebaseAdmin.firestore();
	const { userId = null } = req.query;

	if (!userId || isNaN(Number(userId))) return res.status(400).json({ message: 'Invalid id.' });

	const userQuerySnapshot = await firestore.collection('users').where('id', '==', Number(userId)).limit(1).get();

	if(userQuerySnapshot.size == 0) return res.status(404).json({ message: `No user found with the id '${userId}'.` });

	const userDoc = userQuerySnapshot.docs[0].data() as User;
	const user_addresses = await getAddressesFromUserId(userDoc.id);

	const user: ProfileDetailsResponse = {
		addresses: user_addresses.map((a) => a?.address) || [],
		badges: [],
		bio: '',
		image: '',
		social_links: [],
		title: '',
		user_id: userDoc.id,
		username: userDoc.username,
		...userDoc.profile
	};

	res.status(200).json(user);
}

export default withErrorHandling(handler);