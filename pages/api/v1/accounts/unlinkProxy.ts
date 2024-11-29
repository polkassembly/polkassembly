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

		const { address, linked_address, type } = req.body;
		if (!address || !linked_address) {
			return res.status(400).json({ error: 'Missing required fields' });
		}

		const documentId = type ? `${address}_${type}_${user.id}` : `${address}_${user.id}`;
		const docRef = firestore_db.collection('proxies').doc(documentId);
		const docSnapshot = await docRef.get();

		if (!docSnapshot.exists) {
			return res.status(404).json({ error: 'Document not found' });
		}

		const data = docSnapshot.data();
		const linkedAddresses = data?.linked_address || [];

		if (!linkedAddresses.includes(linked_address)) {
			return res.status(400).json({ error: 'Address not linked to this key' });
		}

		const updatedLinkedAddresses = linkedAddresses.filter((addr: string) => addr !== linked_address);

		if (updatedLinkedAddresses.length === 0) {
			await docRef.delete();
			return res.status(200).json({ message: 'Key deleted successfully' });
		} else {
			await docRef.update({
				linked_address: updatedLinkedAddresses,
				updated_at: new Date()
			});
			return res.status(200).json({ message: 'Address unlinked successfully', linked_address: updatedLinkedAddresses });
		}
	} catch (error) {
		console.error('Error unlinking address:', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
}

export default withErrorHandling(handler);
