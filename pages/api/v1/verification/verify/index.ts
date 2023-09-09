// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType } from '~src/auth/types';
import firebaseAdmin from '~src/services/firebaseInit';
import { VerificationStatus } from '..';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';

export interface IVerifyResponse {
	status: boolean;
}

const firestore = firebaseAdmin.firestore();

const handler: NextApiHandler<IVerifyResponse | MessageType> = async (req, res) => {
	const { token, type } = req.query;
	if (!token) {
		throw apiErrorWithStatusCode('Please provide a token to verify', 400);
	}

	const tokenVerification = await firestore.collection('email_verification_tokens').where('token', '==', token).limit(1).get();
	const data = tokenVerification?.docs[0]?.data?.();

	if (type == 'email') {
		if (tokenVerification.empty || !tokenVerification.docs[0].exists) {
			throw apiErrorWithStatusCode('Token verification failed.', 400);
		}

		if (data?.verified) {
			throw apiErrorWithStatusCode('Token already verified.', 400);
		}

		const tokenVerificationRef = tokenVerification.docs[0].ref;

		await tokenVerificationRef.update({
			status: VerificationStatus?.ALREADY_VERIFIED,
			verified: true
		});

	}

	return res.status(200).json({ message: 'Email verified successfully', status: true });

};

export default withErrorHandling(handler);