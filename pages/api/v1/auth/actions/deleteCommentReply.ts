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
import { isValidNetwork } from '~src/api-utils';

async function handler(req: NextApiRequest, res: NextApiResponse<MessageType>) {
	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Missing network name in request headers' });

	const { commentId, postId, postType, replyId } = req.body;
	if (!commentId || isNaN(postId) || !postType || !replyId) return res.status(400).json({ message: 'Missing parameters in request body' });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user) return res.status(403).json({ message: messages.UNAUTHORISED });

	const postRef = postsByTypeRef(network, postType).doc(String(postId));
	const last_comment_at = new Date();

	const replyRef = postRef.collection('comments').doc(String(commentId)).collection('replies').doc(String(replyId));

	const replyDoc = await replyRef.get();

	if (!replyDoc.exists) return res.status(404).json({ message: 'Reply not found' });
	if (replyDoc.data()?.user_id !== user.id) return res.status(403).json({ message: messages.UNAUTHORISED });

	await replyRef
		.update({
			isDeleted: true
		})
		.then(() => {
			postRef.update({
				last_comment_at
			});
			return res.status(200).json({ message: 'Reply deleted.' });
		})
		.catch((error) => {
			// The document probably doesn't exist.
			console.error('Error deleting reply: ', error);
			return res.status(500).json({ message: 'Error deleting reply' });
		});
}

export default withErrorHandling(handler);
