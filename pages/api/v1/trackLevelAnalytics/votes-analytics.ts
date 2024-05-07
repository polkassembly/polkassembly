// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { networkDocRef } from '~src/api-utils/firestore_refs';
import { redisGet, redisSetex } from '~src/auth/redis';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import { IAnalyticsVoteTrends } from '~src/components/TrackLevelAnalytics/types';
import { ProposalType } from '~src/global/proposalType';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import { generateKey } from '~src/util/getRedisKeys';

const getVoteAnalyticsData = async ({ trackId, network }: { trackId: number; network: string }) => {
	const TTL_DURATION = 3600 * 23; // 23 Hours or 82800 seconds

	try {
		if (!network || !isValidNetwork(network)) throw apiErrorWithStatusCode(messages.INVALID_NETWORK, 400);

		if (typeof trackId !== 'number') throw apiErrorWithStatusCode(messages.INVALID_PARAMS, 400);

		if (process.env.IS_CACHING_ALLOWED == '1') {
			const redisKey = generateKey({ govType: 'OpenGov', keyType: 'votesAnalytics', network, proposalType: ProposalType.REFERENDUM_V2, trackId: trackId });
			const redisData = await redisGet(redisKey);

			if (redisData) {
				return {
					data: { votes: JSON.parse(redisData) },
					error: null,
					status: 200
				};
			}
		}

		const votesRef = await networkDocRef(network).collection('track_level_analytics').doc(String(trackId))?.collection('votes').get();
		const data: IAnalyticsVoteTrends[] = [];

		if (!votesRef.empty) {
			votesRef.forEach((doc) => {
				data.push(doc.data() as IAnalyticsVoteTrends);
			});
		}
		if (process.env.IS_CACHING_ALLOWED == '1') {
			await redisSetex(
				generateKey({ govType: 'OpenGov', keyType: 'votesAnalytics', network, proposalType: ProposalType.REFERENDUM_V2, trackId: trackId }),
				TTL_DURATION,
				JSON.stringify(data)
			);
		}
		return { data: { votes: data }, error: null, status: 200 };
	} catch (err) {
		return { data: null, error: err || messages.API_FETCH_ERROR, status: err.name };
	}
};

async function handler(req: NextApiRequest, res: NextApiResponse<{ votes: IAnalyticsVoteTrends[] } | MessageType>) {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);

	const { trackId } = req.body;

	const { data, error } = await getVoteAnalyticsData({
		network,
		trackId: Number(trackId)
	});
	if (data) {
		return res.status(200).json(data);
	} else {
		return res.status(400).json({ message: error });
	}
}

export default withErrorHandling(handler);
