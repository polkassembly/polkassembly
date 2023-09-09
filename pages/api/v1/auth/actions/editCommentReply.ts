// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isOffChainProposalTypeValid, isProposalTypeValid } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { ProposalType } from '~src/global/proposalType';

const handler: NextApiHandler<MessageType> = async (req, res) => {
	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if(!network) return res.status(400).json({ message: 'Missing network name in request headers' });

	const { userId, commentId, content, postId, postType, replyId } = req.body;
	if(!userId || !commentId || !content || isNaN(postId) || !postType || !replyId) return res.status(400).json({ message: 'Missing parameters in request body' });

	const strProposalType = String(postType);
	if (!isOffChainProposalTypeValid(strProposalType) && !isProposalTypeValid(strProposalType)) return res.status(400).json({ message: `The post type of the name "${postType}" does not exist.` });

	const token = getTokenFromReq(req);
	if(!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if(!user || user.id !== Number(userId)) return res.status(403).json({ message: messages.UNAUTHORISED });

	const postRef = postsByTypeRef(network, strProposalType as ProposalType)
		.doc(String(postId));
	const last_comment_at = new Date();

	const replyRef = postRef
		.collection('comments')
		.doc(String(commentId))
		.collection('replies')
		.doc(String(replyId));

	const replyDoc = await replyRef.get();
	if(!replyDoc.exists) return res.status(404).json({ message: 'Reply not found' });
	if(user.id !== replyDoc.data()?.user_id) return res.status(403).json({ message: messages.UNAUTHORISED });

	replyRef.update({
		content,
		isDeleted: false,
		updated_at: last_comment_at
	}).then(() => {
		postRef.update({
			last_comment_at
		}).then(() => {});
		return res.status(200).json({ message: 'Reply saved.' });
	}).catch((error) => {
		// The document probably doesn't exist.
		console.error('Error saving reply: ', error);
		return res.status(500).json({ message: 'Error saving reply' });
	});
};

export default withErrorHandling(handler);
