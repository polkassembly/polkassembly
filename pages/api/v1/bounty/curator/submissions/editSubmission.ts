// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BN } from 'bn.js';
import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { firestore_db } from '~src/services/firebaseInit';
import { getBountyInfo } from '../../getBountyInfoFromIndex';
import getBountiesCustomStatuses from '~src/util/getBountiesCustomStatuses';
import { EBountiesStatuses } from '~src/components/Bounties/BountiesListing/types/types';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { ESubmissionStatus } from '~src/types';

const ZERO_BN = new BN(0);

const handler: NextApiHandler<MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	try {
		const network = String(req.headers['x-network']);
		if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

		const { title, content, tags, link, reqAmount, proposerAddress, parentBountyIndex } = req.body;
		if (
			!title?.length ||
			!content?.length ||
			!reqAmount ||
			new BN(reqAmount || 0).eq(ZERO_BN) ||
			!proposerAddress?.length ||
			(link?.length && !(link as string)?.startsWith('https:')) ||
			(tags?.length && !!tags?.some((tag: string) => typeof tag !== 'string')) ||
			isNaN(parentBountyIndex)
		) {
			return res.status(400).json({ message: messages?.INVALID_PARAMS });
		}

		const token = getTokenFromReq(req);
		if (!token) return res.status(400).json({ message: messages?.INVALID_JWT });

		const user = await authServiceInstance.GetUser(token);
		if (!user) return res.status(403).json({ message: messages.UNAUTHORISED });

		const { data } = await getBountyInfo({
			bountyIndex: parentBountyIndex,
			network: network
		});

		if (!getBountiesCustomStatuses(EBountiesStatuses.ACTIVE).includes(data?.status || '')) {
			return res.status(400).json({ message: messages?.PARENT_BOUNTY_IS_NOT_ACTIVE });
		}

		const submissionSnapshot = firestore_db.collection('curator_submissions');

		const submissionDocs = await submissionSnapshot
			?.where('proposer', '==', getEncodedAddress(proposerAddress, network))
			.where('parent_bounty_index', '==', parentBountyIndex)
			.where('status', '==', ESubmissionStatus.PENDING)
			.limit(1)
			.get();

		if (submissionDocs?.empty) {
			return res.status(403).json({ message: messages?.CHILD_BOUNTY_SUBMISSION_NOT_EXISTS });
		}

		const submissionDocRef = submissionDocs?.docs[0].ref;

		const payload = {
			content,
			link: link || '',
			parent_bounty_index: parentBountyIndex,
			proposer: getEncodedAddress(proposerAddress, network) || '',
			req_amount: reqAmount || '0',
			tags: tags || [],
			title: title || '',
			updatedAt: new Date()
		};

		await submissionDocRef?.update(payload);

		return res.status(200).json({ message: messages?.CHILD_BOUNTY_SUBMISSION_EDITED_SUCCESSFULLY });
	} catch (err) {
		return res.status(500).json({ message: err || messages.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
