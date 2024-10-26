// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType } from '~src/auth/types';
import { GET_TALLY_FOR_POST } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { network as AllNetworks } from '~src/global/networkConstants';
import { getSubsquidLikeProposalType } from '~src/global/proposalType';
import messages from '~src/auth/utils/messages';
import { isProposalTypeValid } from '~src/api-utils';

const handler: NextApiHandler<
	| {
			tally: {
				ayes: string;
				nays: string;
				support: string;
				bareAyes: string;
			};
	  }
	| MessageType
> = async (req, res) => {
	storeApiKeyUsage(req);
	try {
		const network = String(req.headers['x-network']);

		if (!network || !Object.values(AllNetworks).includes(network)) {
			return res.status(400).json({ message: messages.INVALID_NETWORK });
		}
		const { proposalType, postId } = req.body;

		if (isNaN(postId) || !proposalType || !isProposalTypeValid(proposalType)) {
			return res.status(500).json({ message: messages.INVALID_PARAMS });
		}

		const subsquidRes = await fetchSubsquid({
			network: network,
			query: GET_TALLY_FOR_POST,
			variables: {
				index_eq: postId,
				type: getSubsquidLikeProposalType(proposalType)
			}
		});

		const data = subsquidRes?.data?.proposals?.[0]?.tally || null;
		return res.status(200).json({ tally: data });
	} catch (err) {
		return res.status(500).json({ message: err || messages.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
