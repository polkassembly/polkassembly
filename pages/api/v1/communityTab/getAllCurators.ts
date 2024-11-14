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

interface CuratorData {
	curator: string;
	address?: string;
	childBounties: number;
	bounties: number;
	total_rewards: number;
	active: number;
	created_at?: Date | undefined;
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

const extractContent = async (address: string) => {
	const { data, error } = await getProfileWithAddress({ address: address });
	if (data && !error) {
		console.log(data);
	}
	return data;
};

const handler: NextApiHandler<curatorsResponse> = async (req, res) => {
	storeApiKeyUsage(req);
	try {
		const network = String(req.headers['x-network']);
		if (!network || !isValidNetwork(network)) {
			return res.status(400).json({ message: 'Invalid network in request header' });
		}

		const { page = 1, username } = req.body;
		const pageNumber = parseInt(page, 10);

		const subsquidRes = await fetchSubsquid({
			network,
			query: GET_CURATORS_DATA
		});

		const curatorsData: Proposal[] = subsquidRes?.data?.proposals || [];

		// Group by curator and calculate aggregated data
		let formattedData = Object.values(
			curatorsData.reduce((acc: Record<string, CuratorData>, { curator, type, reward, status }: Proposal) => {
				if (!curator) return acc;

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

				// Increment counts based on the type of proposal
				if (type === 'ChildBounty') acc[curator].childBounties += 1;
				if (type === 'Bounty') acc[curator].bounties += 1;

				// Add to total rewards
				acc[curator].total_rewards += parseInt(reward, 10);

				// Increment active status if applicable
				if (status === 'Extended' || status === 'Active') acc[curator].active += 1;

				// Calculate disbursedChildBounty and unclaimedAmount for ChildBounty type
				if (type === 'ChildBounty' && status === 'Claimed') {
					acc[curator].disbursedChildBounty += 1;
				} else if (type === 'ChildBounty' && status !== 'Claimed') {
					acc[curator].unclaimedAmount += parseInt(reward, 10);
				}

				return acc;
			}, {})
		);

		// Fetch and attach user profile data for each curator
		await Promise.all(
			formattedData.map(async (curatorData) => {
				const userData = await extractContent(curatorData.curator);
				if (userData) {
					curatorData.created_at = userData.created_at;
					curatorData.custom_username = userData.custom_username;
					curatorData.profile = userData.profile;
					curatorData.user_id = userData.user_id;
					curatorData.username = userData.username;
					curatorData.web3Signup = userData.web3Signup;
					curatorData.address = curatorData.curator;
				}
			})
		);

		// Filter by username if provided
		if (username) {
			formattedData = formattedData.filter((curatorData) => curatorData.username === username);
		}

		// Paginate the results
		const startIndex = (pageNumber - 1) * ITEMS_PER_PAGE;
		const paginatedData = formattedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

		return res.status(200).json({
			count: formattedData.length,
			curators: paginatedData
		});
	} catch (err) {
		return res.status(500).json({ message: err || messages.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
