// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import messages from '~src/auth/utils/messages';
import { firestore_db } from '~src/services/firebaseInit';

const getDocumentData = async (network: string, documentName: string) => {
	try {
		const doc = await firestore_db.collection('networks').doc(network).get();
		if (doc.exists) {
			return doc.data()?.[documentName];
		} else {
			return null;
		}
	} catch (error) {
		console.error('Error fetching document ', error);
		return null;
	}
};

const sumMonthlyData = (monthlyDataUSD: { [key: string]: string }, totalAssetsData: { [key: string]: string }) => {
	const summedData: { [key: string]: string } = {};

	Object.keys(monthlyDataUSD).forEach((month) => {
		const monthlyValue = new BN(monthlyDataUSD[month] || '0');
		const assetsValue = new BN(totalAssetsData[month] || '0');
		summedData[month] = monthlyValue.add(assetsValue).toString();
	});

	return summedData;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	storeApiKeyUsage(req);
	const network = req.headers['x-network'] as string;

	if (!network) {
		return res.status(400).json({ error: messages.INVALID_NETWORK });
	}

	try {
		const monthlyDataUSD = await getDocumentData(network, 'monthly_treasury_tally_USD');
		const totalAssetsData = await getDocumentData(network, 'total_assets_data');

		if (!monthlyDataUSD || !totalAssetsData) {
			return res.status(404).json({ error: messages.API_FETCH_ERROR });
		}

		const summedData = sumMonthlyData(monthlyDataUSD, totalAssetsData);

		return res.status(200).json(summedData);
	} catch (error) {
		console.error('Error fetching or processing data:', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
};

export default withErrorHandling(handler);
