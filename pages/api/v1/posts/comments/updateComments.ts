// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { MessageType } from '~src/auth/types';
import { ProposalType } from '~src/global/proposalType';
import messages from '~src/util/messages';

export const updateComments = async (postId: string, network: string, postType: ProposalType, comments: any) => {
	try {
		const postRef = postsByTypeRef(network, postType).doc(postId);
		for(const comment of comments){
			const commentRef = await postRef.collection('comments').doc(comment.id);
			await commentRef.set({ ...comment });
		}
		return {
			error: null,
			message:'success',
			status: 200
		};
	} catch (error) {
		return {
			error: error.message || messages.API_FETCH_ERROR,
			message:'failed',
			status: Number(error.name) || 500
		};
	}
};

const handler: NextApiHandler<string | { error: MessageType | string }> = async (req, res) => {
	const { postId = 0, postType, comments } = req.body;
	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ error: messages.NETWORK_VALIDATION_ERROR });
	const { message, error, status } = await updateComments(postId, network, postType, comments);

	if (error || message === 'failed') {
		return res.status(status).json({ error: error || messages.API_FETCH_ERROR });
	} else {
		return res.status(status).json(message);
	}
};

export default withErrorHandling(handler);