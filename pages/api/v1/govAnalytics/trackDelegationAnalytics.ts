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
import { network as AllNetworks } from '~src/global/networkConstants';

interface IRes {
	[key: string]: {
		totalCapital: string;
		totalVotesBalance: string;
		totalDelegates: number;
		totalDelegators: number;
		delegateesData: { [key: string]: { count: number } };
		delegatorsData: { [key: string]: { count: number } };
	};
}
export const getTrackDelegationAnalyticsStats = async ({ network }: { network: string }) => {
	try {
		if (!network || !isValidNetwork(network)) throw apiErrorWithStatusCode(messages.INVALID_NETWORK, 400);

		const data = await fetchSubsquid({
			network,
			query: GET_ALL_TRACK_LEVEL_ANALYTICS_DELEGATION_DATA
		});

		const trackStats: IRes = {};

		if (data['data']?.votingDelegations?.length) {
			data['data']?.votingDelegations.forEach((delegation: { lockPeriod: number; balance: string; from: string; to: string; track: number }) => {
				const track = delegation.track;
				const bnBalance = new BN(delegation?.balance);
				const bnConviction = new BN(delegation?.lockPeriod || 1);
				const vote = delegation?.lockPeriod ? bnBalance.mul(bnConviction) : bnBalance.div(new BN('10'));

				if (!trackStats[track]) {
					trackStats[track] = {
						delegateesData: {},
						delegatorsData: {},
						totalCapital: '0',
						totalDelegates: 0,
						totalDelegators: 0,
						totalVotesBalance: '0'
					};
				}

				trackStats[track].totalVotesBalance = new BN(trackStats[track].totalVotesBalance).add(vote).toString();
				trackStats[track].totalCapital = new BN(trackStats[track].totalCapital).add(bnBalance).toString();

				if (!trackStats[track].delegateesData[delegation?.to]) {
					trackStats[track].delegateesData[delegation?.to] = {
						count: 1
					};
					trackStats[track].totalDelegates += 1;
				} else {
					trackStats[track].delegateesData[delegation?.to].count += 1;
				}

				if (!trackStats[track].delegatorsData[delegation?.from]) {
					trackStats[track].delegatorsData[delegation?.from] = {
						count: 1
					};
					trackStats[track].totalDelegators += 1;
				} else {
					trackStats[track].delegatorsData[delegation?.from].count += 1;
				}
			});
		}

		const formattedTrackStats = Object.keys(trackStats).reduce((acc, track) => {
			acc[track] = {
				delegateesData: {},
				delegatorsData: {},
				totalCapital: trackStats[track].totalCapital.toString(),
				totalDelegates: trackStats[track].totalDelegates,
				totalDelegators: trackStats[track].totalDelegators,
				totalVotesBalance: trackStats[track].totalVotesBalance.toString()
			};
			return acc;
		}, {} as IRes);

		return {
			data: formattedTrackStats,
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

async function handler(req: NextApiRequest, res: NextApiResponse<IRes | MessageType>) {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);
	if (!network || !Object.values(AllNetworks).includes(network)) {
		return res.status(400).json({ message: messages.INVALID_NETWORK });
	}

	const { data, error } = await getTrackDelegationAnalyticsStats({ network });

	if (data) {
		return res.status(200).json(data);
	}
	return res.status(500).json({ message: error || messages.API_FETCH_ERROR });
}

export default withErrorHandling(handler);
