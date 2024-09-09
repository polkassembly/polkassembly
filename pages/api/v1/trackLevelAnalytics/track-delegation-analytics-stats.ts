// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { GET_ALL_TRACK_LEVEL_ANALYTICS_DELEGATION_DATA } from '~src/queries';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import messages from '~src/auth/utils/messages';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import { IDelegationAnalytics } from '~src/redux/trackLevelAnalytics/@types';
import { generateKey } from '~src/util/getRedisKeys';
import { redisGet, redisSetex } from '~src/auth/redis';
import getUpdateDelegationData, { ISubsquidRes } from '~src/components/TrackLevelAnalytics/utils/getUpdateDelegationData';

const TTL_DURATION = 3600 * 24; // 23 Hours or 82800 seconds

export const getTrackDelegationAnalyticsStats = async ({ network, trackId }: { network: string; trackId: number }) => {
	try {
		if (!network || !isValidNetwork(network)) throw apiErrorWithStatusCode(messages.INVALID_NETWORK, 400);

		if (typeof trackId !== 'number') throw apiErrorWithStatusCode(messages.INVALID_PARAMS, 400);

		let subsquidRes = [];

		if (process.env.IS_CACHING_ALLOWED == '1') {
			const redisKey = generateKey({ govType: 'OpenGov', keyType: 'trackDelegationData', network });
			const redisData = await redisGet(redisKey);

			if (redisData) {
				subsquidRes = JSON.parse(redisData);
			}
		}

		if (!subsquidRes?.length) {
			const data = await fetchSubsquid({
				network,
				query: GET_ALL_TRACK_LEVEL_ANALYTICS_DELEGATION_DATA
			});

			subsquidRes = data?.['data']?.votingDelegations || [];
			if (process.env.IS_CACHING_ALLOWED == '1') {
				const redisKey = generateKey({ govType: 'OpenGov', keyType: 'trackDelegationData', network });
				await redisSetex(redisKey, TTL_DURATION, JSON.stringify(subsquidRes));
			}
		}

		const results = getUpdateDelegationData(subsquidRes.filter((item: ISubsquidRes) => item?.track == trackId));
		return {
			data: results,
			error: null,
			status: 200
		};
	} catch (error) {
		return {
			data: null,
			error: error || messages.API_FETCH_ERROR,
			status: 500
		};
	}
};

async function handler(req: NextApiRequest, res: NextApiResponse<IDelegationAnalytics | MessageType>) {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);

	const { trackId } = req.body;

	const { data, error } = await getTrackDelegationAnalyticsStats({ network, trackId: Number(trackId) });

	if (data) {
		return res.status(200).json(data);
	}
	return res.status(500).json({ message: error || messages.API_FETCH_ERROR });
}

export default withErrorHandling(handler);
