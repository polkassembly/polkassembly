// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { IMessage, IDelegateAddressDetails } from '~src/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import authServiceInstance from '~src/auth/auth';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import { chatDocRef } from '~src/api-utils/firestore_refs';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { getDelegatesData } from '../delegations/getAllDelegates';
import getAddressesFromUserId from '~src/auth/utils/getAddressesFromUserId';

async function handler(req: NextApiRequest, res: NextApiResponse<IMessage[] | MessageType>) {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user) return res.status(403).json({ message: messages.UNAUTHORISED });

	const { chatId } = req.body;
	if (!chatId || !chatId.length) return res.status(400).json({ message: messages.INVALID_PARAMS });

	const userAddresses = await getAddressesFromUserId(user.id);
	if (!userAddresses || !userAddresses.length) return res.status(400).json({ message: 'No addresses found for user' });

	const userSubstrateAddresses = userAddresses.map((addr) => getSubstrateAddress(addr.address)).filter(Boolean);
	if (!userSubstrateAddresses.length) return res.status(400).json({ message: 'No valid substrate addresses found for user' });

	const chatDoc = await chatDocRef(chatId).get();
	if (!chatDoc.exists) {
		return res.status(404).json({ message: 'Chat not found' });
	}

	const chatData = chatDoc?.data();
	if (!chatData) {
		return res.status(404).json({ message: 'Chat not found' });
	}

	const isParticipant = userSubstrateAddresses.some((addr) => chatData?.participants?.includes(addr));
	if (!isParticipant) {
		return res.status(403).json({ message: 'Unauthorized: Not a chat participant' });
	}

	const participantsSubstrateAddr = chatData?.participants.map((addr: string) => getSubstrateAddress(addr));
	const { data: delegatesList, error } = await getDelegatesData(network);

	if (delegatesList) {
		const isAnyParticipantDelegate = participantsSubstrateAddr.some((participantAddr: string) =>
			delegatesList.some((delegate: IDelegateAddressDetails) => getSubstrateAddress(delegate.address) === participantAddr)
		);

		if (!isAnyParticipantDelegate) {
			return res.status(400).json({ message: 'At least one participant must be a delegate' });
		}
	} else if (error) {
		return res.status(500).json({ message: error.message || messages.API_FETCH_ERROR });
	}

	const chatSnapshot = chatDocRef(chatId);
	const viewed_by = participantsSubstrateAddr || [];

	try {
		await chatSnapshot.update({
			'latestMessage.viewed_by': viewed_by
		});

		return res.status(200).json({ message: messages.SUCCESS });
	} catch (error) {
		return res.status(500).json({ message: error.message || messages.ERROR_IN_ADDING_EVENT });
	}
}

export default withErrorHandling(handler);
