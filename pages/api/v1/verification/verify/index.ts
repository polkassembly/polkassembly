// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType } from '~src/auth/types';
import firebaseAdmin from '~src/services/firebaseInit';
import { VerificationStatus } from '..';
import messages from '~src/auth/utils/messages';
import { isValidNetwork } from '~src/api-utils';

export interface IVerifyResponse {
	status: boolean;
}

const firestore = firebaseAdmin.firestore();

const handler: NextApiHandler<IVerifyResponse | MessageType> = async (req, res) => {
	const { token, type } = req.query;
	const network = String(req.headers['x-network']);

	if(!network || !isValidNetwork(network)) res.status(400).json({ message: messages.INVALID_NETWORK });

	if (!token || !type) {
		return res.status(400).json({ message: 'Please provide both token and type to verify' });
	}

	const tokenVerification = await firestore.collection('email_verification_tokens').where('token', '==', token).limit(1).get();
	const data = tokenVerification?.docs[0]?.data?.();

	if (type === 'email') {
		if (tokenVerification.empty || !tokenVerification.docs[0].exists) {
			res.status(400).json({ message: 'Token verification failed.' });
		}

		if (data?.verified) {
			res.status(400).json({ message: 'Token already verified' });
		}

		const tokenVerificationRef = tokenVerification.docs[0].ref;
		try {
			await tokenVerificationRef.update({
				status: VerificationStatus?.ALREADY_VERIFIED,
				verified: true
			});
		} catch (error) {
			return res.status(500).json({ message: 'Failed to update token verification status.' });
		}
	}

	return res.status(200).json({ message: 'Email verified successfully', status: true });

};

export default withErrorHandling(handler);