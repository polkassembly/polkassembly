// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import authServiceInstance from '~src/auth/auth';
import { CreatePostResponseType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { ProposalType } from '~src/global/proposalType';
import { Post } from '~src/types';

const handler: NextApiHandler<CreatePostResponseType> = async (req, res) => {
	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const { content, title, postId, userId, proposerAddress, tags, discussionId } = req.body;
	if (!content || !title || !proposerAddress) return res.status(400).json({ message: 'Missing parameters in request body' });

	if (isNaN(Number(userId)) || isNaN(Number(postId))) return res.status(400).json({ message: 'Invalid parameters in request body' });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user || user.id != Number(userId)) return res.status(403).json({ message: messages.UNAUTHORISED });

	const postDocRef = postsByTypeRef(network, ProposalType.REFERENDUM_V2).doc(String(postId));

	const postDoc = await postDocRef.get();
	if (postDoc.exists) {
		return res.status(400).json({ message: `Post with id ${postId} already exists.` });
	}

	const current_datetime = new Date();

	if (Number(discussionId) >= 0 && !isNaN(Number(discussionId))) {
		const discussionDoc = postsByTypeRef(network, ProposalType.DISCUSSIONS).doc(String(discussionId));

		await discussionDoc.set(
			{
				last_edited_at: current_datetime,
				post_link: {
					id: Number(postId),
					type: ProposalType.REFERENDUM_V2
				}
			},
			{ merge: true }
		);
	}

	const newPost: Post = {
		content,
		createdOnPolkassembly: true,
		created_at: current_datetime,
		id: postId,
		isDeleted: false,
		last_comment_at: current_datetime,
		last_edited_at: current_datetime,
		post_link: discussionId
			? {
					id: Number(discussionId),
					type: ProposalType.DISCUSSIONS
			  }
			: null,
		proposer_address: proposerAddress,
		tags: tags,
		title,
		topic_id: 4,
		user_id: user.id
	};

	await postDocRef
		.set(newPost)
		.then(() => {
			return res.status(200).json({ message: messages.TREASURY_PROPOSAL_CREATION_SUCCESS, post_id: postId });
		})
		.catch((error) => {
			// The document probably doesn't exist.
			console.error('Error saving post: ', error);
			return res.status(500).json({ message: messages.TREASURY_PROPOSAL_CREATION_ERROR });
		});
};

export default withErrorHandling(handler);
