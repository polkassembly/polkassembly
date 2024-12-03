// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import authServiceInstance from '~src/auth/auth';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import { firestore_db } from '~src/services/firebaseInit';

async function handler(req: NextApiRequest, res: NextApiResponse) {
	storeApiKeyUsage(req);

	try {
		if (req.method !== 'POST') {
			return res.status(405).json({ error: 'Method not allowed' });
		}

		const token = getTokenFromReq(req);
		if (!token) {
			return res.status(401).json({ error: 'Unauthorized' });
		}

		const user = await authServiceInstance.GetUser(token);
		if (!user) {
			return res.status(401).json({ error: 'User not found' });
		}

		const { address, linked_addresses } = req.body;

		if (!address || !Array.isArray(linked_addresses) || linked_addresses.length === 0) {
			return res.status(400).json({ error: 'Missing required fields or invalid data' });
		}

		const response: { linked_address: string; is_linked: boolean }[] = [];
		await Promise.all(
			linked_addresses.map(async ({ linked_address, type }) => {
				if (!linked_address || !type) {
					response.push({ linked_address, is_linked: false });
					return;
				}

				const documentId = `${address}_${type}_${user.id}`;
				const docRef = firestore_db.collection('proxies').doc(documentId);
				const docSnapshot = await docRef.get();

				if (!docSnapshot.exists) {
					response.push({ linked_address, is_linked: false });
					return;
				}

				const data = docSnapshot.data();
				const existingLinkedAddresses = data?.linked_address || [];

				if (existingLinkedAddresses.includes(linked_address)) {
					response.push({ linked_address, is_linked: true });
				} else {
					response.push({ linked_address, is_linked: false });
				}
			})
		);

		return res.status(200).json({ data: response });
	} catch (error) {
		console.error('Error checking address linkage:', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
}

export default withErrorHandling(handler);
