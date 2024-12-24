// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BN } from 'bn.js';
import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import authServiceInstance from '~src/auth/auth';
// import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { firestore_db } from '~src/services/firebaseInit';
import { IPostHistory } from '~src/types';
import isContentBlacklisted from '~src/util/isContentBlacklisted';

const ZERO_BN = new BN(0);

const handler: NextApiHandler<any> = async (req, res) => {
	storeApiKeyUsage(req);

	try {
		const network = String(req.headers['x-network']);
		if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

		const { title, content, tags, reward, submissionGuidelines, deadlineDate, maxClaim, bountyId } = req.body;

		const token = getTokenFromReq(req);
		if (!token) return res.status(401).json({ message: messages?.INVALID_JWT });

		const user = await authServiceInstance.GetUser(token);
		if (!user) return res.status(401).json({ message: messages.UNAUTHORISED });

		const firebaseFormatedDeadline = new Date(deadlineDate);

		if (!reward || new BN(reward || 0).eq(ZERO_BN)) {
			return res.status(400).json({ message: 'Invalid reward Amount.' });
		}
		if (isNaN(bountyId)) {
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
		const bountySnapshot = firestore_db
			.collection('user_created_bounties')
			.where('network', '==', network)
			.where('id', '==', Number(bountyId))
			.where('userId', '==', user?.id)
			.limit(1);

		const bountyDoc = await bountySnapshot?.get();

		if (bountyDoc.empty) {
			return res.status(400).json({ message: `No bounty found with the id-${bountyId}` });
		}
		const bounty = bountyDoc?.docs?.[0]?.data();

		const newHistory: IPostHistory = {
			content: bounty?.content,
			created_at: bounty?.updatedAt,
			title: bounty?.title
		};

		const history = bounty?.history && Array.isArray(bounty?.history) ? [newHistory, ...(bounty?.history || [])] : [];

		const payload = {
			content,
			deadlineDate: new Date(deadlineDate),
			history,
			maxClaim: maxClaim,
			reward: reward || '0',
			submissionGuidelines: submissionGuidelines || '',
			tags: tags || [],
			title: title || '',
			updatedAt: new Date()
		};

		await bountyDoc?.docs?.[0]?.ref?.update(payload);
		const updatedBountyDoc = await bountySnapshot?.get();
		const updatedBounty = updatedBountyDoc?.docs?.[0]?.data();

		return res.status(200).json({ message: messages?.SUCCESS, post: updatedBounty });
	} catch (err) {
		return res.status(500).json({ message: err || messages.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
