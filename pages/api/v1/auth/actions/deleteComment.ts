// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import authServiceInstance from '~src/auth/auth';
import { deleteKeys } from '~src/auth/redis';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { ProposalType, getSubsquidLikeProposalType } from '~src/global/proposalType';
import createUserActivity from '../../utils/create-activity';
import { EActivityAction, EUserActivityType } from '~src/types';

async function handler(req: NextApiRequest, res: NextApiResponse<MessageType>) {
	storeApiKeyUsage(req);

	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Missing network name in request headers' });

	const { commentId, postId, postType, trackNumber = null } = req.body;
	if (!commentId || isNaN(postId) || !postType) return res.status(400).json({ message: 'Missing parameters in request body' });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user) return res.status(403).json({ message: messages.UNAUTHORISED });

	const postRef = postsByTypeRef(network, postType).doc(String(postId));
	const last_comment_at = new Date();

	const commentRef = postRef.collection('comments').doc(String(commentId));

	const commentDoc = await commentRef.get();

	if (!commentDoc.exists) return res.status(404).json({ message: 'Comment not found' });
	if (commentDoc.data()?.user_id !== user.id) return res.status(403).json({ message: messages.UNAUTHORISED });

	const subsquidProposalType = getSubsquidLikeProposalType(postType);

	if (process.env.IS_CACHING_ALLOWED == '1') {
		if (!isNaN(trackNumber)) {
			// delete referendum v2 redis cache
			if (postType == ProposalType.REFERENDUM_V2) {
				const trackListingKey = `${network}_${subsquidProposalType}_trackId_${trackNumber}_*`;
				await deleteKeys(trackListingKey);
			}
		} else if (postType == ProposalType.DISCUSSIONS) {
			const discussionListingKey = `${network}_${ProposalType.DISCUSSIONS}_page_*`;
			await deleteKeys(discussionListingKey);
		}
	}
	const commentData = (await commentRef.get()).data();
	const userId = commentData?.user_id || null;

	await commentRef
		.update({
			isDeleted: true
		})
		.then(async () => {
			await postRef.update({
				last_comment_at
			});
			res.status(200).json({ message: 'Comment saved.' });
		})
		.catch((error) => {
			// The document probably doesn't exist.
			console.error('Error deleting comment: ', error);
			return res.status(500).json({ message: 'Error deleting comment' });
		});
	try {
		await createUserActivity({ action: EActivityAction.DELETE, commentId: commentId, network, postId, type: EUserActivityType.COMMENTED, userId: userId });
		return;
	} catch (err) {
		console.log(err);
		return;
	}
}

export default withErrorHandling(handler);
