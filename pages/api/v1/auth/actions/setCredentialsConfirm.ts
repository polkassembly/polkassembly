// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import authServiceInstance from '~src/auth/auth';
import { ChangeResponseType, MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import isValidEmail from '~src/auth/utils/isValidEmail';
import isValidPassowrd from '~src/auth/utils/isValidPassowrd';
import isValidUsername from '~src/auth/utils/isValidUsername';
import messages from '~src/auth/utils/messages';

async function handler(
	req: NextApiRequest,
	res: NextApiResponse<ChangeResponseType | MessageType>,
) {
	if (req.method !== 'POST')
		return res
			.status(405)
			.json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network))
		res.status(400).json({ message: 'Invalid network in request header' });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Invalid token' });

	const body = JSON.parse(req.body);
	const { address, email, password, signature, username } = body;
	if (!body || !address || !email || !password || !signature || !username)
		return res
			.status(400)
			.json({ message: 'Missing parameters in request body' });

	if (!isValidUsername(username))
		return res
			.status(400)
			.json({ message: messages.USERNAME_INVALID_ERROR });
	if (!isValidPassowrd(password))
		return res
			.status(400)
			.json({ message: messages.PASSWORD_LENGTH_ERROR });
	if (email && !isValidEmail(email))
		return res.status(400).json({ message: messages.INVALID_EMAIL });

	const updatedJWT = await authServiceInstance.SetCredentialsConfirm(
		address,
		email,
		password,
		signature,
		username,
		network,
	);

	return res.status(200).json({
		message: messages.CREDENTIALS_CHANGE_SUCCESSFUL,
		token: updatedJWT,
	});
}

export default withErrorHandling(handler);
