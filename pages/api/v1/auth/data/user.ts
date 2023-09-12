// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType, PublicUser, User } from '~src/auth/types';
import getAddressesFromUserId from '~src/auth/utils/getAddressesFromUserId';
import firebaseAdmin from '~src/services/firebaseInit';

export async function getUser(userId: number): Promise<PublicUser | null> {
	const firestore = firebaseAdmin.firestore();

	const userDoc = await firestore.collection('users').doc(String(userId)).get();
	if(!userDoc.exists) return null;
	const userData = userDoc.data() as User;

	const addresses = await getAddressesFromUserId(Number(userId));
	const default_address = addresses.find((address: any) => address.default === true);

	return {
		default_address: default_address?.address || '',
		id: userData.id,
		primary_network: userData.primary_network || '',
		username: userData.username
	} as PublicUser;
}

async function handler(req: NextApiRequest, res: NextApiResponse<PublicUser | MessageType>) {
	const { userId = null } = req.query;
	if (!userId || isNaN(Number(userId))) return res.status(400).json({ message: 'Invalid id.' });

	const user = await getUser(Number(userId));
	if(!user) return res.status(404).json({ message: `No user found with the id '${userId}'.` });

	return res.status(200).json(user);
}

export default withErrorHandling(handler);