// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { ProposalType } from '~src/global/proposalType';
import { firestore_db } from '~src/services/firebaseInit';
import { EUserCreatedBountiesStatuses, IApiResponse, IUserCreatedBounty } from '~src/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import getClaimedSubmissionsPercentage from '~src/util/getClaimedSubmissionsPercentage';

interface Args {
	status: EUserCreatedBountiesStatuses;
	filterBy: string[];
	page: number;
	network: string;
}

export async function getUserCreatedBounties({
	status,
	filterBy,
	page,
	network
}: Args): Promise<IApiResponse<{ bounties: IUserCreatedBounty[]; totalCount: number } | MessageType>> {
	try {
		if (!network || !isValidNetwork(network)) throw apiErrorWithStatusCode(messages.INVALID_NETWORK, 400);

		if (status && !Object.values(EUserCreatedBountiesStatuses).includes(status)) {
			throw apiErrorWithStatusCode('Invalid Status Param', 400);
		}
		if (filterBy?.length && !!filterBy?.filter((tag: string) => typeof tag !== 'string')?.length) {
			throw apiErrorWithStatusCode('Invalid Tags in Param', 400);
		}
		if (isNaN(page)) {
			throw apiErrorWithStatusCode('Invalid Page Param', 400);
		}

		let userCreatedBountiesSnapshot = firestore_db.collection('user_created_bounties').where('network', '==', network);

		if (filterBy?.length) {
			userCreatedBountiesSnapshot = userCreatedBountiesSnapshot.where('tags', 'array-contains-any', filterBy);
		}
		if (status) {
			userCreatedBountiesSnapshot = userCreatedBountiesSnapshot.where('status', '==', status);
		}

		const totalCreatedBountiesCountSnapshot = await userCreatedBountiesSnapshot.count().get();

		const totalCreatedBountiesSnapshot = await userCreatedBountiesSnapshot
			.limit(LISTING_LIMIT)
			.offset((Number(page) - 1) * Number(LISTING_LIMIT))
			.get();

		const allBounties: IUserCreatedBounty[] = [];

		const promises = totalCreatedBountiesSnapshot?.docs?.map(async (doc) => {
			if (doc?.exists) {
				const data = doc?.data();
				const claimedSubmissionsPercentage = await getClaimedSubmissionsPercentage(doc?.ref, data?.reward || '0');

				const payload: IUserCreatedBounty = {
					claimed_percentage: claimedSubmissionsPercentage || 0,
					content: data?.content,
					created_at: data?.createdAt?.toDate ? String(data?.createdAt?.toDate()) : data?.createdAt,
					deadline_date: data?.deadlineDate.toDate ? String(data?.deadlineDate.toDate()) : data?.deadlineDate,
					history: data?.history || [],
					max_claim: data?.maxClaim,
					post_index: data?.id,
					post_type: data?.proposalType,
					proposer: data?.proposer || '',
					reward: data?.reward || '0',
					source: data?.source || 'Polkassembly',
					status: data?.status,
					submission_guidelines: data?.submissionGuidelines || '',
					tags: data?.tags || [],
					title: data?.title || '',
					twitter_handle: data?.twitterHandle,
					updated_at: data?.updatedAt.toDate ? String(data?.updatedAt.toDate()) : data?.updatedAt,
					user_id: data?.userId
				};
				allBounties?.push(payload);
			}
		});

		await Promise.allSettled(promises);

		return {
			data: { bounties: allBounties || [], totalCount: totalCreatedBountiesCountSnapshot?.data()?.count || 0 },
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
const handler: NextApiHandler<{ bounties: IUserCreatedBounty[]; totalCount: number } | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	try {
		const network = String(req.headers['x-network']);
		if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

		const { status, filterBy, page } = req.body;

		const { data, error } = await getUserCreatedBounties({
			filterBy: filterBy && Array.isArray(JSON.parse(decodeURIComponent(String(filterBy)))) ? JSON.parse(decodeURIComponent(String(filterBy))) : [],
			network: network,
			page: page || 1,
			status: status ? JSON.parse(decodeURIComponent(String(status))) : ''
		});

		if (data) {
			return res.status(200).json(data || []);
		} else if (error) {
			return res.status(500).json({ message: error || messages.API_FETCH_ERROR });
		}
	} catch (err) {
		return res.status(500).json({ message: err || messages.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
