// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { firestore_db } from '~src/services/firebaseInit';
import { IApiResponse } from '~src/types';
import messages from '~src/util/messages';

interface IGetTreasuryHistoryParams {
	network: string;
}

interface IDailyTreasuryTally {
	created_at: string;
	balance: string;
}

export async function getDailyTreasuryTally(params: IGetTreasuryHistoryParams): Promise<IApiResponse<IDailyTreasuryTally>> {
	try {
		const { network } = params;

		const networkDocRef = firestore_db.collection('networks').doc(network);
		const doc = await networkDocRef.get();

		if (!doc.exists) {
			return {
				data: null,
				error: `No data found for network: ${network}`,
				status: 404
			};
		}

		const data = doc.data();
		const dailyTreasuryTally = data ? data['daily_treasury_tally'] : null;

		if (!dailyTreasuryTally) {
			return {
				data: null,
				error: `No treasury history found in daily_treasury_tally for network: ${network}`,
				status: 404
			};
		}

		const treasuryData: IDailyTreasuryTally = {
			created_at: dailyTreasuryTally.created_at.toDate().toISOString(),
			balance: dailyTreasuryTally.balance.toString()
		};

		return {
			data: treasuryData,
			error: null,
			status: 200
		};
	} catch (error) {
		return {
			data: null,
			error: error.message || messages.API_FETCH_ERROR,
			status: Number(error.name) || 500
		};
	}
}

const handler: NextApiHandler<IDailyTreasuryTally | { error: string }> = async (req, res) => {
	storeApiKeyUsage(req);

	const network = req.headers['x-network'] as string;

	if (!network || !isValidNetwork(network)) {
		return res.status(400).json({ error: 'Missing or invalid network in request headers' });
	}

	try {
		const { data, error, status } = await getDailyTreasuryTally({ network });

		if (error || !data) {
			return res.status(status).json({ error: error || messages.API_FETCH_ERROR });
		} else {
			return res.status(status).json(data);
		}
	} catch (error) {
		console.error('Error occurred in API handler:', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
};

export default withErrorHandling(handler);
