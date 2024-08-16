// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import messages from '~src/auth/utils/messages';
import { MessageType } from '~src/auth/types';
import getEncodedAddress from '~src/util/getEncodedAddress';
import w3fDelegatesKusama from './w3f-delegates-kusama.json';
import w3fDelegatesPolkadot from './w3f-delegates-polkadot.json';

export const getW3fDelegateCheck = async (network: string, addresses: string[]) => {
	try {
		const encodedAddresses = addresses?.map((addr) => getEncodedAddress(addr, network) || addr);

		const w3fDelegates = network === 'polkadot' ? w3fDelegatesPolkadot : w3fDelegatesKusama;

		const delegate = w3fDelegates?.filter((delegate) => encodedAddresses.includes(getEncodedAddress(delegate?.address, network) || delegate.address));
		return { data: { isW3fDelegate: !!delegate.length } || false, error: null };
	} catch (err) {
		return { data: null, error: err || messages.API_FETCH_ERROR };
	}
};

async function handler(req: NextApiRequest, res: NextApiResponse<{ isW3fDelegate: boolean } | MessageType>) {
	storeApiKeyUsage(req);

	const { addresses } = req.body;

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

	if (!addresses?.length) return res.status(500).json({ message: messages.INVALID_PARAMS });

	const { data, error } = await getW3fDelegateCheck(network, addresses);
	if (data) {
		return res.status(200).json(data);
	}
	return res.status(500).json({ message: error || messages.API_FETCH_ERROR });
}

export default withErrorHandling(handler);
