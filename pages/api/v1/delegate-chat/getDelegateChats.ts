// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { isAddress } from 'ethers';
import { EChatRequestStatus, IChat, IChatsResponse, IMessage } from '~src/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import authServiceInstance from '~src/auth/auth';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import { chatCollRef, chatMessagesRef } from '~src/api-utils/firestore_refs';
import getSubstrateAddress from '~src/util/getSubstrateAddress';

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

	const substrateAddress = getSubstrateAddress(address);

	try {
		const [acceptedChatsSnapshot, pendingRequestsSnapshot] = await Promise.all([
			chatCollRef().where('participants', 'array-contains', substrateAddress).where('requestStatus', '==', EChatRequestStatus.ACCEPTED).get(),
			chatCollRef().where('participants', 'array-contains', substrateAddress).where('requestStatus', '!=', EChatRequestStatus.ACCEPTED).get()
		]);

		const mapChatData = async (docs: FirebaseFirestore.QueryDocumentSnapshot[]): Promise<IChat[]> => {
			return Promise.all(
				docs.map(async (doc) => {
					const data = doc?.data();

					// Fetch the latest message for each chat
					const chatMessagesSnapshot = await chatMessagesRef(data.chatId).orderBy('created_at', 'desc').limit(1).get();

					const latestMessage = chatMessagesSnapshot.empty ? null : chatMessagesSnapshot.docs[0]?.data();

					return {
						chatId: data.chatId,
						chatInitiatedBy: data.chatInitiatedBy,
						created_at: data.created_at?.toDate(),
						latestMessage: {
							...latestMessage,
							created_at: latestMessage?.created_at?.toDate(),
							updated_at: latestMessage?.updated_at?.toDate()
						} as IMessage,
						participants: data.participants,
						requestStatus: data.requestStatus,
						updated_at: data.updated_at?.toDate()
					};
				})
			);
		};

		const messages = (await mapChatData(acceptedChatsSnapshot.docs)).sort((a, b) => (b.created_at?.getTime() || 0) - (a.created_at?.getTime() || 0));

		const requests = (await mapChatData(pendingRequestsSnapshot.docs)).sort((a, b) => (b.created_at?.getTime() || 0) - (a.created_at?.getTime() || 0));

		return res.status(200).json({ messages, requests });
	} catch (error) {
		return res.status(500).json({ message: error.message || messages.API_FETCH_ERROR });
	}
}

export default withErrorHandling(handler);
