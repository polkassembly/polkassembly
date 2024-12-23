// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import messages from '~src/auth/utils/messages';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import authServiceInstance from '~src/auth/auth';
import { firestore_db } from '~src/services/firebaseInit';

export const getUserNotifications = async ({ userId }: { userId: number }) => {
	try {
		const userSnapshot = await firestore_db.collection('users').doc(String(userId)).get();
		let lastSeen = null;
		if (userSnapshot.exists) {
			const userData = userSnapshot.data();
			lastSeen = userData?.notificationsReadTill?.toDate() || userData?.notificationsReadTill || null;
		}
		let notificationsSnapshot;
		if (lastSeen) {
			notificationsSnapshot = await firestore_db.collection('users').doc(String(userId)).collection('notifications').where('created_at', '>', lastSeen).count().get();
		} else {
			notificationsSnapshot = await firestore_db.collection('users').doc(String(userId)).collection('notifications').count().get();
		}

		const unreadNotificationsCount = notificationsSnapshot.data()?.count || 0;

		return {
			data: { lastSeen: lastSeen || null, unread: unreadNotificationsCount || 0 },
			error: null,
			status: 200
		};
	} catch (err) {
		return {
			data: null,
			error: err || messages.API_FETCH_ERROR,
			status: 500
		};
	}
};

const handler: NextApiHandler<{ unread: number; lastSeen: Date } | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);
	const network = String(req.headers['x-network']);

	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Missing user token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user) return res.status(400).json({ message: messages.USER_NOT_FOUND });

	const { data, error, status } = await getUserNotifications({
		userId: user.id
	});

	if (error || !data) {
		return res.status(status).json({ message: error || messages.API_FETCH_ERROR });
	} else {
		return res.status(status).json(data);
	}
};

export default withErrorHandling(handler);
