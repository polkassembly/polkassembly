// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { networkDocRef } from '~src/api-utils/firestore_refs';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import { network as AllNetworks } from '~src/global/networkConstants';

const getAllTrackLevelProposalsAnalytics = async ({ network }: { network: string }) => {
	try {
		if (!network || !isValidNetwork(network)) throw apiErrorWithStatusCode(messages.INVALID_NETWORK, 400);
		const trackProposals: { [key: string]: number } = {};
		let totalProposals = 0;

		const trackDocsSnapshot = await networkDocRef(network).collection('track_level_analytics').get();

		if (!trackDocsSnapshot.empty) {
			trackDocsSnapshot.docs.map((doc) => {
				const data = doc.data();
				if (data?.totalProposalsCount) {
					trackProposals[doc?.id] = data?.totalProposalsCount || 0;
					totalProposals += data?.totalProposalsCount || 0;
				}
			});
		}

		return { data: { data: trackProposals, totalProposals: totalProposals || 0 }, error: null, status: 200 };
	} catch (err) {
		return { data: null, error: err || messages.API_FETCH_ERROR, status: err.name };
	}
};

async function handler(req: NextApiRequest, res: NextApiResponse<{ totalProposals: number; data: { [key: string]: number } } | MessageType>) {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);
	if (!network || !Object.values(AllNetworks).includes(network)) {
		return res.status(400).json({ message: messages.INVALID_NETWORK });
	}

	const { data, error } = await getAllTrackLevelProposalsAnalytics({
		network
	});
	if (data) {
		return res.status(200).json(data);
	} else {
		return res.status(400).json({ message: error });
	}
}

export default withErrorHandling(handler);
