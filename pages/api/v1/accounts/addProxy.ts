// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import authServiceInstance from '~src/auth/auth';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { firestore_db } from '~src/services/firebaseInit';
import { LinkProxyType } from '~src/types';

interface ProxyDocument {
	address: string;
	network: string;
	name: string;
	type: LinkProxyType | null;
	user_id: number;
	verified: boolean;
	linked_address: string[];
	created_at?: Date;
	updated_at?: Date;
}

async function updateProxyDocument(
	data: ProxyDocument & { linked_address?: string; network: string; user_id: number; verified: boolean },
	network: string,
	token: string
): Promise<{ id: string; message: string }> {
	const { address, name = 'unknown', type, linked_address } = data;

	if (!address || !network || !type) {
		throw new Error('Missing required fields');
	}

	if (type && !Object.values(LinkProxyType).includes(type as LinkProxyType)) {
		throw new Error(`Invalid type. Allowed values are ${Object.values(LinkProxyType).join(', ')}`);
	}

	const user = await authServiceInstance.GetUser(token);
	if (!user) {
		throw new Error(messages.USER_NOT_FOUND);
	}

	const documentId = `${address}_${type}_${user.id}`;
	const docRef = firestore_db.collection('proxies').doc(documentId);

	const docSnapshot = await docRef.get();
	let currentLinkedAddress: string[] = [];

	if (docSnapshot.exists) {
		const data = docSnapshot.data();
		currentLinkedAddress = data?.linked_address || [];
	}

	if (linked_address && !currentLinkedAddress.includes(linked_address)) {
		currentLinkedAddress.push(linked_address);
	}

	const newDocument: ProxyDocument = {
		address,
		created_at: docSnapshot.exists ? docSnapshot.data()?.created_at : new Date(),
		linked_address: currentLinkedAddress,
		name,
		network,
		type: (type as LinkProxyType) || null,
		updated_at: new Date(),
		user_id: user.id,
		verified: false
	};

	await docRef.set(newDocument, { merge: true });

	return { id: documentId, message: 'Document updated successfully' };
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
	storeApiKeyUsage(req);

	try {
		const token = getTokenFromReq(req);
		if (!token) {
			return res.status(401).json({ message: 'Missing user token' });
		}

		const { address, name, type, linked_address } = req.body;

		const network = String(req.headers['x-network']);

		if (!network || !isValidNetwork(network)) {
			return res.status(400).json({ message: messages.INVALID_NETWORK });
		}

		const user = await authServiceInstance.GetUser(token);
		if (!user) {
			return res.status(400).json({ message: messages.USER_NOT_FOUND });
		}

		const result = await updateProxyDocument({ address, name, type, linked_address, network, user_id: user.id, verified: false }, network, token);
		return res.status(201).json(result);
	} catch (error) {
		console.error('Error updating document:', error);
		return res.status(500).json({ error: error.message || 'Internal Server Error' });
	}
}

export default withErrorHandling(handler);
