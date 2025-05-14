// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import authServiceInstance from '~src/auth/auth';

interface Props {
	email: string;
	password: string;
	username: string;
	web3signup: boolean;
	custom_username: boolean;
}

const handler: NextApiHandler<any | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);
	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const { email, password, username, web3signup, custom_username } = req.body as Props;

	if (!email || !password || !username || !custom_username) return res.status(400).json({ message: 'Invalid params' });

	await authServiceInstance.createUser(email, password, username, web3signup, network, custom_username);

	return res.status(200).json({ message: 'User created successfully' });
};
export default withErrorHandling(handler);
