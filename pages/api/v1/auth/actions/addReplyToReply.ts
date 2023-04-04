// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isOffChainProposalTypeValid, isProposalTypeValid } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import _sendCommentReplyMail from '~src/api-utils/_sendCommentReplyMail';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { ProposalType } from '~src/global/proposalType';
import { CommentReply } from '~src/types';

export interface IAddReplyToReplyResponse {
	id: string;
}

const handler: NextApiHandler<IAddReplyToReplyResponse | MessageType> = async (req, res) => {
	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if(!network) return res.status(400).json({ message: 'Missing network name in request headers' });

	const { userId, commentId, content, postId, postType, parentReplyId } = req.body;
	if(!userId || !commentId || !content || isNaN(postId) || !postType || !parentReplyId) return res.status(400).json({ message: 'Missing parameters in request body' });

	const strProposalType = String(postType);
	if (!isOffChainProposalTypeValid(strProposalType) && !isProposalTypeValid(strProposalType)) return res.status(400).json({ message: `The post type of the name "${postType}" does not exist.` });

	const token = getTokenFromReq(req);
	if(!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if(!user || user.id !== Number(userId)) return res.status(403).json({ message: messages.UNAUTHORISED });

	const last_comment_at = new Date();
	const postRef = postsByTypeRef(network, strProposalType as ProposalType)
		.doc(String(postId));

	const parentReplyRef = postRef
		.collection('comments')
		.doc(String(commentId))
		.collection('replies')
		.doc(String(parentReplyId));
	const parentReplyDoc = await parentReplyRef.get();

	if (!parentReplyDoc.exists) {
		return res.status(404).json({ message: `Parent reply with id: "${parentReplyId}" is not found.` });
	}
	const parentReplyData = parentReplyDoc.data();
	if (!parentReplyData) {
		return res.status(404).json({ message: 'Parent reply data is not found.' });
	}
	if (parentReplyData?.level === 5) {
		return res.status(403).json({ message: 'Maximum reply to reply limit exceeds.' });
	}
	const newReplyRef = postRef
		.collection('comments')
		.doc(String(commentId))
		.collection('replies')
		.doc();

	const children = (parentReplyData.children && Array.isArray(parentReplyData.children))? parentReplyData.children: [];
	const newReply: CommentReply = {
		content,
		created_at: new Date(),
		id: newReplyRef.id,
		level: ((parentReplyData?.level || (parentReplyData?.level === 0)) && !isNaN(Number(parentReplyData.level)))? (parentReplyData?.level + 1): 1,
		updated_at: last_comment_at,
		user_id: user.id,
		user_profile_img: user?.profile?.image || '',
		username: user.username
	};

	await newReplyRef.set(newReply).then(() => {
		postRef.set({
			last_comment_at
		}, { merge: true });

		children.push(newReplyRef.id);
		parentReplyRef.set({
			children
		}, { merge: true });

		_sendCommentReplyMail(network, strProposalType, String(postId), content, String(commentId), user);

		return res.status(200).json({
			id: newReply.id
		});
	}).catch((error) => {
		// The document probably doesn't exist.
		console.error('Error saving comment: ', error);
		return res.status(500).json({ message: 'Error saving comment' });
	});
};

export default withErrorHandling(handler);
