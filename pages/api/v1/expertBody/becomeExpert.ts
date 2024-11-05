// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { firestore_db } from '~src/services/firebaseInit';
import { EExpertReqStatus } from '~src/types';
import getEncodedAddress from '~src/util/getEncodedAddress';

const handler: NextApiHandler<MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	try {
		const network = String(req.headers['x-network']);
		if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

		const { contribution, userAddress, reason } = req.body;

		const encodedUserAddress = getEncodedAddress(userAddress, network);

		if (!userAddress?.length || !encodedUserAddress) {
			return res.status(400).json({ message: 'Invalid Proposer Address' });
		}

		if (!reason?.length || !contribution?.length) {
			return res.status(400).json({ message: 'reason or Contribution is Missing in request body' });
		}

		const token = getTokenFromReq(req);
		if (!token) return res.status(401).json({ message: messages?.INVALID_JWT });

		const user = await authServiceInstance.GetUser(token);
		if (!user) return res.status(401).json({ message: messages.UNAUTHORISED });

		const expertReqSnapshot = firestore_db.collection('expert_requests');

		const expertReqDocs = await expertReqSnapshot
			.where('userId', '==', user?.id)
			.where('address', '==', encodedUserAddress)
			.get();

		if (!expertReqDocs.empty) {
			return res.status(400).json({ message: messages.EXPERT_REQ_ALREADY_EXIST });
		}

		const expertReqDoc = expertReqSnapshot.doc();

		const payload = {
			address: encodedUserAddress,
			contribution: contribution || '',
			createdAt: new Date(),
			network: network,
			reason: reason || '',
			status: EExpertReqStatus.PENDING,
			userId: user?.id
		};

		await expertReqDoc?.set(payload, { merge: true });
		return res.status(200).json({ message: messages?.SUCCESS });
	} catch (err) {
		return res.status(500).json({ message: err || messages.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
