// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import { SUBSCAN_API_HEADERS } from '../subscanApi';

export const onChainProxy = async (address: string, network: string) => {
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
		console.log('Error in getAccountOnChainMultisigs:', err);
		return null;
	}
};
