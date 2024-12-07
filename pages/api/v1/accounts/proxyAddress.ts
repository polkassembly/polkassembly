// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { SUBSCAN_API_HEADERS } from '../subscanApi';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import messages from '~src/auth/utils/messages';
import { isValidNetwork } from '~src/api-utils';
export interface ProxyAddressResponse {
	data: {
		proxyAddress: string;
	};
	error?: string | undefined;
}

const onChainProxy = async (address: string, network: string) => {
	try {
		const eventResponse = await fetch(`https://${network}.api.subscan.io/api/v2/scan/events`, {
			method: 'POST',
			headers: SUBSCAN_API_HEADERS,
			body: JSON.stringify({
				row: 1,
				page: 0,
				module: 'proxy',
				event_id: 'PureCreated',
				address: address
			})
		});

		const eventData = await eventResponse.json();

		if (eventData.data?.count === 0) {
			return null;
		}

		const eventIndex = eventData.data?.events[0]?.event_index;
		if (!eventIndex) {
			return null;
		}

		const proxyResponse = await fetch(`https://${network}.api.subscan.io/api/scan/event`, {
			method: 'POST',
			headers: SUBSCAN_API_HEADERS,
			body: JSON.stringify({
				event_index: eventIndex
			})
		});

		const proxyData = await proxyResponse.json();

		const params = proxyData.data?.params;
		return params?.find((param: any) => param.name === 'pure')?.value || null;
	} catch (err) {
		console.log('Error in onChainProxy:', err);
		return null;
	}
};

const handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}
	storeApiKeyUsage(req);
	const { address } = req.body;
	const network = String(req.headers['x-network']);

	if (!network || !isValidNetwork(network)) {
		return res.status(400).json({ message: messages.INVALID_NETWORK });
	}

	if (!address) {
		return res.status(400).json({ error: 'Address is required' });
	}

	try {
		const proxyAddress = await onChainProxy(address, network);

		if (!proxyAddress) {
			return res.status(404).json({ error: 'Proxy address not found' });
		}

		return res.status(200).json({ proxyAddress });
	} catch (err) {
		console.error('Error in API handler:', err);
		return res.status(500).json({ error: 'Internal server error' });
	}
};
export default withErrorHandling(handler);
