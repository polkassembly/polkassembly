// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { GET_ALL_CHILD_BOUNTIES_BY_PARENT_INDEX } from '~src/queries';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { getSubSquareContentAndTitle } from '../posts/subsqaure/subsquare-content';
import { ProposalType } from '~src/global/proposalType';
import { IChildBountiesResponse } from '~src/types';
import messages from '~src/auth/utils/messages';

export const getAllchildBountiesFromBountyIndex = async ({ parentBountyIndex, network }: { parentBountyIndex: number; network: string }) => {
	if (!network || !isValidNetwork(network)) {
		throw apiErrorWithStatusCode(messages.INVALID_NETWORK, 400);
	}

	const numPostId = Number(parentBountyIndex);
	if (isNaN(numPostId) || numPostId < 0) {
		throw apiErrorWithStatusCode(`The postId "${parentBountyIndex}" is invalid.`, 400);
	}

	try {
		const variables: any = {
			parentBountyIndex_eq: numPostId
		};

		const subsquidRes = await fetchSubsquid({
			network,
			query: GET_ALL_CHILD_BOUNTIES_BY_PARENT_INDEX,
			variables
		});

		const subsquidData = subsquidRes?.data;
		if (!subsquidData || !subsquidData.proposals || !Array.isArray(subsquidData.proposals) || !subsquidData.proposalsConnection) {
			throw apiErrorWithStatusCode(`Child bounties of bounty index "${parentBountyIndex}" is not found.`, 404);
		}

		const resObj: IChildBountiesResponse = {
			child_bounties: [],
			child_bounties_count: subsquidData?.proposalsConnection?.totalCount || 0
		};

		for (const childBounty of subsquidData.proposals) {
			const subsquireRes = await getSubSquareContentAndTitle(ProposalType.CHILD_BOUNTIES, network, childBounty.index);

			resObj.child_bounties.push({
				description: childBounty.description,
				index: childBounty.index,
				reward: childBounty?.reward,
				status: childBounty.status,
				title: subsquireRes?.title || ''
			});
		}

		return {
			data: resObj,
			error: null,
			status: 200
		};
	} catch (error) {
		return {
			data: null,
			error: error.message || messages.API_FETCH_ERROR,
			status: Number(error.name) || 500
		};
	}
};

async function handler(req: NextApiRequest, res: NextApiResponse<IChildBountiesResponse | { error: string }>) {
	storeApiKeyUsage(req);

	const { parentBountyIndex } = req.body;

	const network = String(req.headers['x-network']);

	const numPostId = Number(parentBountyIndex);
	const { data, error } = await getAllchildBountiesFromBountyIndex({ network: network, parentBountyIndex: numPostId });

	if (data) {
		return res.status(200).json(data);
	} else {
		return res.status(400).json({ error: error });
	}
}

export default withErrorHandling(handler);
