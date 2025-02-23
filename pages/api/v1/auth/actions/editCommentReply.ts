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
import { firestore_db } from '~src/services/firebaseInit';
import { checkIsProposer } from './utils/checkIsProposer';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import createUserActivity from '../../utils/create-activity';
import { EActivityAction } from '~src/types';
import { getCommentsAISummaryByPost } from '../../ai-summary';
import { BLACKLISTED_USER_IDS } from '~src/global/userIdBlacklist';
import { sanitizeHTML } from '~src/util/sanitizeHTML';

const handler: NextApiHandler<MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Missing network name in request headers' });

	const { commentId, content, postId, postType, replyId } = req.body;
	if (!commentId || !content || isNaN(postId) || !postType || !replyId) return res.status(400).json({ message: 'Missing parameters in request body' });

	// Sanitize the content before processing
	const sanitizedContent = content ? sanitizeHTML(content) : '';

	const strProposalType = String(postType);
	if (!isOffChainProposalTypeValid(strProposalType) && !isProposalTypeValid(strProposalType))
		return res.status(400).json({ message: `The post type of the name "${postType}" does not exist.` });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user) return res.status(403).json({ message: messages.UNAUTHORISED });
	const userId = user.id;

	if (BLACKLISTED_USER_IDS.includes(Number(userId))) return res.status(400).json({ message: messages.BLACKLISTED_USER_ERROR });

	const postRef = postsByTypeRef(network, strProposalType as ProposalType).doc(String(postId));
	const last_comment_at = new Date();

	const replyRef = postRef.collection('comments').doc(String(commentId)).collection('replies').doc(String(replyId));

	const replyDoc = await replyRef.get();
	if (!replyDoc.exists) return res.status(404).json({ message: 'Reply not found' });
	const replyUserAddress = (
		await firestore_db
			.collection('addresses')
			.where('user_id', '==', replyDoc.data()?.user_id)
			.where('isMultisig', '==', true)
			.get()
	).docs.map((doc) => doc.data());
	const userAddress = (await firestore_db.collection('addresses').where('user_id', '==', user.id).get()).docs.map((doc) => doc.data());
	const isAuthor = await checkIsProposer(
		replyUserAddress?.[0]?.address,
		userAddress.map((a) => a.address),
		network
	);
	if (!isAuthor && user.id !== replyDoc.data()?.user_id) return res.status(403).json({ message: messages.UNAUTHORISED });

	replyRef
		.update({
			content: sanitizedContent,
			isDeleted: false,
			updated_at: last_comment_at
		})
		.then(async () => {
			await postRef
				.update({
					last_comment_at
				})
				.then(() => {});
			res.status(200).json({ message: 'Reply saved.' });
		})
		.catch((error) => {
			console.error('Error saving reply: ', error);
			return res.status(500).json({ message: 'Error saving reply' });
		});

	try {
		const postData = (await postRef.get()).data();
		const commentData = (await postRef.collection('comments').doc(String(commentId)).get()).data();

		const postAuthorId = postData?.user_id || null;
		const commentAuthorId = commentData?.user_id || null;

		await createUserActivity({
			action: EActivityAction.EDIT,
			commentAuthorId,
			commentId,
			content: sanitizedContent,
			network,
			postAuthorId,
			postId,
			postType,
			replyAuthorId: userId,
			replyId,
			userId
		});
		await getCommentsAISummaryByPost({ network, postId, postType });
		return;
	} catch (err) {
		console.log(err);
		return;
	}
};

export default withErrorHandling(handler);
