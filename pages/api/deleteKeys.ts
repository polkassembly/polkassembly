// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { deleteKeys, redisDel } from '~src/auth/redis';
import { MessageType } from '~src/auth/types';

const handler: NextApiHandler<MessageType> = async (req, res) => {
	try {
		storeApiKeyUsage(req);

		const { network, postId, postType, password } = req.query;

		if (!network || !String(postId) || !postType || !password) {
			return res.status(400).json({ message: 'Invalid parameters' });
		}

		if (!isValidNetwork(String(network))) {
			return res.status(400).json({ message: 'Invalid network' });
		}

		if (!password || !process.env.REDIS_DELETE_PASSPHRASE || password !== process.env.REDIS_DELETE_PASSPHRASE) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const postDetail = `${network}_${postType}_postId_${postId}`;
		const listingKeys = `${network}_${postType}_page_*`;
		const latestActivityKey = `${network}_latestActivity_OpenGov`;

		await redisDel(postDetail);
		await redisDel(latestActivityKey);
		await deleteKeys(listingKeys);

		return res.status(200).json({ message: 'Success' });
	} catch (error) {
		console.log('Error: ', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
};

export default withErrorHandling(handler);
