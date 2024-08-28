// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { GET_ALL_TRACK_LEVEL_ANALYTICS_DELEGATION_DATA } from '~src/queries';
import BN from 'bn.js';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import messages from '~src/auth/utils/messages';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import { IDelegatorsAndDelegatees } from '~src/redux/trackLevelAnalytics/@types';
import { generateKey } from '~src/util/getRedisKeys';
import { redisGet, redisSetex } from '~src/auth/redis';

interface ISubsquidRes {
	lockPeriod: number;
	balance: string;
	from: string;
	to: string;
	track: number;
}
const TTL_DURATION = 3600 * 24; // 23 Hours or 82800 seconds

const filterDataByTrackNumber = (data: ISubsquidRes[]) => {
	const tracksSet: { [key: string]: ISubsquidRes[] } = {};
	data.map((item) => {
		if (tracksSet[item?.track] == undefined) {
			tracksSet[item?.track] = [item];
		} else {
			tracksSet[item?.track] = [...(tracksSet?.[item?.track] || []), item];
		}
	});

	return tracksSet;
};

const handleUpdateTrackDelegationData = (data: ISubsquidRes[]): { totalDelegates: number; totalDelegators: number } => {
	const totalDelegatorsObj: IDelegatorsAndDelegatees = {};
	const totalDelegateesObj: IDelegatorsAndDelegatees = {};

	data?.map((delegation: ISubsquidRes) => {
		const bnBalance = new BN(delegation?.balance);
		const bnConviction = new BN(delegation?.lockPeriod || 1);
		const vote = delegation?.lockPeriod ? bnBalance.mul(bnConviction) : bnBalance.div(new BN('10'));

		if (totalDelegateesObj[delegation?.to] === undefined) {
			totalDelegateesObj[delegation?.to] = {
				count: 1,
				data: [{ capital: delegation.balance, from: delegation?.from, lockedPeriod: delegation.lockPeriod || 0.1, to: delegation?.to, votingPower: vote.toString() }]
			};
		} else {
			totalDelegateesObj[delegation?.to] = {
				count: totalDelegateesObj[delegation?.to]?.count + 1,
				data: [
					...(totalDelegateesObj[delegation?.to]?.data || []),
					{ capital: delegation.balance, from: delegation?.from, lockedPeriod: delegation.lockPeriod || 0.1, to: delegation?.to, votingPower: vote.toString() }
				]
			};
		}
		if (totalDelegatorsObj[delegation?.from] === undefined) {
			totalDelegatorsObj[delegation?.from] = {
				count: 1,
				data: [{ capital: delegation.balance, from: delegation?.from, lockedPeriod: delegation.lockPeriod || 0.1, to: delegation?.to, votingPower: vote.toString() }]
			};
		} else {
			totalDelegatorsObj[delegation?.from] = {
				count: totalDelegatorsObj[delegation?.from]?.count + 1,
				data: [
					...(totalDelegatorsObj[delegation?.from]?.data || []),
					{ capital: delegation.balance, from: delegation?.from, lockedPeriod: delegation.lockPeriod || 0.1, to: delegation.to, votingPower: vote.toString() }
				]
			};
		}
	});

	return {
		totalDelegates: Object.keys(totalDelegateesObj)?.length || 0,
		totalDelegators: Object.keys(totalDelegatorsObj)?.length || 0
	};
};

export const getTrackDelegationAnalyticsStats = async ({ network }: { network: string }) => {
	try {
		if (!network || !isValidNetwork(network)) throw apiErrorWithStatusCode(messages.INVALID_NETWORK, 400);

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

		const dataAccToTrack = filterDataByTrackNumber(subsquidRes);

		const result: { [key: string]: { totalDelegates: number; totalDelegators: number } } = {};

		Object.entries(dataAccToTrack).forEach(([key, value]) => {
			const updatedDelegationData = handleUpdateTrackDelegationData(value);
			result[key] = updatedDelegationData;
		});

		return {
			data: result,
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

async function handler(req: NextApiRequest, res: NextApiResponse<{ [key: string]: { totalDelegates: number; totalDelegators: number } } | MessageType>) {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);

	const { data, error } = await getTrackDelegationAnalyticsStats({ network });

	if (data) {
		return res.status(200).json(data);
	}
	return res.status(500).json({ message: error || messages.API_FETCH_ERROR });
}

export default withErrorHandling(handler);
