// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import { getProposalTypeTitle, getSubsquidLikeProposalType, ProposalType } from '~src/global/proposalType';
import { GET_RECEIVED_CURATOR_REQUESTS, GET_SENT_CURATOR_REQUESTS } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { BOUNTIES_LISTING_LIMIT } from '~src/global/listingLimit';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { getSubSquareContentAndTitle } from 'pages/api/v1/posts/subsqaure/subsquare-content';
import { EPendingCuratorReqType, IPendingCuratorReq } from '~src/types';

interface ISubsquidBounty {
	proposer: string;
	index: number;
	status: string;
	reward: string;
	payee: string;
	curator: string;
	createdAt: string;
}

const handler: NextApiHandler<{ data: IPendingCuratorReq[]; totalCount: number } | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);

	const { page, userAddress, proposalType, reqType } = req.body;

	try {
		if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

		if (
			isNaN(page) ||
			!userAddress?.length ||
			!getEncodedAddress(userAddress, network) ||
			![EPendingCuratorReqType.RECEIVED, EPendingCuratorReqType?.SENT].includes(reqType) ||
			![ProposalType.BOUNTIES, ProposalType.CHILD_BOUNTIES].includes(proposalType || '')
		)
			return res.status(400).json({ message: messages.INVALID_PARAMS });

		const encodedUserAddress = getEncodedAddress(userAddress, network);

		const subsquidBountiesRes = await fetchSubsquid({
			network,
			query: reqType == EPendingCuratorReqType.RECEIVED ? GET_RECEIVED_CURATOR_REQUESTS : GET_SENT_CURATOR_REQUESTS,
			variables: {
				address: encodedUserAddress,
				limit: BOUNTIES_LISTING_LIMIT,
				offset: BOUNTIES_LISTING_LIMIT * (page - 1),
				type_eq: getSubsquidLikeProposalType(proposalType)
			}
		});

		if (!subsquidBountiesRes?.data?.proposals?.length) return res.status(400).json({ message: 'No Curator Request Sent!' });

		const subsquidBountiesData = subsquidBountiesRes?.data?.proposals || [];

		const subsquidbountiesIndexes = subsquidBountiesData.map((bounty: { index: number }) => bounty?.index);

		const postDocs = await postsByTypeRef(network, proposalType).where('id', 'in', subsquidbountiesIndexes).get();

		const bountiesPromises = subsquidBountiesData.map(async (item: ISubsquidBounty) => {
			const payload: IPendingCuratorReq = {
				categories: [],
				createdAt: item?.createdAt,
				curator: item?.curator,
				index: item.index,
				payee: item?.payee,
				proposalType: proposalType,
				proposer: item?.proposer,
				reqType: reqType,
				reward: item?.reward,
				source: 'polkassembly',
				status: item?.status,
				title: ''
			};

			postDocs?.docs?.map((doc) => {
				if (doc?.exists) {
					const bountyData = doc?.data();
					if (bountyData?.id == item.index) {
						payload.title = bountyData?.title || '';
						payload.categories = bountyData?.tags || [];
					}
				}
			});

			if (!payload?.title) {
				const res = await getSubSquareContentAndTitle(proposalType, network, item?.index);
				payload.title = res?.title || getProposalTypeTitle(proposalType);
				payload.source = res?.title?.length ? 'subsquare' : 'polkassembly';
			}

			return payload;
		});

		const results = await Promise.allSettled(bountiesPromises);

		const resolvedResults: IPendingCuratorReq[] = [];

		results?.map((bounty) => {
			if (bounty.status == 'fulfilled') {
				resolvedResults.push(bounty?.value);
			}
		});

		return {
			data: { data: resolvedResults || [], totalCount: resolvedResults?.length || 0 },
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
};

export default withErrorHandling(handler);
