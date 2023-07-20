// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import generateRandomBase32 from '~src/api-utils/generateRandomBase32';
import authServiceInstance from '~src/auth/auth';
import { I2FAGenerateResponse, MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { firestore_db } from '~src/services/firebaseInit';
import { TOTP } from 'otpauth';

async function handler(
	req: NextApiRequest,
	res: NextApiResponse<I2FAGenerateResponse | MessageType>
) {
	if (req.method !== 'POST')
		return res
			.status(405)
			.json({ message: 'Invalid request method, POST required.' });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Missing user token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user)
		return res.status(400).json({ message: messages.USER_NOT_FOUND });

	const base32_secret = generateRandomBase32();

	const totp = new TOTP({
		algorithm: 'SHA1',
		digits: 6,
		issuer: 'Polkassembly',
		label: `${user.id}`,
		period: 30,
		secret: base32_secret
	});

	const otpauth_url = totp.toString();

	await firestore_db
		.collection('users')
		.doc(String(user.id))
		.update({
			two_factor_auth: {
				base32_secret: base32_secret,
				enabled: false,
				url: otpauth_url,
				verified: false
			}
		})
		.then(() => {
			return res
				.status(200)
				.json({ base32_secret: base32_secret, url: otpauth_url });
		})
		.catch((error) => {
			console.error('Error updating primary network: ', error);
			return res
				.status(500)
				.json({ message: 'Error generating two factor auth secret.' });
		});
}

export default withErrorHandling(handler);
