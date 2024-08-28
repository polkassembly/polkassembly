// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import messages from '~src/auth/utils/messages';
import { firestore_db } from '~src/services/firebaseInit';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	storeApiKeyUsage(req);
	try {
		const network = req.headers['x-network'] as string;

		if (!network) {
			return res.status(400).json({ error: messages.INVALID_NETWORK });
		}

		// const network = 'polkadot';

		const networkDoc = await firestore_db.collection('networks').doc(network).get();

		if (!networkDoc.exists) {
			return res.status(404).json({ error: `No data found for network: ${network}` });
		}

		const treasuryData = networkDoc.data()?.total_treasury_tally_USD;

		if (!treasuryData) {
			return res.status(404).json({ error: 'No treasury data found' });
		}

		return res.status(200).json({ data: treasuryData });
	} catch (error) {
		console.error('Error fetching treasury data:', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
};

export default withErrorHandling(handler);
