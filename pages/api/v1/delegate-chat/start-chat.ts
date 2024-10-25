// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { isAddress } from 'ethers';
import { IChat } from '~src/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import authServiceInstance from '~src/auth/auth';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import { chatDocRef } from '~src/api-utils/firestore_refs';

async function handler(req: NextApiRequest, res: NextApiResponse<IChat | MessageType>) {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user) return res.status(403).json({ message: messages.UNAUTHORISED });

	const { address, senderAddress, receiverAddress } = req.body;

	if (!address || !senderAddress.length || !receiverAddress.length) return res.status(400).json({ message: messages.INVALID_PARAMS });
	if (!(getEncodedAddress(String(address), network) || isAddress(String(address)) || getEncodedAddress(String(receiverAddress), network) || isAddress(String(receiverAddress))))
		return res.status(400).json({ message: 'Invalid address' });

	if (!senderAddress || !receiverAddress || senderAddress === receiverAddress) {
		return res.status(400).json({ message: 'Invalid senderAddress or receiverAddress' });
	}
	const chatId = senderAddress.slice(0, 7) + receiverAddress.slice(-7);

	const chatSnapshot = chatDocRef(chatId);
	const newChat: any = {
		chatId: String(chatId),
		created_at: new Date(),
		receiverAddress,
		senderAddress,
		updated_at: new Date()
	};

	try {
		await chatSnapshot.set(newChat, { merge: true });

		const chatDoc = await chatSnapshot.get();

		const data = chatDoc.data();

		const chat: IChat = {
			chatId: data?.chatId,
			created_at: data?.created_at?.toDate(),
			latestMessage: data?.latestMessage,
			receiverAddress: data?.receiverAddress,
			senderAddress: data?.senderAddress,
			updated_at: data?.updated_at?.toDate()
		};

		return res.status(200).json(chat);
	} catch (error) {
		return res.status(500).json({ message: error.message || messages.ERROR_IN_ADDING_EVENT });
	}
}

export default withErrorHandling(handler);
