// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { isAddress } from 'ethers';
import { IMessage, IDelegateAddressDetails, EChatRequestStatus } from '~src/types';
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

	const { address, requestStatus, chatId } = req.body;

	if (!requestStatus || !chatId || !chatId.length) return res.status(400).json({ message: messages.INVALID_PARAMS });

	if (!Object.values(EChatRequestStatus).includes(requestStatus)) {
		return res.status(400).json({ message: 'Invalid request status. Must be one of: PENDING, APPROVED, REJECTED' });
	}
	if (!(getEncodedAddress(String(address), network) || isAddress(String(address)))) return res.status(400).json({ message: 'Invalid address' });

	const substrateAddress = getSubstrateAddress(address);

	const chatSnapshot = chatDocRef(chatId);

	const chatData = await chatSnapshot.get().then((doc) => doc?.data());

	if (!chatData) {
		return res.status(404).json({ message: 'Chat not found' });
	}

	const userAddresses = await getAddressesFromUserId(user.id);
	if (!userAddresses || !userAddresses.length) return res.status(400).json({ message: 'No addresses found for user' });

	const userSubstrateAddresses = userAddresses.map((addr) => getSubstrateAddress(addr.address)).filter(Boolean);
	if (!userSubstrateAddresses.length) return res.status(400).json({ message: 'No valid substrate addresses found for user' });

	const isParticipant = userSubstrateAddresses.some((addr) => chatData?.participants?.includes(addr));
	if (!isParticipant) {
		return res.status(403).json({ message: 'Unauthorized: Not a chat participant' });
	}

	if (chatData?.chatInitiatedBy === userSubstrateAddresses[0]) {
		return res.status(403).json({ message: "You don't have permission to update this request's status." });
	}

	const { data: delegatesList, error } = await getDelegatesData(network, address);

	if (delegatesList) {
		const isValidReceiverAddress = delegatesList.some((delegate: IDelegateAddressDetails) => getSubstrateAddress(delegate.address) === substrateAddress);

		if (!isValidReceiverAddress) return res.status(400).json({ message: `Address ${address} is not a valid delegate` });
	} else if (error) {
		return res.status(500).json({ message: error || messages.API_FETCH_ERROR });
	}

	try {
		await chatSnapshot.update({
			requestStatus: requestStatus
		});

		return res.status(200).json({ message: messages.SUCCESS });
	} catch (error) {
		return res.status(500).json({ message: error.message || messages.ERROR_IN_ADDING_EVENT });
	}
}

export default withErrorHandling(handler);
