// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { firestore_db } from '~src/services/firebaseInit';

const getDocumentData = async (network: string, documentName: string) => {
	const doc = await firestore_db.collection('networks').doc(network).get();
	return doc.exists ? doc.data()?.[documentName] : null;
};

const sumMonthlyData = (monthlyDataUSD: { [key: string]: number }, totalAssetsData: { [key: string]: number }) => {
	const summedData: { [key: string]: number } = {};

	Object.keys(monthlyDataUSD).forEach((month) => {
		summedData[month] = (monthlyDataUSD[month] || 0) + (totalAssetsData[month] || 0);
	});

	return summedData;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	const network = req.headers['x-network'] as string;

	if (!network) {
		return res.status(400).json({ error: 'Missing or invalid network in request headers' });
	}

	try {
		const monthlyDataUSD = await getDocumentData(network, 'monthly_treasury_tally_USD');
		const totalAssetsData = await getDocumentData(network, 'total_assets_data');

		if (!monthlyDataUSD || !totalAssetsData) {
			return res.status(404).json({ error: 'Data not found' });
		}

		const summedData = sumMonthlyData(monthlyDataUSD, totalAssetsData);

		return res.status(200).json(summedData);
	} catch (error) {
		console.error('Error fetching or processing data:', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
};

export default withErrorHandling(handler);
