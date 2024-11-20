// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { isAddress } from 'ethers';
import { IMessage } from '~src/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import authServiceInstance from '~src/auth/auth';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import { chatMessagesRef, chatDocRef } from '~src/api-utils/firestore_refs';
import getSubstrateAddress from '~src/util/getSubstrateAddress';

async function handler(req: NextApiRequest, res: NextApiResponse<IMessage | MessageType>) {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user) return res.status(403).json({ message: messages.UNAUTHORISED });

	const { address, senderAddress, receiverAddress, content, senderImage, senderUsername, chatId } = req.body;

	if (!address || !senderAddress.length || !receiverAddress.length || !content.length || !chatId.length) return res.status(400).json({ message: messages.INVALID_PARAMS });
	if (!(getEncodedAddress(String(address), network) || isAddress(String(address)) || getEncodedAddress(String(receiverAddress), network) || isAddress(String(receiverAddress))))
		return res.status(400).json({ message: 'Invalid address' });

	const senderSubstrateAddress = getSubstrateAddress(senderAddress);
	const receiverSubstrateAddress = getSubstrateAddress(receiverAddress);

	if (!senderSubstrateAddress || !receiverSubstrateAddress || senderAddress === receiverAddress) {
		return res.status(400).json({ message: 'Invalid senderAddress or receiverAddress' });
	}
	const chatData = await chatDocRef(chatId)
		.get()
		.then((doc) => doc?.data());

	if (!chatData) {
		return res.status(404).json({ message: 'Chat not found' });
	}

	if (!chatData?.participants?.includes(senderSubstrateAddress)) {
		return res.status(403).json({ message: 'Unauthorized: Not a chat participant' });
	}

	const messageSnapshot = chatMessagesRef(chatId);

	const newMessage = {
		content,
		created_at: new Date(),
		receiverAddress: receiverSubstrateAddress,
		senderAddress: senderSubstrateAddress,
		senderImage,
		senderUsername,
		updated_at: new Date(),
		viewed_by: [senderSubstrateAddress]
	};

	try {
		const newMessageRef = await messageSnapshot.add(newMessage);

		const message = {
			...newMessage,
			id: newMessageRef.id
		};
		return res.status(200).json(message);
	} catch (error) {
		return res.status(500).json({ message: error.message || messages.ERROR_IN_ADDING_EVENT });
	}
}

export default withErrorHandling(handler);
