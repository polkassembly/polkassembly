// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import { firestore_db } from '~src/services/firebaseInit';
import { EExpertReqStatus } from '~src/types';
import getEncodedAddress from '~src/util/getEncodedAddress';

const handler: NextApiHandler<{ status: string } | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	try {
		if (req.method !== 'POST') {
			return res.status(405).json({ message: 'Method not allowed' });
		}

		const network = String(req.headers['x-network']);
		if (!network || !isValidNetwork(network)) {
			return res.status(400).json({ message: messages.INVALID_NETWORK });
		}

		const { userAddress } = req.body;
		if (!userAddress?.length) {
			return res.status(400).json({ message: 'User address is required' });
		}

		const encodedUserAddress = getEncodedAddress(userAddress, network);

		if (!encodedUserAddress) {
			return res.status(400).json({ message: `Invalid address format for network: ${network}` });
		}

		const expertReqSnapshot = firestore_db.collection('expert_requests');
		const expertReqDocs = await expertReqSnapshot.where('address', '==', encodedUserAddress).limit(1).get();

		if (expertReqDocs.empty) {
			return res.status(404).json({ message: 'Expert request not found' });
		}
		const expertRequest = expertReqDocs.docs[0].data();
		let status = 'not_found';

		switch (expertRequest.status) {
			case EExpertReqStatus.PENDING:
				status = EExpertReqStatus.PENDING;
				break;
			case EExpertReqStatus.REJECTED:
				status = EExpertReqStatus.REJECTED;
				break;
			case EExpertReqStatus.APPROVED:
				status = EExpertReqStatus.APPROVED;
				break;
			default:
				status = 'unknown';
		}

		return res.status(200).json({ status });
	} catch (err) {
		console.error('Error in getExpertStatus:', err);
		if (err instanceof Error) {
			return res.status(500).json({ message: err.message || messages.API_FETCH_ERROR });
		}
		return res.status(500).json({ message: messages.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
