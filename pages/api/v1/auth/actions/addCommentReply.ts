// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isOffChainProposalTypeValid, isProposalTypeValid, isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { ProposalType } from '~src/global/proposalType';
import { CommentReply, EActivityAction, EAllowedCommentor } from '~src/types';
import { FIREBASE_FUNCTIONS_URL, firebaseFunctionsHeader } from '~src/components/Settings/Notifications/utils';
import isContentBlacklisted from '~src/util/isContentBlacklisted';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import createUserActivity from '../../utils/create-activity';
import { IDocumentPost } from './addCommentOrReplyReaction';
import { IComment } from '~src/components/Post/Comment/Comment';
import { firestore_db } from '~src/services/firebaseInit';
import { getCommentsAISummaryByPost } from '../../ai-summary';

export interface IAddCommentReplyResponse {
	id: string;
}

const handler: NextApiHandler<IAddCommentReplyResponse | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Missing network name in request headers' });

	const { userId, commentId, content, postId, postType } = req.body;
	if (!userId || !commentId || !content || isNaN(postId) || !postType) return res.status(400).json({ message: 'Missing parameters in request body' });

	if (typeof content !== 'string' || isContentBlacklisted(content)) return res.status(400).json({ message: messages.BLACKLISTED_CONTENT_ERROR });

	const strProposalType = String(postType);
	if (!isOffChainProposalTypeValid(strProposalType) && !isProposalTypeValid(strProposalType))
		return res.status(400).json({ message: `The post type of the name "${postType}" does not exist.` });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user || user.id !== Number(userId)) return res.status(403).json({ message: messages.UNAUTHORISED });

	const postRef = postsByTypeRef(network, strProposalType as ProposalType).doc(String(postId));
	const postData: IDocumentPost = (await postRef.get()).data() as IDocumentPost;

	// check for allowedCommentors
	if (String(user.id) !== String(postData.user_id) && postData?.allowedCommentors && (postData.allowedCommentors || []).length > 0) {
		if (postData.allowedCommentors.includes(EAllowedCommentor.NONE)) {
			return res.status(403).json({ message: 'User has disabled comments on this post.' });
		}

		// TODO: check if allowedCommentors does not include 'all' that means there is some condition
		// if (!postData.allowedCommentors.includes(EAllowedCommentor.ALL)) {
		// // loop through and check if user qualifies for any of the conditions (ex: is verified onchain)
		// }
	}

	const last_comment_at = new Date();
	const batch = firestore_db.batch();

	const commentRef = postRef.collection('comments').doc(String(commentId));

	const commentDoc = {
		id: String(commentId)
	};

	const newReplyRef = postRef.collection('comments').doc(String(commentId)).collection('replies').doc();

	const newReply: CommentReply = {
		content,
		created_at: new Date(),
		id: newReplyRef.id,
		isDeleted: false,
		updated_at: last_comment_at,
		user_id: user.id,
		user_profile_img: user?.profile?.image || '',
		username: user.username
	};

	batch.set(commentRef, commentDoc, { merge: true });
	batch.set(newReplyRef, newReply);

	try {
		await batch.commit();
	} catch (error) {
		// The document probably doesn't exist.
		console.error('Error saving comment: ', error);
		return res.status(500).json({ message: 'Error saving comment' });
	}

	res.status(200).json({
		id: newReply.id
	});

	await postRef.update({
		last_comment_at
	});

	const triggerName = 'newReplyAdded';

	const args = {
		commentId: String(commentId),
		network,
		postId: String(postId),
		postType: strProposalType,
		replyId: newReplyRef.id
	};

	fetch(`${FIREBASE_FUNCTIONS_URL}/notify`, {
		body: JSON.stringify({
			args,
			trigger: triggerName
		}),
		headers: firebaseFunctionsHeader(network),
		method: 'POST'
	});
	try {
		const commentData: IComment = (await postRef.collection('comments').doc(String(commentId)).get()).data() as IComment;
		const postAuthorId = postData?.user_id || null;
		const commentAuthorId = commentData?.user_id || null;
		if (typeof postAuthorId == 'number' && typeof commentAuthorId == 'number') {
			await createUserActivity({
				action: EActivityAction.CREATE,
				commentAuthorId: commentAuthorId,
				commentId,
				content,
				network,
				postAuthorId: postAuthorId,
				postId,
				postType,
				replyAuthorId: userId,
				replyId: newReply?.id,
				userId
			});
		}
		getCommentsAISummaryByPost({ network, postId, postType });
		return;
	} catch (err) {
		console.log(err);
		return;
	}
};

export default withErrorHandling(handler);
