// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { GET_CURATORS_DATA } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';
import messages from '~src/auth/utils/messages';
import { isValidNetwork } from '~src/api-utils';
import { getProfileWithAddress } from '../auth/data/profileWithAddress';
import { ECuratorsSortFilters } from '~src/types';

interface CuratorData {
	curator: string;
	address?: string;
	childBounties: number;
	bounties: number;
	total_rewards: number;
	active: number;
	created_at?: Date;
	custom_username?: boolean;
	profile?: any;
	user_id?: number | null;
	username?: string;
	web3Signup?: boolean;
	disbursedChildBounty: number;
	unclaimedAmount: number;
}

interface Proposal {
	curator: string;
	type: 'ChildBounty' | 'Bounty';
	reward: string;
	status: string;
}

export interface curatorsResponse {
	curators?: CuratorData[];
	count?: number;
	message?: string;
}

const ITEMS_PER_PAGE = 10;

const getUserDetails = async (address: string) => {
	try {
		const { data } = await getProfileWithAddress({ address });
		return data || null;
	} catch (error) {
		console.error('Error fetching user details:', error);
		return null;
	}
};

const processCuratorsData = (curatorsData: Proposal[]) => {
	return Object.values(
		curatorsData.reduce<Record<string, CuratorData>>((acc, { curator, type, reward, status }) => {
			if (!curator) return acc;

			const rewardValue = parseInt(reward, 10) || 0;
			const isActive = ['Extended', 'Active'].includes(status);

			if (!acc[curator]) {
				acc[curator] = {
					active: 0,
					bounties: 0,
					childBounties: 0,
					curator,
					disbursedChildBounty: 0,
					total_rewards: 0,
					unclaimedAmount: 0
				};
			}

			const curatorData = acc[curator];
			curatorData.total_rewards += rewardValue;

			if (type === 'ChildBounty') {
				curatorData.childBounties++;
				if (status === 'Claimed') {
					curatorData.disbursedChildBounty++;
				} else {
					curatorData.unclaimedAmount += rewardValue;
				}
			} else if (type === 'Bounty') {
				curatorData.bounties++;
			}

			if (isActive) {
				curatorData.active++;
			}

			return acc;
		}, {})
	);
};

const handler: NextApiHandler<curatorsResponse> = async (req, res) => {
	storeApiKeyUsage(req);

	try {
		const network = String(req.headers['x-network']);
		if (!network || !isValidNetwork(network)) {
			return res.status(400).json({ message: 'Invalid network in request header' });
		}

		const { page = 1, username, sortOption } = req.body;
		const pageNumber = parseInt(page, 10);

		const subsquidRes = await fetchSubsquid({ network, query: GET_CURATORS_DATA });
		const curatorsData: Proposal[] = subsquidRes?.data?.proposals || [];
		let formattedData = processCuratorsData(curatorsData);

		await Promise.all(
			formattedData.map(async (curatorData) => {
				const userData = await getUserDetails(curatorData.curator);
				if (userData) {
					Object.assign(curatorData, {
						...userData,
						address: curatorData.curator
					});
				}
			})
		);

		if (username) {
			formattedData = formattedData.filter((curatorData) => curatorData.username === username);
		}

		switch (sortOption) {
			case ECuratorsSortFilters.ACTIVE_BOUNTIES:
				formattedData.sort((a, b) => b.active - a.active);
				break;
			case ECuratorsSortFilters.CHILD_BOUNTIES_DISBURSED:
				formattedData.sort((a, b) => b.disbursedChildBounty - a.disbursedChildBounty);
				break;
		}

		const startIndex = (pageNumber - 1) * ITEMS_PER_PAGE;
		const paginatedData = formattedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

		return res.status(200).json({
			count: formattedData.length,
			curators: paginatedData
		});
	} catch (error) {
		console.error('Error in curators handler:', error);
		return res.status(500).json({ message: error?.message || messages.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
