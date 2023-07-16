// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import messages from '~src/util/messages';
import { getComments } from '../on-chain-post';
import { ITimelineComments } from './getCommentByPostId';
import { MessageType } from '~src/auth/types';
import { ProposalType } from '~src/global/proposalType';

export const getCommentsWithId = async ({ postId, network, postType, pageSize, commentId }: {
	postId: string, network: string, pageSize: number, postType: ProposalType, commentId: string
}) => {
	try {
		const postRef = postsByTypeRef(network, postType).doc(postId);
		const sortingField = 'created_at';
		let commentsSnapshot;
		commentsSnapshot = await postRef.collection('comments').doc(commentId).get();
		if (!commentsSnapshot.exists) {
			commentsSnapshot = await postRef.collection('comments').orderBy(sortingField, 'asc').get();
		}
		else {
			commentsSnapshot = await postRef.collection('comments').orderBy(sortingField, 'asc').limit(pageSize).get();
		}
		const comments = await getComments(commentsSnapshot, postRef, network, postType);
		const count = (await postRef.collection('comments').get()).size;

		return {
			data: { comments, count },
			error: null,
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

const handler: NextApiHandler<ITimelineComments | { error: MessageType | string }> = async (req, res) => {
	const { postId = 0, postType, commentId, pageSize } = req.body;
	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) res.status(400).json({ error: messages.NETWORK_VALIDATION_ERROR });
	const { data, error, status } = await getCommentsWithId({
		commentId,
		network,
		pageSize,
		postId: postId.toString(),
		postType
	});

	if (error || !data) {
		res.status(status).json({ error: error || messages.API_FETCH_ERROR });
	} else {
		res.status(status).json(data);
	}
};

export default withErrorHandling(handler);