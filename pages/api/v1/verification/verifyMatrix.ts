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

const handler: NextApiHandler<MessageType | { url: string }> = async (req, res) => {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);

	const { matrixHandle } = req.body;
	try {
		if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

		if (!matrixHandle?.length || typeof matrixHandle !== 'string') return res.status(400).json({ message: 'Invalid Matrix handle' });

		const token = getTokenFromReq(req);
		if (!token) return res.status(403).json({ message: messages.UNAUTHORISED });

		const user = await authServiceInstance.GetUser(token);
		const userId = user?.id;

		if (!userId) return res.status(403).json({ message: messages.UNAUTHORISED });

		const matrixVerificationDoc = firestore_db.collection('matrix_verification_tokens').doc(String(userId));

		await matrixVerificationDoc.set(
			{
				created_at: new Date(),
				matrix_handle: matrixHandle?.[0] == '@' ? matrixHandle : `@${matrixHandle}`,
				user_id: userId,
				verified: true
			},
			{ merge: true }
		);

		return res.status(200).json({ message: messages.SUCCESS });
	} catch (err) {
		return res.status(500).json({ message: 'Internal server error' });
	}
};
export default withErrorHandling(handler);
