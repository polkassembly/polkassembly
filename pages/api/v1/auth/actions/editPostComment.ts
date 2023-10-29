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
import { ICommentHistory } from '~src/types';
import { checkIsProposer } from './utils/checkIsProposer';
import { firestore_db } from '~src/services/firebaseInit';
import IPFSScript from '~src/api-utils/ipfs';

const handler: NextApiHandler<MessageType> = async (req, res) => {
	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Missing network name in request headers' });

	const { userId, commentId, content, postId, postType, sentiment } = req.body;
	if (!userId || !commentId || !content || isNaN(postId) || !postType) return res.status(400).json({ message: 'Missing parameters in request body' });

	const strProposalType = String(postType);
	if (!isOffChainProposalTypeValid(strProposalType) && !isProposalTypeValid(strProposalType))
		return res.status(400).json({ message: `The post type of the name "${postType}" does not exist.` });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user || user.id !== Number(userId)) return res.status(403).json({ message: messages.UNAUTHORISED });

	const postRef = postsByTypeRef(network, strProposalType as ProposalType).doc(String(postId));
	const last_comment_at = new Date();

	const commentRef = postRef.collection('comments').doc(String(commentId));

	const commentDoc = await commentRef.get();

	if (!commentDoc.exists) return res.status(404).json({ message: 'Comment not found' });
	const commentData = commentDoc.data();
	const commentAddress = (
		await firestore_db
			.collection('addresses')
			.where('user_id', '==', commentData?.user_id)
			.where('isMultisig', '==', true)
			.get()
	).docs.map((doc) => doc.data());
	const userAddress = (await firestore_db.collection('addresses').where('user_id', '==', user.id).get()).docs.map((doc) => doc.data());
	const isAuthor = await checkIsProposer(
		commentAddress?.[0]?.address,
		userAddress.map((a) => a.address),
		network
	);
	if (!isAuthor && user.id !== commentData?.user_id) return res.status(403).json({ message: messages.UNAUTHORISED });

	const newHistory: ICommentHistory = {
		content: commentData?.content,
		created_at: commentData?.created_at?.toDate ? commentData?.created_at.toDate() : commentData?.created_at,
		sentiment: commentData?.sentiment || 0
	};

	const history = commentData?.history && Array.isArray(commentData?.history) ? [newHistory, ...(commentData?.history || [])] : new Array(newHistory);

	commentRef
		.update({
			content,
			history,
			sentiment,
			updated_at: last_comment_at
		})
		.then(() => {
			const ipfsScript = new IPFSScript();
			ipfsScript.run(
				{
					...commentData,
					content,
					history,
					sentiment,
					updated_at: last_comment_at
				},
				commentRef.path
			);
			postRef
				.update({
					last_comment_at
				})
				.then(() => {});
			return res.status(200).json({ message: 'Comment saved.' });
		})
		.catch((error) => {
			// The document probably doesn't exist.
			console.error('Error saving comment: ', error);
			return res.status(500).json({ message: 'Error saving comment' });
		});
};

export default withErrorHandling(handler);
