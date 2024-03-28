// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { ProposalType } from '~src/global/proposalType';
import { FIREBASE_FUNCTIONS_URL, firebaseFunctionsHeader } from '~src/components/Settings/Notifications/utils';
import { deleteKeys, redisDel } from '~src/auth/redis';
import { Role } from '~src/types';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import changeProfileScore from '../../utils/changeProfileScore';
import REPUTATION_SCORES from '~src/util/reputationScores';

interface Args {
	userId: string;
	commentId?: string;
	postId: string;
	replyId?: string;
	network: string;
	reason?: string;
	postType: ProposalType;
}

async function handler(req: NextApiRequest, res: NextApiResponse<MessageType>) {
	storeApiKeyUsage(req);

	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if (!network || !['polkadot', 'kusama', 'picasso', 'composable'].includes(network))
		return res.status(400).json({ message: 'Missing or invalid network name in request headers' });

	const { commentId = '', postId, postType, replyId = '', reason = '' } = req.body;

	if (isNaN(postId) || !postType || !reason) return res.status(400).json({ message: 'Missing parameters in request body' });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user) return res.status(403).json({ message: messages.UNAUTHORISED });

	// check if user is a moderator
	if (!user?.roles?.includes(Role.MODERATOR)) return res.status(403).json({ message: messages.UNAUTHORISED });

	//TODO: remove hard coded condition

	if (user.id === 7054 && !['composable', 'picasso'].includes(network)) {
		return res.status(403).json({ message: 'Unauthorised for networks other than Composable and Picasso' });
	}

	let ref = postsByTypeRef(network, postType).doc(String(postId));
	if (commentId) {
		ref = ref.collection('comments').doc(String(commentId));
	}
	if (commentId && replyId) {
		ref = ref.collection('replies').doc(String(replyId));
	}
	await ref.update({
		isDeleted: true
	});
	const notificationArgs: Args = {
		commentId,
		network,
		postId,
		postType,
		reason,
		userId: String(user.id)
	};

	if (process.env.IS_CACHING_ALLOWED == '1') {
		const discussionDetail = `${network}_${ProposalType.DISCUSSIONS}_postId_${postId}`;
		const discussionListingKey = `${network}_${ProposalType.DISCUSSIONS}_page_*`;
		const latestActivityKey = `${network}_latestActivity_OpenGov`;

		await redisDel(discussionDetail);
		await deleteKeys(discussionListingKey);

		if (!commentId && !replyId) {
			await redisDel(latestActivityKey);
		}
	}

	res.status(200).json({ message: 'Content deleted.' });

	// if content is deleted by mod, reduce the user's reputation
	// get comment or reply author's uid
	const { user_id = null } = (await ref.get()).data() as { user_id: number };

	if (user_id !== null && !isNaN(user_id)) {
		await changeProfileScore(user_id, REPUTATION_SCORES.post_reported.value);
	}

	const triggerName = 'contentDeletedByMod';
	await fetch(`${FIREBASE_FUNCTIONS_URL}/notify`, {
		body: JSON.stringify({
			notificationArgs,
			trigger: triggerName
		}),
		headers: firebaseFunctionsHeader(network),
		method: 'POST'
	});

	return;
}

export default withErrorHandling(handler);
