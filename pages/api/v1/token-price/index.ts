// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import * as admin from 'firebase-admin';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import messages from '~src/auth/utils/messages';
import { isValidNetwork } from '~src/api-utils';

if (!admin.apps.length) {
	admin.initializeApp({
		credential: admin.credential.applicationDefault()
	});
}

const firestoreDB = admin.firestore();

interface FetchTokenPriceResponse {
	data: {
		price: string;
		last_fetched_at: Date;
	} | null;
	error: string | null;
	status: number;
}

export const fetchTokenPriceFromDB = async ({ network }: { network: string }): Promise<FetchTokenPriceResponse> => {
	try {
		const networkDocRef = firestoreDB.collection('networks').doc(network.toLowerCase());
		const networkDocSnapshot = await networkDocRef.get();

		if (!networkDocSnapshot.exists) {
			return {
				data: null,
				error: `No data found for network: ${network}`,
				status: 404
			};
		}

		const tokenPriceData = networkDocSnapshot.get('token_price');

		if (!tokenPriceData || !tokenPriceData.value || !tokenPriceData.last_fetched_at) {
			return {
				data: null,
				error: `Token price not available for network: ${network}`,
				status: 404
			};
		}

		return {
			data: { price: tokenPriceData.value, last_fetched_at: tokenPriceData.last_fetched_at.toDate() },
			error: null,
			status: 200
		};
	} catch (error) {
		console.error('Error fetching token price from Firestore:', error);
		return {
			data: null,
			error: error.message || messages.API_FETCH_ERROR,
			status: 500
		};
	}
};

const handler: NextApiHandler = async (req, res) => {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);

	if (!network || !isValidNetwork(network)) {
		return res.status(400).json({ message: messages.INVALID_NETWORK });
	}

	const { data, error, status } = await fetchTokenPriceFromDB({ network });

	if (error || !data) {
		return res.status(status).json({ message: error || messages.API_FETCH_ERROR });
	} else {
		return res.status(status).json(data);
	}
};

export default withErrorHandling(handler);
