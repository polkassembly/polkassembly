// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType, IVerified } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import { firestore_db } from '~src/services/firebaseInit';
import getSubstrateAddress from '~src/util/getSubstrateAddress';

async function handler(req: NextApiRequest, res: NextApiResponse<IVerified | MessageType>) {
	storeApiKeyUsage(req);

	const { address } = req.body;

	if (!address) return res.status(400).json({ message: 'Missing parameters' });

	const substrateAddress = getSubstrateAddress(String(address));
	if (!substrateAddress) return res.status(400).json({ message: messages.INVALID_ADDRESS });

	const isVerifiedAddress = (await firestore_db.collection('addresses').where('address', '==', substrateAddress).where('verified', '==', true).limit(1).get()).docs.length > 0;
	if (isVerifiedAddress) return res.status(200).json({ verified: true });

	return res.status(200).json({ verified: false });
}

export default withErrorHandling(handler);
