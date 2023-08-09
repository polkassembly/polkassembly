// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType } from '~src/auth/types';
import firebaseAdmin from '~src/services/firebaseInit';

export interface IVerifyResponse {
	status: boolean;
}

const firestore = firebaseAdmin.firestore();

const handler: NextApiHandler<IVerifyResponse | MessageType> = async (req, res) => {
	const { token, type } = req.query;
	if (!token) {
		return res.status(400).json({ message: 'Please provide a token to verify' });
	}

	const tokenVerification = await firestore.collection('email_verification_tokens').where('token', '==', token).limit(1).get();
	const data = tokenVerification.docs[0].data();

	if (type == 'email') {
		if (tokenVerification.docs.length === 0 || !tokenVerification.docs[0].exists) {
			return res.status(400).json({ message: 'Token verification failed.' });
		}

		if (data.verified) {
			return res.status(400).json({ message: 'Token already verified.' });
		}

		const tokenVerificationRef = tokenVerification.docs[0].ref;

		await tokenVerificationRef.update({
			verified: true
		});

	}

	return res.status(200);

};

export default withErrorHandling(handler);