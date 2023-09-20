// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import authServiceInstance from '~src/auth/auth';
import { MessageType, User } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { firestore_db } from '~src/services/firebaseInit';
import { IUserNotificationSettings } from '~src/types';

export async function getNotificationSettings(token: string) {
	const user = await authServiceInstance.GetUser(token);
	if (!user) return null;

	const userDoc = await firestore_db.collection('users').doc(String(user.id)).get();
	if (!userDoc.exists) return null;

	const userData = userDoc.data() as User;
	return userData.notification_preferences || ({} as IUserNotificationSettings);
}

async function handler(req: NextApiRequest, res: NextApiResponse<{ notification_preferences: IUserNotificationSettings } | MessageType>) {
	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Token not found' });

	const notification_preferences = await getNotificationSettings(token);
	if (!notification_preferences) return res.status(400).json({ message: messages.USER_NOT_FOUND });

	return res.status(200).json({ notification_preferences });
}

export default withErrorHandling(handler);
