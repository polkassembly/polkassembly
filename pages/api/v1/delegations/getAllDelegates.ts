// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { GET_ALL_TRACK_LEVEL_ANALYTICS_DELEGATION_DATA, GET_VOTES_COUNT_FOR_TIMESPAN } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { isAddress } from 'ethers';
import { IDelegateAddressDetails } from '~src/types';
import * as admin from 'firebase-admin';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import w3fDelegatesKusama from './w3f-delegates-kusama.json';
import w3fDelegatesPolkadot from './w3f-delegates-polkadot.json';
import BN from 'bn.js';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import { generateKey } from '~src/util/getRedisKeys';
import { redisGet, redisSetex } from '~src/auth/redis';

const firestore_db = admin.firestore();
const TTL_DURATION = 3600 * 24; // 23 Hours or 82800 seconds

const getDelegatesDataSourceAndDetails = (data: { address: string; bio: string; image: string; dataSource: string[] }[]) => {
	const res: Record<string, { address: string; bio: string; image: string; dataSource: string[] }> = {};

	data.forEach((item) => {
		if (!res[item.address]) {
			res[item.address] = item;
		} else {
			const existing = res?.[item?.address];
			res[item?.address] = {
				address: existing?.address || '',
				bio: existing?.bio?.length ? existing?.bio : item?.bio || '',
				dataSource: [...new Set([...(existing.dataSource || []), ...(item.dataSource || [])])],
				image: item.image || existing.image || ''
			};
		}
	});
	return res;
};

const getAllCombineDelegatesData = (
	delegatesDetails: Record<string, { address: string; bio: string; image: string; dataSource: string[] }>,
	delegatesStats: {
		delegatedBalance: string;
		receivedDelegationsCount: number;
		votedProposalCount: number;
		address: string;
	}[]
) => {
	return delegatesStats.map((stats) => ({
		address: stats.address,
		bio: delegatesDetails[stats?.address]?.bio,
		dataSource: delegatesDetails[stats?.address]?.dataSource,
		delegatedBalance: stats?.delegatedBalance,
		image: delegatesDetails[stats?.address]?.image,
		receivedDelegationsCount: stats?.receivedDelegationsCount,
		votedProposalsCount: stats?.votedProposalCount
	}));
};

