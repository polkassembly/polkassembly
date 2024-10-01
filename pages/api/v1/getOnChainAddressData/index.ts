// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { getSubscanData } from '../subscanApi';
import { isSubscanSupport } from '~src/util/subscanCheck';

const handler: NextApiHandler<{ data: any } | { error: string | null }> = async (req, res) => {
	storeApiKeyUsage(req);

	const { address } = req.body;

	const network = String(req.headers['x-network']);
	if (!address) {
		return res.status(400).json({ data: null, error: 'Invalid params' });
	}
	if (!network || !isValidNetwork(network)) {
		return res.status(400).json({ data: null, error: 'Invalid network in request header' });
	}

	if (!isSubscanSupport(network)) {
		return res.status(200).json(address);
	}

	const data = await getSubscanData('/api/v2/scan/search', network, {
		key: address,
		row: 1
	});

	if (data.message === 'Success') {
		return res.status(200).json(data.data);
	} else {
		return res.status(400).json(data.message);
	}
};

export default withErrorHandling(handler);
