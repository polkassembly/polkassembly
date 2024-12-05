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
import { IChildBountiesResponse, IChildBounty } from '~src/types';
import messages from '~src/auth/utils/messages';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { getProposalTypeTitle, ProposalType } from '~src/global/proposalType';
import { getSubSquareContentAndTitle } from '../posts/subsqaure/subsquare-content';
import getEncodedAddress from '~src/util/getEncodedAddress';

export const getAllchildBountiesFromBountyIndex = async ({
	parentBountyIndex,
	network,
	curator,
	status
}: {
	parentBountyIndex: number;
	network: string;
	status?: string;
	curator?: string;
}) => {
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

		if (status) {
			variables.status_eq = status;
		}
		if (curator && !!getEncodedAddress(curator, network)) {
			variables.curator_eq = getEncodedAddress(curator, network);
		}

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

		const childBountiesProposals = subsquidData?.proposals || [];

		const allChildBountiesIndexes = childBountiesProposals.map((childBounty: { index: number }) => childBounty?.index);

		const chunkArray = (arr: any[], chunkSize: number) => {
			const chunks = [];
			for (let i = 0; i < arr.length; i += chunkSize) {
				chunks.push(arr.slice(i, i + chunkSize));
			}
			return chunks;
		};

		const chunks = chunkArray(allChildBountiesIndexes, 30);

		const childBountiesDocsPromises = chunks.map((chunk) => postsByTypeRef(network, ProposalType.CHILD_BOUNTIES).where('id', 'in', chunk).get());

		const childBountiesDocsSnapshots = await Promise.all(childBountiesDocsPromises);

		const childBountiesDocs = childBountiesDocsSnapshots.flatMap((snapshot) => snapshot.docs);

		const childBountiesPromises = childBountiesProposals?.map(async (subsquidChildBounty: any) => {
			const payload: IChildBounty = {
				categories: [],
				createdAt: subsquidChildBounty?.createdAt,
				curator: subsquidChildBounty?.curator || '',
				description: subsquidChildBounty?.description || '',
				index: subsquidChildBounty?.index,
				payee: subsquidChildBounty?.payee || '',
				reward: subsquidChildBounty?.reward,
				source: 'polkassembly',
				status: subsquidChildBounty?.status,
				title: ''
			};

			childBountiesDocs?.map((childBounty) => {
				if (childBounty.exists) {
					const data = childBounty.data();
					if (data?.id === subsquidChildBounty.index) {
						payload.title = data?.title || '';
						payload.categories = data?.tags || [];
					}
				}
			});

			if (!payload?.title.length) {
				const subsqaureRes = await getSubSquareContentAndTitle(ProposalType.CHILD_BOUNTIES, network, subsquidChildBounty?.index);
				payload.title = subsqaureRes?.title || getProposalTypeTitle(ProposalType.CHILD_BOUNTIES) || '';
				payload.source = subsqaureRes?.title?.length ? 'subsquare' : 'polkassembly';
			}
			return payload;
		});

		const resolvedPromises = await Promise.allSettled(childBountiesPromises);

		resolvedPromises.map((promise) => {
			if (promise?.status == 'fulfilled') {
				resObj?.child_bounties.push(promise.value);
			}
		});

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

	const { parentBountyIndex, status, curator } = req.body;

	const network = String(req.headers['x-network']);

	const numPostId = Number(parentBountyIndex);
	const { data, error } = await getAllchildBountiesFromBountyIndex({
		curator: curator || '',
		network: network,
		parentBountyIndex: numPostId,
		status: status || ''
	});

	if (data) {
		return res.status(200).json(data);
	} else {
		return res.status(400).json({ error: error });
	}
}

export default withErrorHandling(handler);
