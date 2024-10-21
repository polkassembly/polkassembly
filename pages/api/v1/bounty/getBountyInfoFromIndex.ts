// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import { GET_ALL_BOUNTIES } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { IApiResponse } from '~src/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import { LISTING_LIMIT } from '~src/global/listingLimit';

interface Args {
	bountyIndex: number;
	network: string;
}

export async function getBountyInfo({ bountyIndex, network }: Args): Promise<IApiResponse<{ status: string; reqAmount?: string; curator?: string; createdAt?: string }>> {
	try {
		if (!network || !isValidNetwork(network)) throw apiErrorWithStatusCode(messages.INVALID_NETWORK, 400);

		if (isNaN(bountyIndex)) throw apiErrorWithStatusCode(messages.INVALID_PARAMS, 400);

		const subsquidBountiesRes = await fetchSubsquid({
			network,
			query: GET_ALL_BOUNTIES,
			variables: {
				index_in: [bountyIndex],
				limit: LISTING_LIMIT,
				offset: 0
			}
		});

		if (!subsquidBountiesRes?.data?.bounties?.length) throw apiErrorWithStatusCode('No bounty data found', 400);

		const status = subsquidBountiesRes?.data?.bounties?.[0]?.status || null;
		return {
			data: {
				createdAt: subsquidBountiesRes?.data?.bounties?.[0]?.createdAt,
				curator: subsquidBountiesRes?.data?.bounties?.[0]?.curator || '',
				reqAmount: subsquidBountiesRes?.data?.bounties?.[0]?.reward || '0',
				status: status
			},
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
}

const handler: NextApiHandler<{ status: string } | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);

	const { bountyIndex } = req.body;

	const { data, error } = await getBountyInfo({
		bountyIndex,
		network: network
	});

	if (data?.status) {
		return res.status(200).json(data);
	}
	if (error) {
		return res.status(500).json({ message: error || messages.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
