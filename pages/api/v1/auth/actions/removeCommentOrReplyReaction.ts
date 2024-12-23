// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import createUserActivity from '../../utils/create-activity';
import { EActivityAction } from '~src/types';

async function handler(req: NextApiRequest, res: NextApiResponse<MessageType>) {
	storeApiKeyUsage(req);

	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Missing network name in request headers' });

	const { userId, postId, commentId, reaction, postType, replyId, setReplyReaction } = req.body;
	if (setReplyReaction) {
		if (!userId || isNaN(postId) || (!commentId && !replyId) || !reaction || !postType) return res.status(400).json({ message: 'Missing parameters in request body' });
	} else {
		if (!userId || isNaN(postId) || !commentId || !reaction || !postType) return res.status(400).json({ message: 'Missing parameters in request body' });
	}

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user || user.id !== Number(userId)) return res.status(403).json({ message: messages.UNAUTHORISED });

	const postRef = postsByTypeRef(network, postType).doc(String(postId));

	let userReactionsSnapshot;
	if (setReplyReaction) {
		userReactionsSnapshot = await postRef
			.collection('comments')
			.doc(String(commentId))
			.collection('replies')
			.doc(String(replyId))
			.collection('reply_reactions')
			.where('user_id', '==', user.id)
			.limit(1)
			.get();
	} else {
		userReactionsSnapshot = await postRef.collection('comments').doc(String(commentId)).collection('comment_reactions').where('user_id', '==', user.id).limit(1).get();
	}
	// const userReactionsSnapshot = await postRef.collection('comments').doc(String(commentId)).collection('comment_reactions').where('user_id', '==', user.id).limit(1).get();

	if (!userReactionsSnapshot.empty) {
		const reactionDocRef = userReactionsSnapshot.docs[0].ref;
		const reactionData = (await reactionDocRef.get()).data();
		await reactionDocRef
			.delete()
			.then(async () => {
				res.status(200).json({ message: 'Reaction removed.' });
			})
			.catch((error) => {
				console.error('Error removing reaction: ', error);
				return res.status(500).json({ message: 'Error removing reaction' });
			});
		try {
			await createUserActivity({ action: EActivityAction.DELETE, network, reactionId: reactionData?.id, userId: userId });
			return;
		} catch (err) {
			console.log(err);
			return;
		}
	} else {
		return res.status(400).json({ message: 'No reaction found' });
	}
}

export default withErrorHandling(handler);
