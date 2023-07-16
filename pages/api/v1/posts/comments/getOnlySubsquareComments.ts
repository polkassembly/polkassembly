// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { ProposalType } from '~src/global/proposalType';
import messages from '~src/util/messages';
import { MessageType } from '~src/auth/types';

export const getSubsquareCommentsFromFirebase = async ({ postId, network, postType }: {
	postId: string, network: string, postType: ProposalType
}) => {
	try {
		const postRef = postsByTypeRef(network, postType).doc(postId);
		const commentsSnapshot = await postRef.collection('comments').where('source','==' ,'subsquare').get();
		const commentId = commentsSnapshot.docs.map(doc => doc.id);
		return {
			data: commentId,
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

const handler: NextApiHandler<Array<string> | { error: MessageType | string }> = async (req, res) => {
	const { postId = 0, postType } = req.body;
	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) res.status(400).json({ error: messages.NETWORK_VALIDATION_ERROR });
	const { data, error, status } = await getSubsquareCommentsFromFirebase({
		network,
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