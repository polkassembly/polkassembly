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
import { EDelegationAddressFilters, EDelegationSourceFilters, IDelegateAddressDetails } from '~src/types';
import * as admin from 'firebase-admin';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import w3fDelegatesKusama from './w3f-delegates-kusama.json';
import w3fDelegatesPolkadot from './w3f-delegates-polkadot.json';
import BN from 'bn.js';

const firestore_db = admin.firestore();

const getDelegatesDataSourceAndDetails = (data: { address: string; bio: string; image: string; dataSource: string[] }[]) => {
	const res: Record<string, { address: string; bio: string; image: string; dataSource: string[] }> = {};

	data.forEach((item) => {
		if (!res[item.address]) {
			res[item.address] = item;
		} else {
			const existing = res[item.address];
			res[item.address] = {
				address: existing.address,
				bio: existing.bio.length ? existing.bio : item.bio,
				dataSource: [...new Set([...existing.dataSource, ...item.dataSource])],
				image: item.image || existing.image
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
		bio: delegatesDetails[stats.address]?.bio,
		dataSource: delegatesDetails[stats.address]?.dataSource,
		delegatedBalance: stats.delegatedBalance,
		image: delegatesDetails[stats.address]?.image,
		receivedDelegationsCount: stats.receivedDelegationsCount,
		votedProposalsCount: stats.votedProposalCount
	}));
};

const getResultsDataAccordingToFilter = (filterBy: EDelegationAddressFilters, data: IDelegateAddressDetails[]): IDelegateAddressDetails[] => {
	switch (filterBy) {
		case EDelegationAddressFilters.DELEGATED_VOTES:
			return data.sort((a, b) => new BN(b.delegatedBalance).cmp(new BN(a.delegatedBalance)));
		case EDelegationAddressFilters.RECEIVED_DELEGATIONS:
			return data.sort((a, b) => b.receivedDelegationsCount - a.receivedDelegationsCount);
		case EDelegationAddressFilters.VOTED_PROPOSALS:
			return data.sort((a, b) => b.votedProposalsCount - a.votedProposalsCount);
		case EDelegationAddressFilters.ALL:
		default:
			return data;
	}
};

const filterDelegatesBySources = (data: IDelegateAddressDetails[], selectedSources: string[]): IDelegateAddressDetails[] => {
	return data.filter((delegate) => {
		if (selectedSources.length === 1 && selectedSources[0] === EDelegationSourceFilters.NA) {
			return !delegate.dataSource || delegate.dataSource.length === 0;
		}

		if (selectedSources.includes(EDelegationSourceFilters.NA)) {
			return !delegate.dataSource || delegate.dataSource.length === 0 || selectedSources.some((source) => delegate.dataSource?.includes(source));
		}

		return selectedSources.some((source) => delegate.dataSource?.includes(source));
	});
};

export const getDelegatesData = async (network: string, filterBy: string, address?: string, selectedSources: string[] = []) => {
	if (!network || !isOpenGovSupported(network)) return [];

	const encodedAddr = address ? getEncodedAddress(String(address), network) : address;
	if (address && !(encodedAddr || isAddress(String(address)))) return [];

	let novaWalletDelegates;
	let parityDelegates;
	let W3fDelegates;
	if (network === 'polkadot') {
		novaWalletDelegates = await fetch('https://raw.githubusercontent.com/novasamatech/opengov-delegate-registry/master/registry/kusama.json').then((res) => res.json());
		parityDelegates = await fetch('https://paritytech.github.io/governance-ui/data/polkadot/delegates.json').then((res) => res.json());
		W3fDelegates = w3fDelegatesPolkadot;
	} else {
		novaWalletDelegates = await fetch('https://raw.githubusercontent.com/novasamatech/opengov-delegate-registry/master/registry/polkadot.json').then((res) => res.json());
		parityDelegates = await fetch('https://paritytech.github.io/governance-ui/data/kusama/delegates.json').then((res) => res.json());
		W3fDelegates = w3fDelegatesKusama;
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
		...novaWalletDelegates.map((item: any) => ({
			address: getEncodedAddress(item.address, network),
			bio: item?.longDescription,
			dataSource: ['nova'],
			image: item.image || ''
		})),
		...W3fDelegates.map((item: any) => ({
			address: getEncodedAddress(item.address, network),
			bio: item?.longDescription || '',
			dataSource: ['w3f'],
			image: ''
		})),
		...parityDelegates.map((item: any) => ({
			address: getEncodedAddress(item.address, network),
			bio: item?.manifesto || '',
			dataSource: ['parity'],
			image: item?.image || ''
		})),
		...paDelegates.map((item: any) => ({
			address: getEncodedAddress(item.address, network),
			bio: item?.bio || '',
			dataSource: ['polkassembly'],
			image: item?.image || ''
		}))
	]);

	let combinedDelegates = getAllCombineDelegatesData(delegatesDetails, allDelegatesResults);
	if (selectedSources.length > 0) {
		combinedDelegates = filterDelegatesBySources(combinedDelegates, selectedSources);
	}

	if (filterBy) {
		combinedDelegates = getResultsDataAccordingToFilter(filterBy as EDelegationAddressFilters, combinedDelegates);
	}

	return {
		data: combinedDelegates,
		error: null
	};
};

async function handler(req: NextApiRequest, res: NextApiResponse<IDelegateAddressDetails[] | { error: string }>) {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ error: 'Missing network name in request headers' });

	const { address, filterBy, sources } = req.body;
	if (address && !(getEncodedAddress(String(address), network) || isAddress(String(address)))) return res.status(400).json({ error: 'Invalid address' });

	const result = await getDelegatesData(network, filterBy, address ? String(address) : undefined, sources);
	return res.status(200).json(result as IDelegateAddressDetails[]);
}

export default withErrorHandling(handler);
