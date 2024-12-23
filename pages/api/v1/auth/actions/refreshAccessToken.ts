// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import authServiceInstance from '~src/auth/auth';
import { MessageType, IAuthResponse, IRefreshTokenPayload } from '~src/auth/types';
import getRefreshTokenSerializedCookie from '~src/api-utils/getRefreshTokenSerializedCookie';
import getUserIdFromJWT from '~src/auth/utils/getUserIdFromJWT';
import getUserFromUserId from '~src/auth/utils/getUserFromUserId';
import { decode } from 'jsonwebtoken';

async function handler(req: NextApiRequest, res: NextApiResponse<IAuthResponse | MessageType>) {
	storeApiKeyUsage(req);

	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	// read refresh_token from cookies
	const refresh_token = req.cookies?.refresh_token || '';

	if (!refresh_token) return res.status(400).json({ message: 'Invalid request.' });

	// verify if refresh_token is valid
	const refreshTokenPublicKey = process.env.REFRESH_TOKEN_PUBLIC_KEY?.replace(/\\n/gm, '\n');

	const id = getUserIdFromJWT(refresh_token, refreshTokenPublicKey);

	// not valid
	if (!id) return res.status(401).json({ message: 'Invalid request. Please login again.' });

	// if valid -> get new access token and a new refresh_token
	const decodedRefreshToken = decode(refresh_token) as IRefreshTokenPayload;

	const user = await getUserFromUserId(id);
	const newAccessToken = await authServiceInstance.getSignedToken({
		...user,
		login_address: decodedRefreshToken.login_address,
		login_wallet: decodedRefreshToken.login_wallet
	});

	const newRefreshToken = await authServiceInstance.getRefreshToken({
		login_address: decodedRefreshToken.login_address,
		login_wallet: decodedRefreshToken.login_wallet,
		user_id: id
	});

	// send access token as response and send refresh token in cookie

	if (!newAccessToken || !newRefreshToken) return res.status(401).json({ message: 'Something went wrong. Please try again.' });

	res.setHeader('Set-Cookie', getRefreshTokenSerializedCookie(newRefreshToken));

	return res.status(200).json({ token: newAccessToken });
}

export default withErrorHandling(handler);
