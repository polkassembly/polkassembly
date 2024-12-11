// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { EChatRequestStatus, IChat, IDelegateAddressDetails, IMessage } from '~src/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import authServiceInstance from '~src/auth/auth';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { chatDocRef, messageDocRef } from '~src/api-utils/firestore_refs';
import { getDelegatesData } from '../delegations/getAllDelegates';
import { firestore_db } from '~src/services/firebaseInit';
import getAddressesFromUserId from '~src/auth/utils/getAddressesFromUserId';

async function handler(req: NextApiRequest, res: NextApiResponse<IChat | MessageType>) {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user) return res.status(403).json({ message: messages.UNAUTHORISED });

	const userAddresses = await getAddressesFromUserId(user.id);
	if (!userAddresses || !userAddresses.length) return res.status(400).json({ message: 'No addresses found for user' });

	const userSubstrateAddresses = userAddresses.map((addr) => getSubstrateAddress(addr.address)).filter(Boolean);
	if (!userSubstrateAddresses.length) return res.status(400).json({ message: 'No valid substrate addresses found for user' });

	const { senderAddress, receiverAddress, content } = req.body;

	if (!senderAddress || !receiverAddress || !content) {
		return res.status(400).json({ message: messages.INVALID_PARAMS });
	}

	const senderSubstrateAddress = getSubstrateAddress(senderAddress);
	const receiverSubstrateAddress = getSubstrateAddress(receiverAddress);

	if (!senderSubstrateAddress || !receiverSubstrateAddress || senderSubstrateAddress === receiverSubstrateAddress) {
		return res.status(400).json({ message: 'Invalid senderAddress or receiverAddress' });
	}

	if (!userSubstrateAddresses.includes(senderSubstrateAddress)) {
		return res.status(400).json({ message: 'You must be logged in to start a chat' });
	}

	const chatId = senderSubstrateAddress.slice(0, 7) + receiverSubstrateAddress.slice(-7);

	const { data: delegatesList, error } = await getDelegatesData(network, receiverAddress);

	if (delegatesList) {
		const isValidReceiverAddress = delegatesList.some((delegate: IDelegateAddressDetails) => getSubstrateAddress(delegate.address) === receiverSubstrateAddress);
		if (!isValidReceiverAddress) return res.status(400).json({ message: `Address ${receiverAddress} is not a valid delegate` });
	} else if (error) {
		return res.status(500).json({ message: error || messages.API_FETCH_ERROR });
	}

	try {
		// Start a Firestore transaction
		const result = await firestore_db.runTransaction(async (transaction) => {
			const chatSnapshot = chatDocRef(chatId);
			const messageId = `${chatId}-${Date.now()}`;
			const messageSnapshot = messageDocRef(chatId, messageId);

			const newMessage: IMessage = {
				content,
				created_at: new Date(),
				id: messageId,
				receiverAddress: receiverSubstrateAddress,
				senderAddress: senderSubstrateAddress,
				updated_at: new Date(),
				viewed_by: [senderSubstrateAddress]
			};

			const newChat = {
				chatId: String(chatId),
				chatInitiatedBy: senderSubstrateAddress,
				created_at: new Date(),
				latestMessage: newMessage,
				participants: [receiverSubstrateAddress, senderSubstrateAddress],
				recipientProfile: {
					address: receiverAddress
				},
				requestStatus: EChatRequestStatus.PENDING,
				updated_at: new Date()
			};

			// Create both chat and message in a single transaction
			transaction.set(chatSnapshot, newChat, { merge: true });
			transaction.set(messageSnapshot, newMessage);

			return { chat: newChat, message: newMessage };
		});

		return res.status(200).json(result.chat);
	} catch (error) {
		return res.status(500).json({ message: error.message || messages.ERROR_IN_ADDING_EVENT });
	}
}

export default withErrorHandling(handler);
