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
import { EUserCreatedBountiesStatuses } from '~src/types';
import { ProposalType } from '~src/global/proposalType';
import isContentBlacklisted from '~src/util/isContentBlacklisted';

const ZERO_BN = new BN(0);

const checkIsTwitterHandleVerified = async (twitterHandle: string, userId: number) => {
	const twitterVerificationDoc = await firestore_db.collection('twitter_verification_tokens').doc(String(userId)).get();

	if (!twitterVerificationDoc.exists) return false;

	const twitterData = twitterVerificationDoc.data();

	if (`${twitterData?.twitter_handle}`.toLowerCase() !== `${twitterHandle}`.toLowerCase()) return false;

	if (twitterData?.verified && twitterData?.user_id === userId) {
		return true;
	}
	return false;
};

const modifyTwitterHandle = (handle: string) => {
	if (handle?.[0] == '@') {
		return handle?.slice(1, handle?.length);
	}
	return handle;
};

const handler: NextApiHandler<MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	try {
		const network = String(req.headers['x-network']);
		if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

		const { title, content, tags, reward, proposerAddress, submissionGuidelines, deadlineDate, maxClaim, twitterHandle } = req.body;

		const modifiedTwitterHandle = modifyTwitterHandle(twitterHandle);

		const token = getTokenFromReq(req);
		if (!token) return res.status(401).json({ message: messages?.INVALID_JWT });

		const user = await authServiceInstance.GetUser(token);
		if (!user) return res.status(401).json({ message: messages.UNAUTHORISED });

		const firebaseFormatedDeadline = new Date(deadlineDate);

		if (!reward || new BN(reward || 0).eq(ZERO_BN)) {
			return res.status(400).json({ message: 'Invalid reward Amount.' });
		}
		if (!modifiedTwitterHandle?.length) {
			return res.status(400).json({ message: 'Invalid Twitter Handle Account.' });
		}
		if (!proposerAddress?.length || !getEncodedAddress(proposerAddress, network)) {
			return res.status(400).json({ message: 'Invalid Proposer Address.' });
		}
		if (!firebaseFormatedDeadline) {
			return res.status(400).json({ message: 'Invalid Deadline Date.' });
		}

		if (!title?.length || !content?.length || isContentBlacklisted(content)) {
			return res.status(400).json({ message: 'Title or Content is Missing or Invalid in request body.' });
		}
		if (isNaN(maxClaim) || !maxClaim) {
			return res.status(400).json({ message: 'Invalid Max Claim Count.' });
		}
		if (tags?.length && !!tags?.filter((tag: string) => typeof tag !== 'string')?.length) {
			return res.status(400).json({ message: 'Invalid Tags Assigned.' });
		}

		const isTwitterVerified = await checkIsTwitterHandleVerified(modifiedTwitterHandle, user?.id);

		if (!isTwitterVerified) {
			return res.status(400).json({ message: 'Twitter handle is not verified.' });
		}

		const userCreatedBountiesSnapshot = firestore_db.collection('user_created_bounties');

		const totalCreatedBountiesSnapshot = await userCreatedBountiesSnapshot.count().get();

		const totalCreatedBountiesCount = totalCreatedBountiesSnapshot?.data()?.count;

		const bountyDoc = userCreatedBountiesSnapshot?.doc(String(totalCreatedBountiesCount));

		const payload = {
			content,
			createdAt: new Date(),
			deadlineDate: new Date(deadlineDate),
			history: [],
			id: totalCreatedBountiesCount,
			maxClaim: maxClaim,
			network: network,
			proposalType: ProposalType.USER_CREATED_BOUNTIES,
			proposer: getEncodedAddress(proposerAddress, network) || '',
			reward: reward || '0',
			source: 'polkassembly',
			status: EUserCreatedBountiesStatuses.ACTIVE,
			submissionGuidelines: submissionGuidelines || '',
			tags: tags || [],
			title: title || '',
			twitterHandle: modifiedTwitterHandle,
			updatedAt: new Date(),
			userId: user?.id
		};

		await bountyDoc?.set(payload, { merge: true });

		return res.status(200).json({ message: messages?.SUCCESS });
	} catch (err) {
		return res.status(500).json({ message: err || messages.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
