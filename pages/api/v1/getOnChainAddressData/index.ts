// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';

export const SUBSCAN_API_KEY = '056b677410ac226bea971a3e03de66fa';

export const SUBSCAN_API_HEADERS = {
	'Accept': 'application/json',
	'Content-Type': 'application/json',
	'X-API-Key': SUBSCAN_API_KEY
};

export const getOnChainAddressDetails = async (address: string | string[] | undefined, network: string | string[] | undefined) => {
	try {
		const data = await (await fetch(`https://${network}.api.subscan.io/api/v2/scan/search`, {
			body: JSON.stringify({
				'key': address,
				'row': 1
			}),
			headers: SUBSCAN_API_HEADERS,
			method: 'POST'
		})).json();

		return data;
	} catch (error) {
		return error;
	}
};

const handler: NextApiHandler<{ data: any } | { error: string | null }> = async (req, res) => {
	const { address } = req.body;

	const network = String(req.headers['x-network']);
	if (!address) res.status(400).json({ data: null, error: 'Invalid params' });
	if (!network || !isValidNetwork(network)) res.status(400).json({ data: null, error: 'Invalid network in request header' });

	const data = await getOnChainAddressDetails(address, network);

	if (data.message === 'Success') {
		res.status(200).json(data.data);
	} else {
		res.status(400).json(data.message);
	}
};

export default withErrorHandling(handler);