// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { GET_CURVE_DATA_BY_INDEX } from '~src/queries';

async function handler(req: NextApiRequest, res: NextApiResponse<{ curveData: any[] } | MessageType>) {
	storeApiKeyUsage(req);

	try {
		const network = String(req.headers['x-network']);
		if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

		const { blockGte, postId } = req.body;

		if (isNaN(postId) || !blockGte || isNaN(blockGte)) return res.status(400).json({ message: messages.INVALID_PARAMS });

		const subsquidRes = await fetchSubsquid({
			network: network,
			query: GET_CURVE_DATA_BY_INDEX,
			variables: {
				block_gte: blockGte,
				index_eq: Number(postId)
			}
		});

		if (subsquidRes?.data) {
			return res.status(200).json({ curveData: subsquidRes?.data?.curveData || [] });
		} else {
			return res.status(200).json({ curveData: [] });
		}
	} catch (err) {
		return res.status(500).json({ message: err || messages.API_FETCH_ERROR });
	}
}

export default withErrorHandling(handler);
