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
import { IComment } from '~src/components/Post/Comment/Comment';
import { EActivityAction, EAllowedCommentor } from '~src/types';

export interface IDocumentReply {
	content: string;
	id: string;
	user_id: number;
	username: string;
}
export interface IDocumentPost {
	allowedCommentors?: EAllowedCommentor[];
	content: string;
	user_id: number;
}
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

	let reactionsCollRef;
	if (setReplyReaction) {
		reactionsCollRef = postRef.collection('comments').doc(String(commentId)).collection('replies').doc(String(replyId)).collection('reply_reactions');
	} else {
		reactionsCollRef = postRef.collection('comments').doc(String(commentId)).collection('comment_reactions');
	}

	const userReactionQuery = reactionsCollRef.where('user_id', '==', user.id);

	let reactionDoc: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> | FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>;
	let reactionData = {};

	const userReactionQuerySnapshot = await userReactionQuery.get();
	if (!userReactionQuerySnapshot.empty) {
		reactionDoc = userReactionQuerySnapshot.docs[0];
		reactionData = {
			...reactionDoc.data(),
			reaction,
			updated_at: new Date()
		};
	} else {
		reactionDoc = reactionsCollRef.doc();
		reactionData = {
			created_at: new Date(),
			id: reactionDoc.id,
			reaction,
			updated_at: new Date(),
			user_id: user.id,
			username: user.username
		};
	}

	await reactionsCollRef
		.doc(reactionDoc.id)
		.set(reactionData, { merge: true })
		.then(() => {
			res.status(200).json({ message: 'Reaction updated.' });
		})
		.catch((error) => {
			console.error('Error updating reaction: ', error);
			return res.status(500).json({ message: 'Error updating reaction' });
		});

	try {
		const postData: IDocumentPost = (await postRef.get()).data() as IDocumentPost;
		let replyData: IDocumentPost | null = null;

		const commentData: IComment = (await postRef.collection('comments').doc(String(commentId)).get()).data() as IComment;
		if (setReplyReaction) {
			replyData = (await postRef.collection('comments').doc(String(commentId)).collection('replies').doc(String(replyId)).get()).data() as IDocumentReply;
		}

		const postAuthorId = postData?.user_id || null;
		const commentAuthorId = commentData?.user_id || null;
		const replyAuthorId = replyData ? replyData?.user_id : null;

		if (typeof postAuthorId == 'number' && typeof userId == 'number' && typeof commentAuthorId == 'number') {
			await createUserActivity({
				action: EActivityAction.CREATE,
				commentAuthorId: commentAuthorId,
				commentId,
				network,
				postAuthorId: postAuthorId,
				postId,
				postType,
				reactionAuthorId: userId,
				reactionId: reactionDoc.id,
				replyAuthorId,
				replyId,
				userId
			});
		}
		return;
	} catch (err) {
		console.log(err);
		return;
	}
}

export default withErrorHandling(handler);
