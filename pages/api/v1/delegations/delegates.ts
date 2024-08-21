// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { GET_ALL_TRACK_LEVEL_ANALYTICS_DELEGATION_DATA, RECEIVED_DELEGATIONS_AND_VOTES_COUNT_FOR_ADDRESS } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { isAddress } from 'ethers';
import { IDelegate } from '~src/types';
import * as admin from 'firebase-admin';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import w3fDelegatesKusama from './w3f-delegates-kusama.json';
import w3fDelegatesPolkadot from './w3f-delegates-polkadot.json';

const firestore_db = admin.firestore();

export const getDelegatesData = async (network: string, address?: string) => {
	if (!network || !isOpenGovSupported(network)) return [];

	const encodedAddr = address ? getEncodedAddress(String(address), network) : address;

	const novaDelegatesKusama = await fetch('https://raw.githubusercontent.com/novasamatech/opengov-delegate-registry/master/registry/polkadot.json').then((res) => res.json());
	const novaDelegatesPolkadot = await fetch('https://raw.githubusercontent.com/novasamatech/opengov-delegate-registry/master/registry/kusama.json').then((res) => res.json());
	const parityDelegatesPolkadot = await fetch('https://paritytech.github.io/governance-ui/data/polkadot/delegates.json').then((res) => res.json());
	const parityDelegatesKusama = await fetch('https://paritytech.github.io/governance-ui/data/kusama/delegates.json').then((res) => res.json());
	const novaDelegates = network === 'kusama' ? novaDelegatesKusama : novaDelegatesPolkadot;
	const parityDelegates = network === 'kusama' ? parityDelegatesKusama : parityDelegatesPolkadot;
	const W3fDelegates = network === 'kusama' ? w3fDelegatesKusama : w3fDelegatesPolkadot;
	if (address && !(encodedAddr || isAddress(String(address)))) return [];

	const subsquidFetches: { [index: string]: any } = {};

	const paDelegatesResults: any[] = [];

	const data = await fetchSubsquid({
		network,
		query: GET_ALL_TRACK_LEVEL_ANALYTICS_DELEGATION_DATA
	});

	const totalDelegatorsObj: any = {};
	data['data']?.votingDelegations.map((delegation: { from: string }) => {
		if (totalDelegatorsObj[delegation?.from] === undefined) {
			totalDelegatorsObj[delegation?.from] = 1;
		} else {
			totalDelegatorsObj[delegation?.from] = totalDelegatorsObj[delegation?.from]?.count + 1;
		}
	});

	const paDelegatesSnapshot = await firestore_db.collection('networks').doc(network).collection('pa_delegates').get();
	if (!paDelegatesSnapshot.empty) {
		const paDelegatesPromise = paDelegatesSnapshot.docs.map(async (delegate) => {
			const data = delegate?.data();
			return data;
		});

		const paDelegates = await Promise.allSettled(Object.values(paDelegatesPromise));
		paDelegates.map((delegate) => {
			if (delegate?.status === 'fulfilled') {
				paDelegatesResults.push(delegate?.value as IDelegate);
			}
		});
	}
	const combinedDelegates = [
		...Object.keys(totalDelegatorsObj).map((key) => {
			return { address: key, bio: '' };
		}),
		...paDelegatesResults,
		...W3fDelegates.map((item) => {
			{
				return { ...item, dataSource: 'w3f' };
			}
		}),
		...novaDelegates.map((item: any) => {
			return { ...item, dataSource: 'nova' };
		}),
		...parityDelegates.map((item: any) => {
			return { ...item, dataSource: 'parity' };
		})
	];
	const combinedDelegatesUniqueData: any = {};
	combinedDelegates.map((item) => {
		const addr = getEncodedAddress(item?.address, network) || item?.address;
		if (combinedDelegatesUniqueData[addr] === undefined) {
			if (!item.dataSource) {
				combinedDelegatesUniqueData[addr] = {
					...(combinedDelegatesUniqueData[addr] || {}),
					withoutSource: { ...(combinedDelegatesUniqueData[addr]?.withoutSource || {}), ...item }
				};
			}
			if (item?.dataSource === 'nova') {
				combinedDelegatesUniqueData[addr] = {
					...(combinedDelegatesUniqueData[addr] || {}),
					nova: { ...(combinedDelegatesUniqueData[addr]?.nova || {}), ...item }
				};
			}
			if (item?.dataSource === 'parity') {
				combinedDelegatesUniqueData[addr] = {
					...(combinedDelegatesUniqueData[addr] || {}),
					parity: { ...(combinedDelegatesUniqueData[addr]?.parity || {}), ...item }
				};
			}
			if (item?.dataSource === 'polkassembly') {
				combinedDelegatesUniqueData[addr] = {
					...(combinedDelegatesUniqueData[addr] || {}),
					polkassembly: { ...(combinedDelegatesUniqueData[addr]?.polkassembly || {}), ...item }
				};
			}
			if (item?.dataSource === 'w3f') {
				combinedDelegatesUniqueData[addr] = {
					...(combinedDelegatesUniqueData[addr] || {}),
					w3f: { ...(combinedDelegatesUniqueData[addr]?.w3f || {}), ...item }
				};
			}
		}
		if (combinedDelegatesUniqueData[addr] !== undefined) {
			if (!item.dataSource) {
				combinedDelegatesUniqueData[addr] = {
					...(combinedDelegatesUniqueData[addr] || {}),
					withoutSource: { ...(combinedDelegatesUniqueData[addr]?.withoutSource || {}), ...item }
				};
			}
			if (item?.dataSource === 'nova') {
				combinedDelegatesUniqueData[addr] = {
					...(combinedDelegatesUniqueData[addr] || {}),
					nova: { ...(combinedDelegatesUniqueData[addr]?.nova || {}), ...item }
				};
			}
			if (item?.dataSource === 'parity') {
				combinedDelegatesUniqueData[addr] = {
					...(combinedDelegatesUniqueData[addr] || {}),
					parity: { ...(combinedDelegatesUniqueData[addr]?.parity || {}), ...item }
				};
			}
			if (item?.dataSource === 'polkassembly') {
				combinedDelegatesUniqueData[addr] = {
					...(combinedDelegatesUniqueData[addr] || {}),
					polkassembly: { ...(combinedDelegatesUniqueData[addr]?.polkassembly || {}), ...item }
				};
			}
			if (item?.dataSource === 'w3f') {
				combinedDelegatesUniqueData[addr] = {
					...(combinedDelegatesUniqueData[addr] || {}),
					w3f: { ...(combinedDelegatesUniqueData[addr]?.w3f || {}), ...item }
				};
			}
		}
	});

	const currentDate = new Date();
	if (encodedAddr) {
		subsquidFetches[encodedAddr] = fetchSubsquid({
			network,
			query: RECEIVED_DELEGATIONS_AND_VOTES_COUNT_FOR_ADDRESS,
			variables: {
				address: String(encodedAddr),
				createdAt_gte: new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
			}
		});
	} else {
		Object.keys(combinedDelegatesUniqueData).map((addr) => {
			subsquidFetches[addr] = fetchSubsquid({
				network,
				query: RECEIVED_DELEGATIONS_AND_VOTES_COUNT_FOR_ADDRESS,
				variables: {
					address: String(addr),
					createdAt_gte: new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
				}
			});
		});
	}

	const subsquidResults = await Promise.allSettled(Object.values(subsquidFetches));

	const result: IDelegate[] = [];

	for (const [index, delegateData] of subsquidResults.entries()) {
		const receivedDelgations: any = {};

		if (!delegateData || delegateData.status !== 'fulfilled') continue;

		delegateData.value.data?.votingDelegations?.map((delegation: any) => {
			if (receivedDelgations[delegation?.from] === undefined) {
				receivedDelgations[delegation?.from] = 1;
			}
		});

		const votesCount = Number(delegateData.value.data?.convictionVotesConnection?.totalCount || 0);
		const address = Object.keys(subsquidFetches)[index];
		if (!address) continue;
		let bio = '';
		let username = '';
		const dataSource = [];
		if (combinedDelegatesUniqueData?.[address]?.nova) {
			if (combinedDelegatesUniqueData?.[address]?.nova?.longDescription?.length) {
				bio = combinedDelegatesUniqueData?.[address]?.nova?.longDescription || '';
				username = combinedDelegatesUniqueData?.[address]?.nova?.name || '';
			}
			dataSource.push('nova');
		}
		if (combinedDelegatesUniqueData?.[address]?.w3f) {
			if (combinedDelegatesUniqueData?.[address]?.w3f?.longDescription?.length) {
				bio = combinedDelegatesUniqueData?.[address]?.w3f?.longDescription || '';
				username = combinedDelegatesUniqueData?.[address]?.w3f?.name || '';
			}
			dataSource.push('w3f');
		}
		if (combinedDelegatesUniqueData?.[address]?.parity) {
			if (combinedDelegatesUniqueData?.[address]?.parity?.manifesto?.length) {
				bio = combinedDelegatesUniqueData?.[address]?.parity?.manifesto || '';
				username = combinedDelegatesUniqueData?.[address]?.parity?.name;
			}
			dataSource.push('parity');
		}
		if (combinedDelegatesUniqueData[address]?.polkassembly) {
			if (combinedDelegatesUniqueData?.[address]?.polkassembly?.bio?.length) {
				bio = combinedDelegatesUniqueData?.[address]?.polkassembly?.bio || '';
				username = combinedDelegatesUniqueData?.[address]?.polkassembly?.name || '';
			}
			dataSource.push('polkassembly');
		}
		if (combinedDelegatesUniqueData?.[address]) {
			const newDelegate: IDelegate = {
				active_delegation_count: Object.keys(receivedDelgations)?.length || 0,
				address,
				bio: bio || '',
				dataSource,
				name: username,
				voted_proposals_count: votesCount
			};
			result.push(newDelegate);
		}
	}
	return result;
};

async function handler(req: NextApiRequest, res: NextApiResponse<IDelegate[] | { error: string }>) {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ error: 'Invalid network in request header' });

	const { address } = req.body;
	if (address && !(getEncodedAddress(String(address), network) || isAddress(String(address)))) return res.status(400).json({ error: 'Invalid address' });

	const result = await getDelegatesData(network, address ? String(address) : undefined);
	return res.status(200).json(result as IDelegate[]);
}

export default withErrorHandling(handler);
