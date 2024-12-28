// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import { firestore_db } from '~src/services/firebaseInit';
import { EUserCreatedBountiesStatuses, IChildBountySubmission } from '~src/types';
import { LISTING_LIMIT } from '~src/global/listingLimit';

const handler: NextApiHandler<{ submissions: IChildBountySubmission[]; totalCount: number } | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	try {
		const network = String(req.headers['x-network']);
		if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

		const { parentBountyIndex, page = 1 } = req.body;
		if (isNaN(parentBountyIndex)) {
			return res.status(400).json({ message: 'Invalid Parent Bounty Index' });
		}
		if (isNaN(page) || !page) {
			return res.status(400).json({ message: 'Invalid Page Param' });
		}

		const userCreatedBountySnapshot = await firestore_db
			.collection('user_created_bounties')
			.where('network', '==', network)
			.where('id', '==', parentBountyIndex)
			.orderBy('id', 'desc')
			.limit(1)
			.get();

		if (userCreatedBountySnapshot?.empty) {
			return res.status(400).json({ message: `No bounty found with id-${parentBountyIndex}` });
		}

		if (userCreatedBountySnapshot?.docs?.[0]?.data()?.status !== EUserCreatedBountiesStatuses.ACTIVE) {
			return res.status(400).json({ message: `Bounty-${parentBountyIndex} is not active for submissions` });
		}
		const submissionsRef = userCreatedBountySnapshot?.docs?.[0]?.ref?.collection('submissions');

		const submissionsShapshot = await submissionsRef
			.limit(LISTING_LIMIT)
			.offset((Number(page) - 1) * Number(LISTING_LIMIT))
			.get();

		const allSubmissionCountSnapshot = await submissionsRef?.count().get();
		const allSubmissionCount = allSubmissionCountSnapshot?.data()?.count;

		if (submissionsShapshot?.empty) {
			return res.status(200).json({ submissions: [], totalCount: allSubmissionCount || 0 });
		}

		const submissions: IChildBountySubmission[] = [];
		submissionsShapshot?.docs?.map((doc) => {
			if (doc?.exists) {
				const data = doc?.data();

				const payload: IChildBountySubmission = {
					content: data?.content || '',
					createdAt: data?.created_at?.toDate ? data?.created_at?.toDate() : data?.created_at,
					id: data?.id,
					link: data?.link || '',
					parentBountyIndex: data?.parent_bounty_index,
					proposer: data?.proposer,
					reqAmount: data?.req_amount,
					status: data?.status,
					tags: data?.tags || [],
					title: data?.title || '',
					updatedAt: data?.updated_at?.toDate ? data?.updated_at.toDate() : data?.updated_at,
					userId: data?.user_id
				};
				submissions?.push(payload);
			}
		});

		return res.status(200).json({ submissions: submissions || [], totalCount: allSubmissionCount || 0 });
	} catch (err) {
		return res.status(500).json({ message: err || messages.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
