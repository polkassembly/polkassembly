// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { deleteKeys } from '~src/auth/redis';
import { MessageType } from '~src/auth/types';

const handler: NextApiHandler<MessageType> = async (req, res) => {
	try {
		storeApiKeyUsage(req);

		const { password } = req.query;

		if (!password || !process.env.REDIS_DELETE_PASSPHRASE || password !== process.env.REDIS_DELETE_PASSPHRASE) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const polkadotKeysPattern = 'polkadot_*';
		const kusamaKeysPattern = 'kusama_*';
		const acalaKeysPattern = 'acala_*';

		await Promise.all([deleteKeys(polkadotKeysPattern), deleteKeys(kusamaKeysPattern), deleteKeys(acalaKeysPattern)]);
		return res.status(200).json({ message: 'Success' });
	} catch (error) {
		console.log('Error: ', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
};

export default withErrorHandling(handler);
