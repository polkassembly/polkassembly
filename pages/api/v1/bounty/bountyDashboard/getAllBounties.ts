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
import { EBountiesStatuses, IBountyListing } from '~src/components/Bounties/BountiesListing/types/types';
import getBountiesCustomStatuses from '~src/util/getBountiesCustomStatuses';

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

const BOUNTIES_LISTING_LIMIT = 10;

const bountyStatuses = [
	bountyStatus.ACTIVE,
	bountyStatus.AWARDED,
	bountyStatus.CANCELLED,
	bountyStatus.CLAIMED,
	bountyStatus.EXTENDED,
	bountyStatus.PROPOSED,
	bountyStatus.REJECTED
];

interface Args {
	categories: string[];
	status: EBountiesStatuses;
	page: number;
	network: string;
}

export async function getAllBounties({ categories, page, status, network }: Args): Promise<IApiResponse<{ bounties: IBountyListing[]; totalBountiesCount: number }>> {
	try {
		if (!network || !isValidNetwork(network)) throw apiErrorWithStatusCode(messages.INVALID_NETWORK, 400);

		const statuses = getBountiesCustomStatuses(status);

		if (isNaN(page) || (statuses?.length && !!statuses?.some((status: string) => !bountyStatuses.includes(status)))) throw apiErrorWithStatusCode(messages.INVALID_PARAMS, 400);

		const bountiesIndexes: number[] = [];
		let totalBounties = 0;
		let bountiesDocs: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData, FirebaseFirestore.DocumentData> | null = null;

		if (categories?.length && Array.isArray(categories)) {
			bountiesDocs = await postsByTypeRef(network, ProposalType.BOUNTIES)
				.where('tags', 'array-contains-any', categories)
				.limit(Number(BOUNTIES_LISTING_LIMIT))
				.offset((Number(page) - 1) * Number(BOUNTIES_LISTING_LIMIT))
				.get();

			bountiesDocs?.docs?.map((doc: any) => {
				if (doc.exists) {
					const data = doc.data();
					bountiesIndexes.push(Number(data?.id));
				}
			});

			totalBounties = (await postsByTypeRef(network, ProposalType.BOUNTIES).where('tags', 'array-contains-any', categories).count().get()).data().count;
		}

		const variables: any = {
			limit: 10,
			offset: BOUNTIES_LISTING_LIMIT * (page - 1)
		};
		if (statuses.length) {
			variables.status_in = statuses;
		}
		if (bountiesIndexes?.length) {
			variables.index_in = bountiesIndexes;
		}
		const subsquidBountiesRes = await fetchSubsquid({
			network,
			query: GET_ALL_BOUNTIES,
			variables: variables
		});

		if (!subsquidBountiesRes?.data?.bounties?.length) throw apiErrorWithStatusCode('No bounty data found', 400);

		const subsquidBountiesData = subsquidBountiesRes?.data?.bounties || [];
		totalBounties = totalBounties > 0 ? totalBounties : subsquidBountiesRes?.data?.totalBounties?.totalCount || 0;

		const subsquidbountiesIndexes = subsquidBountiesData.map((bounty: { index: number }) => bounty?.index);

		bountiesDocs = bountiesDocs ? bountiesDocs : await postsByTypeRef(network, ProposalType.BOUNTIES).where('id', 'in', subsquidbountiesIndexes).get();

		const bountiesPromises = subsquidBountiesData.map(async (subsquidBounty: ISubsquidBounty) => {
			const subsquidChildBountiesRes = await fetchSubsquid({
				network,
				query: GET_ALL_CHILD_BOUNTIES_BY_PARENT_INDEX,
				variables: {
					parentBountyIndex_eq: subsquidBounty?.index
				}
			});

			const subsquidChildBountyData = subsquidChildBountiesRes?.data?.proposals || [];
			const totalChildBountiesCount = subsquidChildBountiesRes?.data?.proposalsConnection?.totalCount || 0;

			let claimedAmount = ZERO_BN;

			subsquidChildBountyData.map((childBounty: { status: string; reward: string }) => {
				const amount = new BN(childBounty?.reward || 0);

				if ([bountyStatus.CLAIMED].includes(childBounty.status)) {
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

	const { page, status, categories } = req.body;

	const { data, error } = await getAllBounties({
		categories: categories && Array.isArray(JSON.parse(decodeURIComponent(String(categories)))) ? JSON.parse(decodeURIComponent(String(categories))) : [],
		network: network,
		page: page || 1,
		status: status
	});

	if (data?.bounties) {
		return res.status(200).json(data);
	}
	if (error) {
		return res.status(500).json({ message: error || messages.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
