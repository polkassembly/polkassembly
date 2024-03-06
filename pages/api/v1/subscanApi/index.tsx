// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { getCache, setCache } from '~src/api-utils/subscanCachedData';
import { generateKey } from '~src/util/getRedisKeys';

export const SUBSCAN_API_KEY = '74d1845ab15f4b889a64dfef074ef222';

export const SUBSCAN_API_HEADERS = {
	Accept: 'application/json',
	'Content-Type': 'application/json',
	'X-API-Key': SUBSCAN_API_KEY
};

export const getSubscanData = async (url: string, body?: any, headers?: any, method?: string) => {
	try {
		const data = await (
			await fetch(url, {
				body: body ? JSON.stringify(body) : '',
				headers: headers || SUBSCAN_API_HEADERS,
				method: method || 'POST'
			})
		).json();

		return data;
	} catch (error) {
		return error;
	}
};

const handler: NextApiHandler<{ data: any } | { error: string | null }> = async (req, res) => {
	storeApiKeyUsage(req);

	const { keys, url, body, method, headers, cacheEnabled = true, hardReload = false, expiry } = req.body;

	const network = String(req.headers['x-network']);
	if (!url) {
		return res.status(400).json({ data: null, error: 'Invalid params' });
	}
	if (!network || !isValidNetwork(network)) {
		return res.status(400).json({ data: null, error: 'Invalid network in request header' });
	}

	const redisKey = generateKey({ ...keys });

	if (cacheEnabled && getCache(redisKey) !== undefined && !hardReload) {
		const redisData = await getCache(redisKey);
		res.status(200).json(redisData.data);
		return;
	}

	const data = await getSubscanData(url, body, headers, method);

	if (cacheEnabled) setCache(redisKey, data.data, expiry);

	if (data.message === 'Success') {
		res.status(200).json(data.data);
	} else {
		res.status(400).json(data.message);
	}
};

export default withErrorHandling(handler);
