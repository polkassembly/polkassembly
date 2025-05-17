// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import authServiceInstance from '~src/auth/auth';

interface IV1User {
	id: number;
	custom_username: boolean;
	email: string;
	password: string;
	salt: string;
	username: string;
	web3_signup: boolean;
}

const handler: NextApiHandler<any | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);
	const network = String(req.headers['x-network']);
	const toolsPassphrase = String(req.headers['x-tools-passphrase']);

	if (toolsPassphrase !== process.env.TOOLS_PASSPHRASE) return res.status(401).json({ message: 'Unauthorized' });
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const { id, custom_username = false, email = '', password = '', salt = '', username = '', web3_signup = false } = req.body as IV1User;

	if (!id || !password || !username || !salt) return res.status(400).json({ message: 'Invalid params' });

	await authServiceInstance.createUser(email, password, username, web3_signup, network, custom_username, salt, id);

	return res.status(200).json({ message: 'User created successfully' });
};
export default withErrorHandling(handler);
