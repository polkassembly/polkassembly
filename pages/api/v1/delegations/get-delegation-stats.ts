// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { GET_ALL_TRACK_LEVEL_ANALYTICS_DELEGATION_DATA, TOTAL_DELEGATATION_STATS } from '~src/queries';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import BN from 'bn.js';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import { generateKey } from '~src/util/getRedisKeys';
import { redisGet, redisSetex } from '~src/auth/redis';

const ZERO_BN = new BN(0);
const TTL_DURATION = 3600 * 24; // 23 Hours or 82800 seconds
export interface IDelegationStats {
	totalDelegatedBalance: string;
	totalDelegatedVotes: number;
	totalDelegates: number;
	totalDelegators: number;
}
async function handler(req: NextApiRequest, res: NextApiResponse<IDelegationStats | MessageType>) {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });
	try {
		const data = await fetchSubsquid({
			network,
			query: TOTAL_DELEGATATION_STATS,
			variables: {
				type_eq: isOpenGovSupported(network) ? 'OpenGov' : 'Democracy'
			}
		});

		let totalDelegatedBalance = ZERO_BN;
		const totalDelegatorsObj: any = {};
		const totalDelegatesObj: any = {};

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

		subsquidRes.map((item: any) => {
			const bnBalance = new BN(item?.balance);
			totalDelegatedBalance = totalDelegatedBalance.add(bnBalance);

			if (totalDelegatesObj[item?.to] === undefined) {
				totalDelegatesObj[item?.to] = 1;
			}
			if (totalDelegatorsObj[item?.from] === undefined) {
				totalDelegatorsObj[item?.from] = 1;
			}
		});
		const delegationStats: IDelegationStats = {
			totalDelegatedBalance: totalDelegatedBalance.toString(),
			totalDelegatedVotes: data?.['data']?.totalDelegatedVotes?.totalCount || 0,
			totalDelegates: Object.keys(totalDelegatesObj)?.length,
			totalDelegators: Object.keys(totalDelegatorsObj)?.length
		};
		return res.status(200).json(delegationStats as any);
	} catch (error) {
		return res.status(500).json({ message: error });
	}
}

export default withErrorHandling(handler);
