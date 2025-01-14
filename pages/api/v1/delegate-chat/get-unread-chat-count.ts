// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiRequest, NextApiResponse } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import authServiceInstance from '~src/auth/auth';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import { chatCollRef } from '~src/api-utils/firestore_refs';
import getAddressesFromUserId from '~src/auth/utils/getAddressesFromUserId';
import getSubstrateAddress from '~src/util/getSubstrateAddress';

const handler = async (req: NextApiRequest, res: NextApiResponse<{ unreadCount: number } | MessageType>) => {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Missing user token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user) return res.status(400).json({ message: messages.USER_NOT_FOUND });

	const userAddresses = await getAddressesFromUserId(user.id);
	if (!userAddresses || !userAddresses.length) return res.status(400).json({ message: 'No addresses found for user' });

	const userSubstrateAddresses = userAddresses.map((addr) => getSubstrateAddress(addr.address)).filter(Boolean);
	if (!userSubstrateAddresses.length) return res.status(400).json({ message: 'No valid substrate addresses found for user' });

	try {
		const chatsSnapshot = await chatCollRef().where('participants', 'array-contains-any', userSubstrateAddresses).get();
		let unreadCount = 0;

		chatsSnapshot.forEach((doc) => {
			const chatData = doc.data();
			const latestMessage = chatData.latestMessage;
			if (latestMessage) {
				const isUnread = userSubstrateAddresses.some((address) => !latestMessage.viewed_by.includes(address));
				if (isUnread) {
					unreadCount++;
				}
			}
		});

		return res.status(200).json({ unreadCount });
	} catch (error) {
		return res.status(500).json({ message: error.message || messages.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
