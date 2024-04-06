// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import { firestore_db } from '~src/services/firebaseInit';
import { IAnalyticsVoteTrends } from '~src/types';

async function handler(req: NextApiRequest, res: NextApiResponse<{ votes: IAnalyticsVoteTrends[] } | MessageType>) {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

	const { trackNumber } = req.body;

	if (typeof trackNumber !== 'number') return res.status(400).json({ message: messages.INVALID_PARAMS });

	try {
		const votesRef = await firestore_db.collection('networks').doc(network).collection('track_level_analytics').doc(String(trackNumber)).collection('votes').get();
		const data: IAnalyticsVoteTrends[] = [];

		if (!votesRef.empty) {
			votesRef.forEach((doc) => {
				data.push(doc.data() as IAnalyticsVoteTrends);
			});
		}

		return res.status(200).json({ votes: data });
	} catch (err) {
		return res.status(400).json({ message: err });
	}
}

export default withErrorHandling(handler);
