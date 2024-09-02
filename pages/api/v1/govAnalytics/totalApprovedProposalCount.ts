// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType } from '~src/auth/types';
import { GET_TOTAL_APPROVED_PROPOSALS } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { network as AllNetworks } from '~src/global/networkConstants';
import messages from '~src/auth/utils/messages';
import { IGetTotalApprovedProposalCount } from '~src/components/GovAnalytics/types';

const handler: NextApiHandler<IGetTotalApprovedProposalCount | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);
	try {
		const network = String(req.headers['x-network']);
		if (!network || !Object.values(AllNetworks).includes(network)) {
			return res.status(400).json({ message: messages.INVALID_NETWORK });
		}
		const subsquidRes = await fetchSubsquid({
			network: network,
			query: GET_TOTAL_APPROVED_PROPOSALS
		});
		const data = subsquidRes?.data?.proposalsConnection?.totalCount || 0;
		return res.status(200).json({ totalCount: data });
	} catch (err) {
		return res.status(500).json({ message: err || messages.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
