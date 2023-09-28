// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import authServiceInstance from '~src/auth/auth';
import { MessageType, NotificationSettings } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';

async function handler(req: NextApiRequest, res: NextApiResponse<NotificationSettings | MessageType>) {
	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Invalid token' });

	try {
		const notification_preferences = await authServiceInstance.GetNotificationPreference(token, network);
		return res.status(200).json(notification_preferences);
	} catch (error) {
		return res.status(Number(error.name)).json({ message: error?.message });
	}
}

export default withErrorHandling(handler);
