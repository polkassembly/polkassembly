// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import authServiceInstance from '~src/auth/auth';
import { MessageType, User } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { ProposalType } from '~src/global/proposalType';
import { IApiResponse, Role } from '~src/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';

interface IDeleteComment {
	commentId: string;
	postId: number;
	postType: ProposalType;
	network: string;
	user: User;
	replyId?: number;
	reason?: string;
}

export async function deleteComment(params: IDeleteComment): Promise<IApiResponse<MessageType>> {
	try{
		const { commentId, postId, postType, network, user , replyId } = params;
		const postRef = postsByTypeRef(network, postType)
			.doc(String(postId));
		const last_comment_at = new Date();
		if(commentId || replyId){
			const commentRef = postRef
				.collection('comments')
				.doc(String(commentId));

			const commentDoc = await commentRef.get();
			if(postId && replyId && commentId){
				const replyRef = postRef
					.collection('comments')
					.doc(String(commentId))
					.collection('replies')
					.doc(String(replyId));

				const replyDoc = await replyRef.get();
				if(!replyDoc.exists) throw apiErrorWithStatusCode('Reply not found', 404);
				if(replyDoc.data()?.user_id !== user.id && !user?.roles?.includes(Role.MODERATOR)) throw apiErrorWithStatusCode('Unauthorised', 403);
				await replyRef.delete().then(() => {
					postRef.update({
						last_comment_at
					});
				}
				);
				return {
					data: {
						message: 'Reply saved.'
					},
					error: null,
					status: 200
				};
			}
			if(postId && commentId && !replyId){
				if(!commentDoc.exists) throw apiErrorWithStatusCode('Comment not found', 404);
				if(commentDoc.data()?.user_id !== user.id && !user?.roles?.includes(Role.MODERATOR)) throw apiErrorWithStatusCode('Unauthorised', 403);
				await commentRef.delete().then(() => {
					postRef.update({
						last_comment_at
					});
				}
				);
				return {
					data: {
						message: 'Comment saved.'
					},
					error: null,
					status: 200
				};
			}
		}
		await postRef.delete().then(() => {
			postRef.update({
				last_comment_at
			});
		}
		);
		return {
			data: {
				message: 'Post saved.'
			},
			error: null,
			status: 200
		};
	}
	catch (error) {
		return {
			data: null,
			error: error.message || messages.API_FETCH_ERROR,
			status: Number(error.name) || 500
		};
	}
}

async function handler(req: NextApiRequest, res: NextApiResponse<MessageType>) {
	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if(!network) return res.status(400).json({ message: 'Missing network name in request headers' });

	const { commentId, postId, postType  } = req.body;
	if(!commentId || isNaN(postId) || !postType) return res.status(400).json({ message: 'Missing parameters in request body' });

	const token = getTokenFromReq(req);
	if(!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if(!user) return res.status(403).json({ message: messages.UNAUTHORISED });

	const { data, error, status } = await deleteComment({
		commentId,
		network,
		postId,
		postType,
		user
	});

	if(error || !data) {
		res.status(status).json({ message: error || messages.API_FETCH_ERROR });
	}
	else {
		res.status(status).json(data);
	}
}

export default withErrorHandling(handler);
