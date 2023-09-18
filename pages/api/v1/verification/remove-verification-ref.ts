// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType } from '~src/auth/types';
import firebaseAdmin from '~src/services/firebaseInit';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import authServiceInstance from '~src/auth/auth';
import messages from '~src/auth/utils/messages';
import { isValidNetwork } from '~src/api-utils';

const firestore = firebaseAdmin.firestore();

const handler: NextApiHandler<MessageType> = async (req, res) => {
	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

	const token = getTokenFromReq(req);
	if (!token) return res.status(403).json({ message: messages.UNAUTHORISED });
	const user = await authServiceInstance.GetUser(token);
	const userId = user?.id;

	if (!userId) return res.status(403).json({ message: messages.UNAUTHORISED });

	const emailVerificationDoc = await firestore.collection('email_verification_tokens').doc(String(userId)).get();
	if (!emailVerificationDoc.exists) return res.status(400).json({ message: `No doc found with the user id ${userId}` });

	await emailVerificationDoc.ref.delete();
	const twitterVerificationDoc = await firestore.collection('twitter_verification_tokens').doc(String(userId)).get();

	if (!twitterVerificationDoc.exists) return res.status(400).json({ message: `No doc found with the user id ${userId}` });

	await twitterVerificationDoc.ref.delete();

	return res.status(200).json({ message: messages?.SUCCESS });
};

export default withErrorHandling(handler);
