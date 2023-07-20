// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import authServiceInstance from '~src/auth/auth';
import { MessageType, TokenType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import firebaseAdmin, { firestore_db } from '~src/services/firebaseInit';

async function handler(
	req: NextApiRequest,
	res: NextApiResponse<TokenType | MessageType>,
) {
	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Missing user token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user)
		return res.status(400).json({ message: messages.USER_NOT_FOUND });

	if (!user.two_factor_auth?.base32_secret)
		return res
			.status(400)
			.json({ message: messages.TWO_FACTOR_AUTH_NOT_INIT });

	await firestore_db
		.collection('users')
		.doc(String(user.id))
		.update({
			two_factor_auth: firebaseAdmin.firestore.FieldValue.delete(),
		})
		.catch((error) => {
			console.error('Error disabling 2FA : ', error);
			return res.status(500).json({
				message: 'Error disabling two factor authentication.',
			});
		});

	const newUser = { ...user };
	delete newUser.two_factor_auth;

	const updatedJWT = await authServiceInstance.getSignedToken(newUser);

	return res.status(200).json({ token: updatedJWT });
}

export default withErrorHandling(handler);
