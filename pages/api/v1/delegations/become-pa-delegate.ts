// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { isAddress } from 'ethers';
import { IDelegate } from '~src/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import authServiceInstance from '~src/auth/auth';
import * as admin from 'firebase-admin';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';

const firestore_db = admin.firestore();

async function handler(req: NextApiRequest, res: NextApiResponse<IDelegate | MessageType>) {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user) return res.status(403).json({ message: messages.UNAUTHORISED });

	const { address, username, bio, isNovaWalletDelegate, userId } = req.body;

	if (!address || !username.length || !bio.length || isNaN(userId)) return res.status(400).json({ message: messages.INVALID_PARAMS });
	if (!(getEncodedAddress(String(address), network) || isAddress(String(address)))) return res.status(400).json({ message: 'Invalid address' });

	const encodedAddress = getEncodedAddress(address, network);
	const PADelegateDoc = firestore_db.collection('networks').doc(network).collection('pa_delegates').doc(String(userId));
	const newDelegate: any = {
		address: encodedAddress || address,
		bio: bio || '',
		created_at: new Date(),
		dataSource: 'polkassembly',
		isNovaWalletDelegate: isNovaWalletDelegate || false,
		name: username,
		user_id: userId
	};

	await PADelegateDoc.update(newDelegate, { merge: true })
		.then(() => {
			return res.status(200).json({ message: messages.SUCCESS });
		})
		.catch((error) => {
			return res.status(500).json({ message: error || messages.ERROR_IN_ADDING_EVENT });
		});
}

export default withErrorHandling(handler);
