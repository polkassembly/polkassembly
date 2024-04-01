// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { getCache, setCache } from '~src/api-utils/subscanCachedData';
import { generateKey } from '~src/util/getRedisKeys';

export const SUBSCAN_API_KEY = process.env.NEXT_PUBLIC_SUBSCAN_API_KEY || '';

export const SUBSCAN_API_HEADERS = {
	Accept: 'application/json',
	'Content-Type': 'application/json',
	'X-API-Key': SUBSCAN_API_KEY
};

const validateURL = (url: string) => {
	if (url.includes('../') || url.includes('//')) return false;
	return true;
};

export const getSubscanData = async (url: string, network: string, body?: any, method?: string) => {
	try {
		const redisKey = generateKey({ keyType: 'subscan', network, url });

		const cacheEnabled = process.env.NEXT_PUBLIC_SUBSCAN_CACHE_ENABLED;

		const redisData = await getCache(redisKey);

		if (redisData) {
			return redisData;
		}

		const filteredUrl = url.charAt(0) === '/' ? url.substring(1) : url;

		const validURL = new URL(`https://${network}.api.subscan.io/${filteredUrl}`);
		const data = await (
			await fetch(validURL, {
				body: body && JSON.stringify(body),
				headers: SUBSCAN_API_HEADERS,
				method: method || 'POST'
			})
		).json();

		if (data?.message === 'Success' && cacheEnabled) {
			setCache(redisKey, data);
		}

		return data;
	} catch (error) {
		return error;
	}
};

const handler: NextApiHandler<{ data: any } | { error: string | null }> = async (req, res) => {
	storeApiKeyUsage(req);

	const { url, body, method } = req.body;

	const network = String(req.headers['x-network']);
	if (!url || !validateURL(url)) {
		return res.status(400).json({ data: null, error: 'Invalid URL passed' });
	}
	if (!network || !isValidNetwork(network)) {
		return res.status(400).json({ data: null, error: 'Invalid network in request header' });
	}

	if (body && (typeof body !== 'object' || Array.isArray(body))) {
		return res.status(400).json({ data: null, error: 'Invalid Body params passed' });
	}

	const data = await getSubscanData(url, network, body, method);

	if (data.message === 'Success') {
		res.status(200).json({ data });
	} else {
		res.status(400).json({ error: data.message });
	}
};

export default withErrorHandling(handler);
