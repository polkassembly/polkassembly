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

interface Args {
	ids: string[];
}

const handler: NextApiHandler<MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	try {
		if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

		const network = String(req.headers['x-network']);
		if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

		const token = getTokenFromReq(req);
		if (!token) return res.status(403).json({ message: messages.UNAUTHORISED });

		const user = await authServiceInstance.GetUser(token);
		if (!user || isNaN(user.id)) return res.status(403).json({ message: messages.UNAUTHORISED });

		const { ids } = req.body as unknown as Args;

		if (!ids.length && ids.filter((id) => typeof id !== 'string')?.length) return res.status(403).json({ message: messages.INVALID_PARAMS });

		const batch = firestore_db.batch();

		ids.map((id) => {
			const ref = firestore_db
				.collection('users')
				.doc(String(user?.id))
				.collection('batch_votes_cart')
				.doc(id);

			batch.delete(ref);
		});

		await batch.commit();

		return res.status(200).send({ message: messages.SUCCESS });
	} catch (error) {
		return res.status(500).send({ message: error || messages.API_FETCH_ERROR });
	}
};
export default withErrorHandling(handler);
