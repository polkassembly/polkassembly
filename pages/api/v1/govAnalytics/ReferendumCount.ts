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
import { networkTrackInfo } from '~src/global/post_trackInfo';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';

const getAllTrackLevelProposalsAnalytics = async ({ network }: { network: string }) => {
	try {
		if (!network || !isValidNetwork(network)) throw apiErrorWithStatusCode(messages.INVALID_NETWORK, 400);

		const trackNumbers = Object.entries(networkTrackInfo[network]).map(([, value]) => value.trackId);
		const trackDataMap: Record<string, number> = {};
		let totalProposals = 0;

		const dataPromise = trackNumbers.map(async (trackId) => {
			if (trackId) {
				const trackSnapshot = await networkDocRef(network).collection('track_level_analytics').doc(String(trackId)).get();
				let totalProposalCount = 0;

				if (trackSnapshot.exists) {
					const data = trackSnapshot.data();
					totalProposalCount = data?.totalProposalCount || 0;
					trackDataMap[trackId] = totalProposalCount;
					totalProposals += totalProposalCount;
				}
			}
		});

		await Promise.allSettled(dataPromise);

		trackDataMap['totalTracks'] = trackNumbers.length;
		trackDataMap['total'] = totalProposals;
		return { data: { trackDataMap }, error: null, status: 200 };
	} catch (err) {
		return { data: null, error: err || messages.API_FETCH_ERROR, status: err.name };
	}
};

async function handler(req: NextApiRequest, res: NextApiResponse<any | MessageType>) {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);

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
