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
import getEncodedAddress from '~src/util/getEncodedAddress';
import { EUserCreatedBountiesStatuses, EUserCreatedBountyActions } from '~src/types';
import checkIsUserCreatedBountySubmissionValid from '~src/util/userCreatedBounties/checkIsUserCreatedBountySubmissionValid';
import getSubstrateAddress from '~src/util/getSubstrateAddress';

const ZERO_BN = new BN(0);

const handler: NextApiHandler<MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	try {
		const network = String(req.headers['x-network']);
		if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

		const { title, content, tags, link, reqAmount, proposerAddress, parentBountyIndex, submissionId, action } = req.body;
		const substrateProposerAddr = getSubstrateAddress(proposerAddress);

		if (![EUserCreatedBountyActions.EDIT, EUserCreatedBountyActions.DELETE].includes(action)) {
			return res.status(400).json({ message: 'Invalid Action Param' });
		}
		if (!proposerAddress?.length || !getEncodedAddress(proposerAddress, network)) {
			return res.status(400).json({ message: 'Invalid Proposer Address' });
		}

		if (isNaN(parentBountyIndex)) {
			return res.status(400).json({ message: 'Invalid Parent Bounty Index' });
		}
		if (!submissionId?.length) {
			return res.status(400).json({ message: `Invalid Submission Id-${submissionId}` });
		}

		if (action != EUserCreatedBountyActions.DELETE) {
			if (!reqAmount || new BN(reqAmount || 0).eq(ZERO_BN)) {
				return res.status(400).json({ message: 'Invalid Requested Amount' });
			}

			if (!title?.length || !content?.length) {
				return res.status(400).json({ message: 'Title or Content is Missing in request body' });
			}

			if ((link?.length && !(link as string)?.startsWith('https:')) || (tags?.length && !!tags?.some((tag: string) => typeof tag !== 'string'))) {
				return res.status(400).json({ message: messages.INVALID_PARAMS });
			}
		}

		const token = getTokenFromReq(req);
		if (!token) return res.status(401).json({ message: messages?.INVALID_JWT });

		const user = await authServiceInstance.GetUser(token);
		if (!user) return res.status(401).json({ message: messages.UNAUTHORISED });

		const userCreatedBountySnapshot = await firestore_db.collection('user_created_bounties').where('network', '==', network).where('id', '==', parentBountyIndex).limit(1).get();

		if (userCreatedBountySnapshot?.empty) {
			return res.status(400).json({ message: `No bounty found with id-${parentBountyIndex}` });
		}

		if (userCreatedBountySnapshot?.docs?.[0]?.data()?.status !== EUserCreatedBountiesStatuses.ACTIVE) {
			return res.status(400).json({ message: `Parent Bounty-${parentBountyIndex} is not active for ${action} submission` });
		}

		const submissionsRef = userCreatedBountySnapshot?.docs?.[0]?.ref?.collection('submissions');

		const { submissionAlreadyExists, deadlineDateExpired } = await checkIsUserCreatedBountySubmissionValid(
			userCreatedBountySnapshot?.docs?.[0]?.ref,
			Number(user?.id),
			substrateProposerAddr || proposerAddress
		);

		if (!submissionAlreadyExists) {
			return res.status(400).json({ message: `Submission does not exists for bounty id-${parentBountyIndex}` });
		}
		if (deadlineDateExpired) {
			return res.status(400).json({ message: "You can't edit or delete your submission after deadline date." });
		}

		const submissionDocRef = submissionsRef?.doc(submissionId);

		if (action == EUserCreatedBountyActions.DELETE) {
			await submissionDocRef?.delete();
			return res.status(200).json({ message: messages?.SUCCESS });
		}

		const payload = {
			content,
			link: link || '',
			req_amount: reqAmount || '0',
			tags: tags || [],
			title: title || '',
			updated_at: new Date()
		};

		await submissionDocRef?.update(payload);

		return res.status(200).json({ message: messages?.SUCCESS });
	} catch (err) {
		return res.status(500).json({ message: err || messages.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
