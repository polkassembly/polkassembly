// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { SubscanAPIResponseType } from '~src/auth/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

export const SUBSCAN_API_KEY = '74d1845ab15f4b889a64dfef074ef222';

export const SUBSCAN_API_HEADERS = {
	Accept: 'application/json',
	'Content-Type': 'application/json',
	'X-API-Key': SUBSCAN_API_KEY
};

export const getOnChainAddressDetails = async (address: string | string[] | undefined) => {
	try {
		const { data, error } = await nextApiClientFetch<SubscanAPIResponseType>('api/v1/subscanApi', {
			body: {
				key: address,
				row: 1
			},
			url: '/api/v2/scan/search'
		});
		if (error || !data) {
			console.log('error fetching events : ', error);
		}
		if (data) {
			return data;
		}
	} catch (error) {
		return error;
	}
};

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

	const data = await getOnChainAddressDetails(address);

	if (data.message === 'Success') {
		res.status(200).json(data.data);
	} else {
		res.status(400).json(data.message);
	}
};

export default withErrorHandling(handler);
