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
import { getBountyInfo } from '../../getBountyInfoFromIndex';
import getBountiesCustomStatuses from '~src/util/getBountiesCustomStatuses';
import { EBountiesStatuses } from '~src/components/Bounties/BountiesListing/types/types';
import { IChildBountySubmission } from '~src/types';

const handler: NextApiHandler<IChildBountySubmission[] | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	try {
		const network = String(req.headers['x-network']);
		if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

		const { parentBountyIndex } = req.body;

		const { data } = await getBountyInfo({
			bountyIndex: parentBountyIndex,
			network: network
		});

		if (!getBountiesCustomStatuses(EBountiesStatuses.ACTIVE).includes(data?.status || '')) {
			return res.status(400).json({ message: messages?.PARENT_BOUNTY_IS_NOT_ACTIVE });
		}

		const submissionsDocs = await firestore_db.collection('curator_submissions').get();

		if (submissionsDocs?.empty) {
			return res.status(403).json({ message: messages?.NO_CHILD_BOUNTY_SUBMISSION_FOUND });
		}

		const allSubmissions: IChildBountySubmission[] = [];

		submissionsDocs?.docs?.map((doc) => {
			if (doc?.exists) {
				const data = doc?.data();

				const payload: IChildBountySubmission = {
					content: data?.content || '',
					createdAt: data?.created_at?.toDate ? data?.created_at?.toDate() : data?.created_at,
					link: data?.link || '',
					parentBountyIndex: data?.parent_bounty_index,
					proposer: data?.proposer,
					reqAmount: data?.req_amount,
					status: data?.staus,
					tags: data?.tags || [],
					title: data?.title || '',
					updatedAt: data?.updated_at?.toDate ? data?.updated_at.toDate() : data?.updated_at
				};

				allSubmissions.push(payload);
			}
		});

		return res.status(200).json(allSubmissions);
	} catch (err) {
		return res.status(500).json({ message: err || messages.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
