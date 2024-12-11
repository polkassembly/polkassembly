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
import { EUserCreatedBountiesStatuses, IUserCreatedBounty } from '~src/types';

const handler: NextApiHandler<IUserCreatedBounty[] | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	try {
		const network = String(req.headers['x-network']);
		if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

		const { status, tags } = req.body;

		let userCreatedBountiesSnapshot = firestore_db.collection('user_created_bounties').where('network', '==', network);

		if (
			status &&
			![EUserCreatedBountiesStatuses.ACTIVE, EUserCreatedBountiesStatuses?.CANCELLED, EUserCreatedBountiesStatuses?.CLAIMED, EUserCreatedBountiesStatuses?.CLOSED].includes(status)
		) {
			return res.status(400).json({ message: 'Invalid Status Param' });
		}

		if (tags?.length && !!tags?.filter((tag: string) => typeof tag !== 'string')?.length) {
			return res.status(400).json({ message: 'Invalid Tags Param' });
		}

		if (tags?.length) {
			userCreatedBountiesSnapshot = userCreatedBountiesSnapshot.where('tags', 'array-contains-any', tags);
		}

		if (status) {
			userCreatedBountiesSnapshot = userCreatedBountiesSnapshot.where('status', '==', status);
		}

		const totalCreatedBountiesSnapshot = await userCreatedBountiesSnapshot.get();
		const allBounties: IUserCreatedBounty[] = [];

		//TODO: pie graph percentage acc to submission count
		totalCreatedBountiesSnapshot?.docs?.map((doc) => {
			if (doc?.exists) {
				const data = doc?.data();
				const payload: IUserCreatedBounty = {
					content: data?.content,
					createdAt: data?.createdAt,
					deadlineDate: data?.deadlineDate,
					id: data?.id,
					maxClaim: data?.maxClaim,
					proposalType: data?.proposalType,
					proposer: data?.proposer || '',
					reward: data?.reward || '0',
					status: data?.status,
					submissionGuidelines: data?.submissionGuidelines || '',
					tags: data?.tags || [],
					title: data?.title || '',
					twitterHandle: data?.twitterHandle,
					updatedAt: data?.updatedAt,
					userId: data?.userId
				};
				allBounties?.push(payload);
			}
		});

		return res.status(200).json(allBounties);
	} catch (err) {
		return res.status(500).json({ message: err || messages.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
