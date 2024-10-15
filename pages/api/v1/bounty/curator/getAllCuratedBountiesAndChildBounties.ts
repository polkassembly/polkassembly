// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { BN } from 'bn.js';
import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import { getProposalTypeTitle, ProposalType } from '~src/global/proposalType';
import { bountyStatus } from '~src/global/statuses';
import { GET_ALL_BOUNTIES, GET_ALL_CHILD_BOUNTIES_BY_PARENT_INDEX } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { getSubSquareContentAndTitle } from '../../posts/subsqaure/subsquare-content';
import { IApiResponse } from '~src/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import { IBountyListing } from '~src/components/Bounties/BountiesListing/types/types';
import { BOUNTIES_LISTING_LIMIT } from '~src/global/listingLimit';
import getEncodedAddress from '~src/util/getEncodedAddress';

interface ISubsquidBounty {
	proposer: string;
	index: number;
	status: string;
	reward: string;
	payee: string;
	curator: string;
	createdAt: string;
}

const ZERO_BN = new BN(0);

interface Args {
	page: number;
	network: string;
	curatorAddress: string;
}

export async function getAllBounties({ page, network, curatorAddress }: Args): Promise<IApiResponse<{ bounties: IBountyListing[]; totalBountiesCount: number }>> {
	try {
		if (!network || !isValidNetwork(network)) throw apiErrorWithStatusCode(messages.INVALID_NETWORK, 400);

		if (isNaN(page) || !curatorAddress?.length) throw apiErrorWithStatusCode(messages.INVALID_PARAMS, 400);

		let totalBounties = 0;

		const encodedCuratorAddress = getEncodedAddress(curatorAddress, network);

		const subsquidBountiesRes = await fetchSubsquid({
			network,
			query: GET_ALL_BOUNTIES,
			variables: {
				curator_eq: encodedCuratorAddress,
				limit: 10,
				offset: BOUNTIES_LISTING_LIMIT * (page - 1)
			}
		});

		if (!subsquidBountiesRes?.data?.bounties?.length) throw apiErrorWithStatusCode('No bounty data found', 400);

		const subsquidBountiesData = subsquidBountiesRes?.data?.bounties || [];
		totalBounties = totalBounties > 0 ? totalBounties : subsquidBountiesRes?.data?.totalBounties?.totalCount || 0;

		const subsquidbountiesIndexes = subsquidBountiesData.map((bounty: { index: number }) => bounty?.index);

		const bountiesDocs = await postsByTypeRef(network, ProposalType.BOUNTIES).where('id', 'in', subsquidbountiesIndexes).get();

		const bountiesPromises = subsquidBountiesData.map(async (subsquidBounty: ISubsquidBounty) => {
			const subsquidChildBountiesRes = await fetchSubsquid({
				network,
				query: GET_ALL_CHILD_BOUNTIES_BY_PARENT_INDEX,
				variables: {
					parentBountyIndex_eq: subsquidBounty?.index
				}
			});

			const subsquidChildBountyData = subsquidChildBountiesRes?.data?.proposals || [];

			let claimedAmount = ZERO_BN;
			let totalChildBountiesCount = 0;

			subsquidChildBountyData.map((childBounty: { status: string; reward: string; curator: string }) => {
				const amount = new BN(childBounty?.reward || 0);

				if ([bountyStatus.CLAIMED, bountyStatus.AWARDED].includes(childBounty.status)) {
					if ([bountyStatus.CLAIMED].includes(childBounty?.status) && subsquidBounty?.curator === childBounty?.curator) {
						totalChildBountiesCount = totalChildBountiesCount + 1;
					}
					claimedAmount = claimedAmount.add(amount);
				}
			});

			const payload: IBountyListing = {
				categories: [],
				claimedAmount: claimedAmount.toString(),
				createdAt: subsquidBounty?.createdAt,
				curator: subsquidBounty?.curator,
				index: subsquidBounty.index,
				payee: subsquidBounty?.payee,
				proposer: subsquidBounty?.proposer,
				reward: subsquidBounty?.reward,
				source: 'polkassembly',
				status: subsquidBounty?.status,
				title: '',
				totalChildBountiesCount: totalChildBountiesCount || 0
			};

			bountiesDocs?.docs?.map((bountyDoc) => {
				if (bountyDoc?.exists) {
					const bountyData = bountyDoc?.data();
					if (bountyData?.id == subsquidBounty.index) {
						payload.title = bountyData?.title || '';
						payload.categories = bountyData?.tags || [];
					}
				}
			});

			if (!payload?.title) {
				const res = await getSubSquareContentAndTitle(ProposalType.BOUNTIES, network, subsquidBounty?.index);
				payload.title = res?.title || getProposalTypeTitle(ProposalType.BOUNTIES);
				payload.source = res?.title?.length ? 'subsquare' : 'polkassembly';
			}

			return payload;
		});

		const bountiesResults = await Promise.allSettled(bountiesPromises);

		const bounties: IBountyListing[] = [];

		bountiesResults?.map((bounty) => {
			if (bounty.status == 'fulfilled') {
				bounties.push(bounty?.value);
			}
		});

		return {
			data: { bounties: bounties || [], totalBountiesCount: totalBounties },
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
const handler: NextApiHandler<{ bounties: IBountyListing[]; totalBountiesCount: number } | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);

	const { page, userAddress } = req.body;

	const { data, error } = await getAllBounties({
		curatorAddress: userAddress || '',
		network: network,
		page: page || 1
	});

	if (data?.bounties) {
		return res.status(200).json(data);
	}
	if (error) {
		return res.status(500).json({ message: error || messages.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
