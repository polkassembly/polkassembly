// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType } from '~src/auth/types';
import { GET_STATUS_WISE_REF_OUTCOME } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { network as AllNetworks } from '~src/global/networkConstants';
import messages from '~src/auth/utils/messages';
import { IGetStatusWiseRefOutcome } from '~src/components/GovAnalytics/types';

const handler: NextApiHandler<IGetStatusWiseRefOutcome | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);
	try {
		const network = String(req.headers['x-network']);
		if (!network || !Object.values(AllNetworks).includes(network)) {
			return res.status(400).json({ message: messages.INVALID_NETWORK });
		}

		const { trackId = null } = req.body;

		const variables: any = {};
		if (trackId !== null) {
			variables.trackNo = trackId;
		}

		const subsquidRes = await fetchSubsquid({
			network: network,
			query: GET_STATUS_WISE_REF_OUTCOME,
			variables: variables
		});
		const rawData = subsquidRes?.data || {};

		const transformedData: Record<string, number> = Object.keys(rawData).reduce(
			(acc, key) => {
				acc[key] = rawData[key]?.totalCount;
				return acc;
			},
			{} as Record<string, number>
		);
		return res.status(200).json({ statusCounts: transformedData });
	} catch (err) {
		return res.status(500).json({ message: err || messages.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
