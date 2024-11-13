// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { isAddress } from 'ethers';
import { EChatRequestStatus, IChat, IChatsResponse } from '~src/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import authServiceInstance from '~src/auth/auth';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import { chatCollRef } from '~src/api-utils/firestore_refs';

async function handler(req: NextApiRequest, res: NextApiResponse<IChatsResponse | MessageType>) {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const token = getTokenFromReq(req);
	if (!token) return res.status(401).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user) return res.status(403).json({ message: messages.UNAUTHORISED });

	const { address } = req.body;

	if (!address) return res.status(400).json({ message: messages.INVALID_PARAMS });
	if (!(getEncodedAddress(String(address), network) || isAddress(String(address)))) return res.status(400).json({ message: 'Invalid address' });

	const encodedAddress = getEncodedAddress(address, network);

	try {
		const queryMessages = chatCollRef
			.where('requestStatus', '==', EChatRequestStatus.ACCEPTED)
			.where('receiverAddress', 'in', [encodedAddress, null])
			.where('senderAddress', 'in', [encodedAddress, null])
			.get();

		const queryRequests = chatCollRef
			.where('requestStatus', '!=', EChatRequestStatus.ACCEPTED)
			.where('receiverAddress', 'in', [encodedAddress, null])
			.where('senderAddress', 'in', [encodedAddress, null])
			.get();

		const [messagesSnapshot, requestsSnapshot] = await Promise.all([queryMessages, queryRequests]);

		const mapChatData = (docs: FirebaseFirestore.QueryDocumentSnapshot[]): IChat[] =>
			docs
				.map((doc) => {
					const data = doc.data();
					return {
						chatId: data.chatId,
						created_at: data.created_at?.toDate(),
						latestMessage: {
							...data.latestMessage,
							created_at: data.latestMessage?.created_at?.toDate(),
							updated_at: data.latestMessage?.updated_at?.toDate()
						},
						receiverAddress: data.receiverAddress,
						requestStatus: data.requestStatus,
						senderAddress: data.senderAddress,
						updated_at: data.updated_at?.toDate()
					};
				})
				.filter((chat) => chat.latestMessage?.senderAddress);

		// Safe sorting to ensure both dates are defined
		const safeSort = (a: IChat, b: IChat) => (b.created_at?.getTime() || 0) - (a.created_at?.getTime() || 0);

		const messages = mapChatData(messagesSnapshot.docs).sort(safeSort);
		const requests = mapChatData(requestsSnapshot.docs).sort(safeSort);

		return res.status(200).json({ messages, requests });
	} catch (error) {
		return res.status(500).json({ message: error.message || messages.API_FETCH_ERROR });
	}
}

export default withErrorHandling(handler);