export const getDelegatesData = async (network: string, address?: string | null) => {
	if (!network || !isOpenGovSupported(network)) return { data: [], error: messages.INVALID_NETWORK };

	try {
		const encodedAddr = address ? getEncodedAddress(String(address), network) : address;
		if (address && !(encodedAddr || isAddress(String(address)))) return { data: [], error: messages.INVALID_PARAMS };

		if (process.env.IS_CACHING_ALLOWED == '1' && !address?.length) {
			const redisKey = generateKey({ govType: 'OpenGov', keyType: 'allDelegates', network });
			const redisData = await redisGet(redisKey);

			if (redisData) {
				return {
					data: JSON.parse(redisData) || [],
					error: null,
					status: 200
				};
			}
		}

		let novaWalletDelegates;
		let parityDelegates;
		let W3fDelegates;

		const DELEGATE_URLS = {
			kusama: {
				novaWallet: 'https://raw.githubusercontent.com/novasamatech/opengov-delegate-registry/master/registry/kusama.json',
				parity: 'https://paritytech.github.io/governance-ui/data/kusama/delegates.json'
			},
			polkadot: {
				novaWallet: 'https://raw.githubusercontent.com/novasamatech/opengov-delegate-registry/master/registry/polkadot.json',
				parity: 'https://paritytech.github.io/governance-ui/data/polkadot/delegates.json'
			}
		};

		switch (network) {
			case 'polkadot':
				parityDelegates = await fetch(DELEGATE_URLS.polkadot.parity).then((res) => res.json());
				novaWalletDelegates = await fetch(DELEGATE_URLS.polkadot.novaWallet).then((res) => res.json());
				W3fDelegates = w3fDelegatesPolkadot;
				break;
			case 'kusama':
				parityDelegates = await fetch(DELEGATE_URLS.kusama.parity).then((res) => res.json());
				novaWalletDelegates = await fetch(DELEGATE_URLS.kusama.novaWallet).then((res) => res.json());
				W3fDelegates = w3fDelegatesKusama;
				break;
			default:
				throw new Error(`Unsupported network: ${network}`);
		}
		let data;

		if (encodedAddr) {
			data = await fetchSubsquid({
				network,
				query: GET_ALL_TRACK_LEVEL_ANALYTICS_DELEGATION_DATA,
				variables: { address: encodedAddr }
			});
		} else {
			data = await fetchSubsquid({
				network,
				query: GET_ALL_TRACK_LEVEL_ANALYTICS_DELEGATION_DATA
			});
		}

		const totalDelegatorsObj: Record<string, { receivedDelegationsCount: Record<string, number>; delegatedBalance: BN; address: string; votedProposalCount?: number }> = {};

		data['data']?.votingDelegations.forEach((delegation: { to: string; balance: string; from: string; lockPeriod: number }) => {
			if (!totalDelegatorsObj[delegation.to]) {
				const balance = delegation.lockPeriod ? new BN(delegation.balance).mul(new BN(delegation.lockPeriod)) : new BN(delegation.balance).div(new BN('10'));
				totalDelegatorsObj[delegation.to] = {
					address: delegation.to,
					delegatedBalance: balance,
					receivedDelegationsCount: { [delegation.from]: 1 }
				};
			} else {
				const balance = delegation.lockPeriod
					? totalDelegatorsObj[delegation.to].delegatedBalance.add(new BN(delegation.balance).mul(new BN(delegation.lockPeriod)))
					: totalDelegatorsObj[delegation.to].delegatedBalance.add(new BN(delegation.balance).div(new BN('10')));
				totalDelegatorsObj[delegation.to] = {
					address: delegation.to,
					delegatedBalance: balance,
					receivedDelegationsCount: {
						...totalDelegatorsObj[delegation.to].receivedDelegationsCount,
						[delegation.from]: 1
					}
				};
			}
		});

		const allDelegatesAddresses = Object.keys(totalDelegatorsObj);
		const currentDate = new Date();
		const votesCounts: Record<string, number> = {};
		const votesCountsPromises = allDelegatesAddresses.map(async (delegate) => {
			const data = await fetchSubsquid({
				network,
				query: GET_VOTES_COUNT_FOR_TIMESPAN,
				variables: {
					address: String(delegate),
					createdAt_gte: new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
				}
			});
			votesCounts[delegate] = data?.['data']?.convictionVotesConnection?.totalCount || 0;
		});

		await Promise.allSettled(votesCountsPromises);

		const allDelegatesResults = Object.entries(totalDelegatorsObj).map(([, value]) => ({
			...value,
			delegatedBalance: value.delegatedBalance.toString(),
			receivedDelegationsCount: Object.keys(value.receivedDelegationsCount).length,
			votedProposalCount: votesCounts[value?.address]
		}));

		const paDelegatesSnapshot = await firestore_db.collection('networks').doc(network).collection('pa_delegates').get();
		const paDelegates = paDelegatesSnapshot.docs.map((delegate) => delegate?.data());

		const delegatesDetails = getDelegatesDataSourceAndDetails([
			...(novaWalletDelegates?.map((item: any) => ({
				address: getEncodedAddress(item.address, network),
				bio: item?.shortDescription,
				dataSource: ['nova'],
				image: item.image || '',
				username: item?.username || ''
			})) || []),
			...(W3fDelegates?.map((item: any) => ({
				address: getEncodedAddress(item.address, network),
				bio: item?.shortDescription || '',
				dataSource: ['w3f'],
				image: '',
				username: item?.username || ''
			})) || []),
			...(parityDelegates?.map((item: any) => ({
				address: getEncodedAddress(item.address, network),
				bio: item?.manifesto || '',
				dataSource: ['parity'],
				image: item?.image || '',
				username: item?.username || ''
			})) || []),
			...(paDelegates?.map((item: any) => ({
				address: getEncodedAddress(item.address, network),
				bio: item?.bio || '',
				dataSource: ['polkassembly'],
				image: item?.image || '',
				username: item?.username || ''
			})) || [])
		]);

		const combinedDelegates = getAllCombineDelegatesData(delegatesDetails, allDelegatesResults);

		const filteredCombinedDelegates = combinedDelegates.sort((a, b) => b.votedProposalsCount - a.votedProposalsCount);

		if (process.env.IS_CACHING_ALLOWED == '1' && !address?.length) {
			const redisKey = generateKey({ govType: 'OpenGov', keyType: 'allDelegates', network });
			await redisSetex(redisKey, TTL_DURATION, JSON.stringify(filteredCombinedDelegates));
		}

		return {
			data: filteredCombinedDelegates || [],
			error: null
		};
	} catch (err) {
		return {
			data: null,
			error: err || messages.API_FETCH_ERROR
		};
	}
};

async function handler(req: NextApiRequest, res: NextApiResponse<IDelegateAddressDetails[] | MessageType>) {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Missing network name in request headers' });

	const { address } = req.body;
	if (address && !(getEncodedAddress(String(address), network) || isAddress(String(address)))) return res.status(400).json({ message: 'Invalid address' });

	const { data, error } = await getDelegatesData(network, address ? String(address) : null);
	if (data) {
		return res.status(200).json(data as IDelegateAddressDetails[]);
	} else {
		return res.status(500).json({ message: error || messages.API_FETCH_ERROR });
	}
}

export default withErrorHandling(handler);
