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
import { network as AllNetworks } from '~src/global/networkConstants';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';

const getAllTrackLevelVotesAnalytics = async ({ network }: { network: string }) => {
	try {
		if (!network || !isValidNetwork(network)) throw apiErrorWithStatusCode(messages.INVALID_NETWORK, 400);
		const trackNumberArray: number[] = [];

		Object.entries(networkTrackInfo[network]).map(([, value]) => {
			if (!value?.fellowshipOrigin) {
				trackNumberArray.push(value.trackId);
			}
		});
		const averageSupportPercentages: Record<string, number> = {};

		const dataPromise = trackNumberArray.map(async (trackNumber) => {
			let totalSupportedVoted = 0;
			let totalVotes = 0;

			const trackSnapshot = await networkDocRef(network).collection('track_level_analytics').doc(String(trackNumber))?.collection('votes').get();

			trackSnapshot.docs.map((doc) => {
				const data = doc.data();
				if (data) {
					const supportPercentage = data.voteAmount.supportData.percentage || 0;
					const roundedNumber = Number(supportPercentage).toFixed(2);
					totalSupportedVoted += parseFloat(roundedNumber);
					totalVotes += 1;
				}
			});

			averageSupportPercentages[trackNumber] = totalVotes ? totalSupportedVoted / totalVotes : 0;
		});

		await Promise.allSettled(dataPromise);
		return { data: { averageSupportPercentages }, error: null, status: 200 };
	} catch (err) {
		return { data: null, error: err || messages.API_FETCH_ERROR, status: err.name };
	}
};

async function handler(req: NextApiRequest, res: NextApiResponse<{ averageSupportPercentages: Record<string, number> } | MessageType>) {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);
	if (!network || !Object.values(AllNetworks).includes(network)) {
		return res.status(400).json({ message: messages.INVALID_NETWORK });
	}

	const { data, error } = await getAllTrackLevelVotesAnalytics({
		network
	});
	if (data) {
		return res.status(200).json(data);
	} else {
		return res.status(400).json({ message: error });
	}
}

export default withErrorHandling(handler);
