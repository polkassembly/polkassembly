// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import authServiceInstance from '~src/auth/auth';
import { IUser2FADetails, MessageType, TokenType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { firestore_db } from '~src/services/firebaseInit';
import { TOTP } from 'otpauth';

async function handler(req: NextApiRequest, res: NextApiResponse<TokenType | MessageType>) {
	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const { authCode = null } = req.body;
	if (isNaN(authCode)) return res.status(400).json({ message: 'Invalid auth code in request body.' });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Missing user token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user) return res.status(400).json({ message: messages.USER_NOT_FOUND });

	if(!user.two_factor_auth?.base32_secret) return res.status(400).json({ message: messages.TWO_FACTOR_AUTH_NOT_INIT });

	const totp = new TOTP({
		algorithm: 'SHA1',
		digits: 6,
		issuer: 'Polkassembly',
		label: `${user.id}`,
		period: 30,
		secret: user.two_factor_auth?.base32_secret
	});

	const isValidToken = totp.validate({ token: String(authCode).replaceAll(/\s/g,'') }) !== null;
	if(!isValidToken) return res.status(400).json({ message: messages.TWO_FACTOR_AUTH_INVALID_TOKEN });

	const newUser2FADetails : IUser2FADetails = {
		...(user.two_factor_auth || {}),
		enabled: true,
		verified: true
	};

	await firestore_db
		.collection('users')
		.doc(String(user.id))
		.update({ two_factor_auth : newUser2FADetails })
		.catch((error) => {
			console.error('Error verifying 2FA : ', error);
			return res.status(500).json({ message: 'Error verifying two factor auth code.' });
		});

	const newUser = {
		...user,
		two_factor_auth: newUser2FADetails
	};

	const updatedJWT = await authServiceInstance.getSignedToken(newUser);

	return res.status(200).json({ token: updatedJWT });

}

export default withErrorHandling(handler);
