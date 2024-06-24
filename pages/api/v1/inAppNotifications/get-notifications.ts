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
import { EInAppNotificationsType, IInAppNotification, IInAppNotificationResponse } from '~src/components/InAppNotification/types';
import dayjs from 'dayjs';
import { LISTING_LIMIT } from '~src/global/listingLimit';

const handleModifyData = (notifications: IInAppNotification[], lastSeen: Date, totalNotificationsCount: number) => {
	let modifiedNotifications: IInAppNotificationResponse = {
		lastSeen: null,
		notifications: {
			readNotifications: [],
			unreadNotifications: []
		},
		totalNotificationsCount: totalNotificationsCount
	};

	if (!lastSeen) {
		modifiedNotifications = {
			...modifiedNotifications,
			lastSeen: null,
			notifications: {
				readNotifications: [],
				unreadNotifications:
					notifications.map((notification) => {
						return { ...notification, type: EInAppNotificationsType.UNREAD };
					}) || []
			}
		};
	} else {
		const read: IInAppNotification[] = [];
		const unread: IInAppNotification[] = [];
		notifications.map((notification) => {
			if (dayjs(notification.createdAt).isAfter(lastSeen)) {
				unread.push({ ...notification, type: EInAppNotificationsType.UNREAD });
			} else {
				read.push({ ...notification, type: EInAppNotificationsType.RECENT });
			}
		});
		modifiedNotifications = {
			...modifiedNotifications,
			lastSeen: lastSeen,
			notifications: {
				readNotifications: read || [],
				unreadNotifications: unread || []
			}
		};
	}

	return modifiedNotifications;
};

export const getUserNotifications = async ({ userId, page }: { userId: number; page: number }) => {
	try {
		const notificationsSnapshot = await firestore_db
			.collection('users')
			.doc(String(userId))
			.collection('notifications')
			.orderBy('created_at', 'desc')
			.limit(LISTING_LIMIT)
			.offset(Number(page - 1) * LISTING_LIMIT)
			.get();

		const userSnapshot = await firestore_db.collection('users').doc(String(userId)).get();
		const notificationsCountSnapshot = await firestore_db.collection('users').doc(String(userId)).collection('notifications').orderBy('created_at', 'desc').count().get();

		const totalNotificationsCount = notificationsCountSnapshot.data().count;
		let lastSeen = null;
		if (userSnapshot.exists) {
			const userData = userSnapshot.data();
			lastSeen = userData?.notificationsReadTill?.toDate() || userData?.notificationsReadTill || null;
		}

		const response: IInAppNotification[] = [];

		if (!notificationsSnapshot.empty) {
			notificationsSnapshot.docs.map((doc) => {
				if (doc.exists) {
					const docData = doc.data();
					const payload: IInAppNotification = {
						createdAt: docData.created_at?.toDate ? docData.created_at?.toDate() : docData.created_at,
						id: docData?.id,
						message: docData?.message,
						network: docData.network,
						title: docData?.title,
						url: docData?.url,
						userId: docData?.userId
					};
					response.push(payload);
				}
			});
		}

		return {
			data: handleModifyData(response, lastSeen, totalNotificationsCount || 0),
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

const handler: NextApiHandler<IInAppNotificationResponse | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);
	const network = String(req.headers['x-network']);

	const { page = 1 } = req.body;

	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: messages.INVALID_JWT });

	const user = await authServiceInstance.GetUser(token);
	if (!user) return res.status(400).json({ message: messages.USER_NOT_FOUND });

	if (isNaN(page)) return res.status(400).json({ message: messages.INVALID_PARAMS });

	const { data, error, status } = await getUserNotifications({
		page: Number(page) || 1,
		userId: user.id
	});

	if (error || !data) {
		return res.status(status).json({ message: error || messages.API_FETCH_ERROR });
	} else {
		return res.status(status).json(data);
	}
};

export default withErrorHandling(handler);
