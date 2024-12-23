// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import firebaseAdmin from '~src/services/firebaseInit';
import { IUserNotificationSettings, IUserNotificationTriggerPreferences } from '~src/types';

function isValidNetworkPreferences(network_preferences: any): boolean {
	if (!network_preferences || typeof network_preferences !== 'object' || Array.isArray(network_preferences)) return false;

	for (const key in network_preferences) {
		if (!Object.hasOwnProperty.call(network_preferences, key)) continue;

		const triggerPreferences = network_preferences[key];
		if (
			!triggerPreferences ||
			typeof triggerPreferences !== 'object' ||
			Array.isArray(triggerPreferences) ||
			!('name' in triggerPreferences) ||
			!('enabled' in triggerPreferences) ||
			typeof triggerPreferences.name !== 'string' ||
			typeof triggerPreferences.enabled !== 'boolean'
		) {
			return false;
		}
	}

	return true;
}

async function handler(req: NextApiRequest, res: NextApiResponse<MessageType>) {
	storeApiKeyUsage(req);

	const firestore = firebaseAdmin.firestore();
	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const { networks, network_preferences } = req.body;
	if (!networks || !Array.isArray(networks) || !network_preferences) return res.status(400).json({ message: 'Missing parameters in request body' });

	// network_preferences should be {[index: string]: IUserNotificationTriggerPreferences}
	if (!isValidNetworkPreferences(network_preferences)) return res.status(400).json({ message: 'Invalid network_preferences' });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Missing user token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user) return res.status(400).json({ message: messages.USER_NOT_FOUND });

	const userRef = firestore.collection('users').doc(String(user.id));
	const userDoc = await userRef.get();
	if (!userDoc.exists) return res.status(400).json({ message: messages.USER_NOT_FOUND });

	const userData = userDoc.data();

	const payload: {
		[network: string]: { [index: string]: IUserNotificationTriggerPreferences };
	} = {};

	networks.forEach((network) => {
		payload[network] = network_preferences;
	});
	const newNotificationSettings: IUserNotificationSettings = {
		...(userData?.notification_preferences || {}),
		triggerPreferences: {
			...(userData?.notification_preferences?.triggerPreferences || {}),
			...payload
		}
	};

	await userRef
		.update({ notification_preferences: newNotificationSettings })
		.then(() => {
			return res.status(200).json({ message: 'Success' });
		})
		.catch((error) => {
			console.error('Error updating network preferences: ', error);
			return res.status(500).json({ message: 'Error updating  network preferences' });
		});
}

export default withErrorHandling(handler);
