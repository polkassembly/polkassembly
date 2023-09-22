// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import messages from '~src/auth/utils/messages';
import firebaseAdmin, { firestore_db } from '~src/services/firebaseInit';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import { MessageType } from '~src/auth/types';
import getSubstrateAddress from '~src/util/getSubstrateAddress';

const firestore = firebaseAdmin.firestore();

const handler: NextApiHandler<MessageType | string> = async (req, res) => {
	const network = String(req.headers['x-network']);
	if (req.method !== 'POST') {
		return res.status(400).json({ message: 'Invalid method in request body' });
	}
	const { userAddress } = req.body;

	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });
	if (userAddress || typeof userAddress !== 'string') return res.status(400).json({ message: 'Invalid user address in request body' });

	const token = getTokenFromReq(req);
	if (!token || token !== process.env.IDENTITY_JUDGEMENT_AUTH) return res.status(403).json({ message: messages.UNAUTHORISED });

	const substrateAddress = getSubstrateAddress(String(userAddress));
	if (!substrateAddress) {
		return res.status(500).json({ message: 'Invalid substrate address' });
	}
	const addressDoc = await firestore_db.collection('addresses').doc(substrateAddress).get();
	if (!addressDoc.exists) {
		return res.status(404).json({ message: `No user found with the address '${userAddress}'.` });
	}

	const userDoc = await firestore_db
		.collection('users')
		.doc(String(addressDoc.data()?.user_id))
		.get();
	if (!userDoc.exists) {
		return res.status(404).json({ message: `No user found with the address '${userAddress}'.` });
	}
	const userData: any = userDoc.data();
	const userId = userData.user_id;

	if (!userId) return res.status(403).json({ message: messages.UNAUTHORISED });

	const batch = firestore_db.batch();

	batch.update(userDoc.ref, {
		onchain_identity_via_polkassembly: true
	});

	const emailVerificationDoc = await firestore.collection('email_verification_tokens').doc(String(userId)).get();

	batch.delete(emailVerificationDoc.ref);

	const twitterVerificationDoc = await firestore.collection('twitter_verification_tokens').doc(String(userId)).get();

	if (!twitterVerificationDoc.exists || !emailVerificationDoc.exists || !userDoc.exists) {
		res.status(400).json({ message: "We couldn't find any documents associated with your user ID" });
	}
	batch.delete(twitterVerificationDoc.ref);

	await batch.commit();

	return res.status(200).json({ message: messages.SUCCESS });
};
export default withErrorHandling(handler);
