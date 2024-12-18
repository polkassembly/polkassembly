// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { IMessage, IDelegateAddressDetails, EChatRequestStatus } from '~src/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import authServiceInstance from '~src/auth/auth';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import { chatMessagesRef, chatDocRef } from '~src/api-utils/firestore_refs';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import getAddressesFromUserId from '~src/auth/utils/getAddressesFromUserId';
import { getDelegatesData } from '../delegations/getAllDelegates';

const validateRequest = (req: NextApiRequest) => {
	const { senderAddress, receiverAddress, content, chatId } = req.body;

	if (!senderAddress.length || !receiverAddress.length || !content.length || !chatId.length) {
		return { error: messages.INVALID_PARAMS };
	}

	return { chatId, content, receiverAddress, senderAddress };
};

const validateParticipants = async (network: string, senderAddress: string, receiverAddress: string, userId: number) => {
	const senderSubstrateAddress = getSubstrateAddress(senderAddress);
	const receiverSubstrateAddress = getSubstrateAddress(receiverAddress);

	if (!senderSubstrateAddress || !receiverSubstrateAddress || senderAddress === receiverAddress) {
		return { error: 'Invalid senderAddress or receiverAddress' };
	}

	const userAddresses = await getAddressesFromUserId(userId);
	if (!userAddresses?.length) return { error: 'No addresses found for user' };

	const userSubstrateAddresses = userAddresses.map((addr) => getSubstrateAddress(addr.address)).filter(Boolean);
	if (!userSubstrateAddresses.length) return { error: 'No valid substrate addresses found for user' };

	if (!userSubstrateAddresses.includes(senderSubstrateAddress)) {
		return { error: 'User must be logged in to send messages' };
	}

	const { data: delegatesList, error } = await getDelegatesData(network, receiverAddress);
	if (error) return { error: error.message || messages.API_FETCH_ERROR };

	if (delegatesList) {
		const isValidReceiverAddress = delegatesList.some((delegate: IDelegateAddressDetails) => getSubstrateAddress(delegate.address) === receiverSubstrateAddress);
		const isValidSenderAddress = delegatesList.some((delegate: IDelegateAddressDetails) => getSubstrateAddress(delegate.address) === senderSubstrateAddress);

		if (!isValidReceiverAddress && !isValidSenderAddress) {
			return { error: 'At least one participant must be a delegate' };
		}
	}

	return { receiverSubstrateAddress, senderSubstrateAddress };
};

async function handler(req: NextApiRequest, res: NextApiResponse<IMessage | MessageType>) {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user) return res.status(403).json({ message: messages.UNAUTHORISED });

	const validationResult = validateRequest(req);
	if ('error' in validationResult) return res.status(400).json({ message: validationResult?.error ?? messages.INVALID_PARAMS });

	const { senderAddress, receiverAddress, content, chatId } = req.body;

	const participantValidation = await validateParticipants(network, senderAddress, receiverAddress, user?.id);
	if ('error' in participantValidation) return res.status(400).json({ message: participantValidation.error });

	const { senderSubstrateAddress, receiverSubstrateAddress } = participantValidation;

	const chatData = await chatDocRef(chatId)
		.get()
		.then((doc) => doc?.data());

	if (!chatData) {
		return res.status(404).json({ message: 'Chat not found' });
	}

	if (!chatData?.participants?.includes(senderSubstrateAddress)) {
		return res.status(403).json({ message: 'Unauthorized: Not a chat participant' });
	}

	if (chatData?.requestStatus !== EChatRequestStatus.ACCEPTED) {
		return res.status(400).json({ message: 'Cannot only send message on accepted chats' });
	}

	const messageSnapshot = chatMessagesRef(chatId);

	const newMessage = {
		content,
		created_at: new Date(),
		receiverAddress: receiverSubstrateAddress,
		senderAddress: senderSubstrateAddress,
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
