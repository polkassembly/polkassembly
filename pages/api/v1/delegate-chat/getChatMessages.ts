// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { IMessage } from '~src/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import authServiceInstance from '~src/auth/auth';
import * as admin from 'firebase-admin';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';

const firestore_db = admin.firestore();

async function handler(req: NextApiRequest, res: NextApiResponse<IMessage[] | MessageType>) {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user) return res.status(403).json({ message: messages.UNAUTHORISED });

	const { chatId } = req.body;

	if (!chatId.length) return res.status(400).json({ message: messages.INVALID_PARAMS });

	try {
		const chatMessagesSnapshot = await firestore_db.collection('chats').doc(String(chatId)).collection('messages').orderBy('created_at', 'desc').limit(1).get();

		if (!chatMessagesSnapshot.empty) {
			const messagesData = chatMessagesSnapshot.docs.map((doc) => doc?.data());

			const chatMessages: IMessage[] = messagesData.map((message) => ({
				content: message.content,
				created_at: message.created_at,
				id: message.id,
				receiverAddress: message.receiverAddress,
				senderAddress: message.senderAddress,
				senderImage: message?.senderImage,
				senderUsername: message?.senderUsername,
				updated_at: message.updated_at,
				viewed_by: message?.viewed_by || []
			}));

			return res.status(200).json(chatMessages);
		}
	} catch (error) {
		return res.status(500).json({ message: error.message || messages.API_FETCH_ERROR });
	}
}

export default withErrorHandling(handler);
