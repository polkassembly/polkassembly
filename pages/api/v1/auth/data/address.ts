// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType, PublicAddress } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import { firestore_db } from '~src/services/firebaseInit';
import getSubstrateAddress from '~src/util/getSubstrateAddress';

async function handler(req: NextApiRequest, res: NextApiResponse<PublicAddress | MessageType>) {
	storeApiKeyUsage(req);

	const { address } = req.query;

	if (!address) return res.status(400).json({ message: 'Missing address parameter in url.' });

	const substrateAddress = getSubstrateAddress(String(address));
	if (!substrateAddress) return res.status(400).json({ message: messages.INVALID_ADDRESS });

	const addressDoc = (await firestore_db.collection('addresses').where('address', '==', substrateAddress).limit(1).get()).docs[0];

	if (!addressDoc) return res.status(400).json({ message: messages.ADDRESS_NOT_FOUND });

	const addressData = addressDoc.data();

	const publicAddress: PublicAddress = {
		address: substrateAddress,
		default: Boolean(addressData.default) || false,
		isMultisig: Boolean(addressData.isMultisig) || false,
		is_erc20: Boolean(addressData.is_erc20) || substrateAddress.startsWith('0x'),
		network: addressData.network || '',
		proxy_for: addressData.proxy_for || [],
		public_key: addressData.public_key || '',
		verified: Boolean(addressData.verified) || false,
		wallet: addressData.wallet || ''
	};

	return res.status(200).json(publicAddress);
}

export default withErrorHandling(handler);
