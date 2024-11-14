// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { GET_CURATORS_DATA } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';
import messages from '~src/auth/utils/messages';
import console_pretty from '~src/api-utils/console_pretty';
import { isValidNetwork } from '~src/api-utils';

interface CuratorData {
	curator: string;
	childBounties: number;
	bounties: number;
	total_rewards: number;
	active: number;
}

interface Proposal {
	curator: string;
	type: 'ChildBounty' | 'Bounty';
	reward: string;
	status: string;
}

interface curatorsResponse {
	curators?: CuratorData[];
	message?: string;
}

const handler: NextApiHandler<curatorsResponse> = async (req, res) => {
	storeApiKeyUsage(req);
	try {
		const network = String(req.headers['x-network']);
		if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

		console_pretty(network);

		const subsquidRes = await fetchSubsquid({
			network,
			query: GET_CURATORS_DATA
		});

		const curatorsData: Proposal[] = subsquidRes?.data?.proposals || [];
		const formattedData = Object.values(
			curatorsData.reduce(
				(acc: Record<string, CuratorData>, { curator, type, reward, status }: Proposal) => {
					if (!curator) return acc;

					if (!acc[curator]) {
						acc[curator] = {
							active: 0,
							bounties: 0,
							childBounties: 0,
							curator,
							total_rewards: 0
						};
					}
					if (type === 'ChildBounty') acc[curator].childBounties += 1;
					if (type === 'Bounty') acc[curator].bounties += 1;
					acc[curator].total_rewards += parseInt(reward, 10);
					if (status === 'Extended' || status === 'Active') acc[curator].active += 1;

					return acc;
				},
				{} as Record<string, CuratorData>
			)
		);

		return res.status(200).json({ curators: formattedData });
	} catch (err) {
		return res.status(500).json({ message: err || messages.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
