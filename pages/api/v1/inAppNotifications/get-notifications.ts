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
import { IInAppNotification } from '~src/components/InAppNotification/types';

export const getUserNotifications = async ({ network, userId }: { network: string; userId: number }) => {
	try {
		const notificationsSnapshot = await firestore_db.collection('users').doc(String(userId)).collection('notifications').where('network', '==', network).get();

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
			data: response,
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

const handler: NextApiHandler<IInAppNotification[] | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);
	const { userId } = req.body;
	const network = String(req.headers['x-network']);

	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Missing user token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user || userId !== user.id) return res.status(400).json({ message: messages.USER_NOT_FOUND });

	const { data, error, status } = await getUserNotifications({
		network: network,
		userId: userId
	});

	if (error || !data) {
		return res.status(status).json({ message: error || messages.API_FETCH_ERROR });
	} else {
		return res.status(status).json(data);
	}
};

export default withErrorHandling(handler);
