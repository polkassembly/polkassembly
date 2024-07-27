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
import { IAddBatchVotes } from '~src/components/TinderStyleVoting/types';
import { firestore_db } from '~src/services/firebaseInit';

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

		const { vote } = req.body as unknown as IAddBatchVotes;

		if (
			typeof vote?.aye_balance !== 'string' ||
			typeof vote?.nay_balance !== 'string' ||
			typeof vote?.abstain_balance !== 'string' ||
			!['aye', 'nay', 'abstain'].includes(vote?.decision) ||
			!vote?.locked_period ||
			typeof vote?.locked_period !== 'number' ||
			!vote?.referendum_index ||
			!vote?.user_address?.length
		) {
			return res.status(403).json({ message: messages.INVALID_PARAMS });
		}

		const ref = firestore_db
			.collection('users')
			.doc(String(user?.id))
			.collection('batch_votes_cart')
			.doc();

		await ref.set({ ...vote, created_at: new Date(), id: ref.id }, { merge: true });
		return res.status(200).send({ message: messages.SUCCESS });
	} catch (error) {
		return res.status(500).send({ message: error || messages.API_FETCH_ERROR });
	}
};
export default withErrorHandling(handler);
