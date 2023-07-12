// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import messages from '~src/util/messages';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const updateComments = async (postId: string, network: string, postType: any, comments: any) => {
	try {
		const postRef = postsByTypeRef(network, postType).doc(postId);
		for(const comment of comments){
			const commentRef = await postRef.collection('comments').doc(comment.id);
			await commentRef.set({ ...comment, username:'' });
		}
		return {
			error: null,
			message:'success',
			status: 200
		};
	} catch (error) {
		return {
			data: null,
			error: error.message || messages.API_FETCH_ERROR,
			status: Number(error.name) || 500
		};
	}
};

const handler: NextApiHandler<any | { error: string }> = async (req, res) => {
	const { postId = 0, postType, comments } = req.body;
	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) res.status(400).json({ error: 'Invalid network in request header' });
	const { data, error, status } = await updateComments(postId, network, postType, comments);

	if (error || !data) {
		res.status(status).json({ error: error || messages.API_FETCH_ERROR });
	} else {
		res.status(status).json(data);
	}
};

export default withErrorHandling(handler);