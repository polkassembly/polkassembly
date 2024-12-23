// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import { firestore_db } from '~src/services/firebaseInit';
import messages from '~src/auth/utils/messages';
import { MessageType } from '~src/auth/types';
import getEncodedAddress from '~src/util/getEncodedAddress';

export const getDelegationMandate = async (network: string, address: number) => {
	try {
		const encodedAddr = getEncodedAddress(address, network) || address;
		const paDelegatesSnapshot = await firestore_db.collection('networks').doc(network).collection('pa_delegates').where('address', '==', encodedAddr).limit(1).get();
		if (!paDelegatesSnapshot.empty && !!paDelegatesSnapshot?.docs?.[0]) {
			const data = paDelegatesSnapshot?.docs?.[0]?.data();
			return {
				data: { delegationMandate: data?.bio || '' },
				error: null
			};
		}
		return {
			data: null,
			error: `User with address ${address} is not a Polkassembly delegate`
		};
	} catch (err) {
		return {
			data: null,
			error: `User with address ${address} is not a Polkassembly delegate`
		};
	}
};

async function handler(req: NextApiRequest, res: NextApiResponse<{ delegationMandate: string } | MessageType>) {
	storeApiKeyUsage(req);

	const { address } = req.body;

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

	if (!address) return res.status(500).json({ message: messages.INVALID_PARAMS });

	const { data, error } = await getDelegationMandate(network, address);
	if (data) {
		return res.status(200).json(data);
	}
	return res.status(500).json({ message: error || messages.API_FETCH_ERROR });
}

export default withErrorHandling(handler);
