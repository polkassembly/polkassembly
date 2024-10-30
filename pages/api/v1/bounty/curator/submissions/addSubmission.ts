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
import { EChildbountySubmissionStatus } from '~src/types';

const ZERO_BN = new BN(0);

const handler: NextApiHandler<MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	try {
		const network = String(req.headers['x-network']);
		if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

		const { title, content, tags, link, reqAmount, proposerAddress, parentBountyIndex } = req.body;

		if (!reqAmount || new BN(reqAmount || 0).eq(ZERO_BN)) {
			return res.status(400).json({ message: 'Invalid Requested Amount' });
		}
		if (!proposerAddress?.length || !getEncodedAddress(proposerAddress, network)) {
			return res.status(400).json({ message: 'Invalid Proposer Address' });
		}
		if (isNaN(parentBountyIndex)) {
			return res.status(400).json({ message: 'Invalid Parent Bounty Index' });
		}
		if (!title?.length || !content?.length) {
			return res.status(400).json({ message: 'Title or Content is Missing in request body' });
		}
		if (isNaN(parentBountyIndex)) {
			return res.status(400).json({ message: 'Invalid Parent Bounty Index' });
		}
		if ((link?.length && !(link as string)?.startsWith('https:')) || (tags?.length && !!tags?.some((tag: string) => typeof tag !== 'string'))) {
			return res.status(400).json({ message: messages.INVALID_PARAMS });
		}

		const token = getTokenFromReq(req);
		if (!token) return res.status(401).json({ message: messages?.INVALID_JWT });

		const user = await authServiceInstance.GetUser(token);
		if (!user) return res.status(401).json({ message: messages.UNAUTHORISED });

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
			.where('status', '==', EChildbountySubmissionStatus.PENDING)
			.where('user_id', '==', user?.id)
			.get();

		if (!submissionDocs?.empty) {
			return res.status(404).json({ message: messages?.CHILD_BOUNTY_SUBMISSION_ALREADY_EXISTS });
		}
		const submissionDocRef = submissionSnapshot?.doc();

		const payload = {
			content,
			created_at: new Date(),
			id: submissionDocRef?.id,
			link: link || '',
			parent_bounty_index: parentBountyIndex,
			proposer: getEncodedAddress(proposerAddress, network) || '',
			req_amount: reqAmount || '0',
			status: EChildbountySubmissionStatus.PENDING,
			tags: tags || [],
			title: title || '',
			updated_at: new Date(),
			user_id: user?.id
		};

		await submissionDocRef?.set(payload, { merge: true });

		return res.status(200).json({ message: messages?.CHILD_BOUNTY_SUBMISSION_DONE });
	} catch (err) {
		return res.status(500).json({ message: err || messages.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
