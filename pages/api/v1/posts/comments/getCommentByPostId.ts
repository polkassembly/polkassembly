// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import messages from '~src/util/messages';
import { getComments } from '../on-chain-post';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getPostComments = async ({ postId, network, postType, pageSize, lastDocumentId }: {
	postId: string, network: string, postType: any, pageSize: any,
	lastDocumentId: any
}) => {
	try {
		const postRef = postsByTypeRef(network, postType).doc(postId);
		const sortingField = 'created_at';
		let commentsSnapshot;
		if(lastDocumentId){
			const lastDocument = await postRef.collection('comments').doc(lastDocumentId).get();
			commentsSnapshot = await postRef.collection('comments').orderBy(sortingField, 'asc').startAfter(lastDocument).limit(pageSize).get();
		}
		else {
			commentsSnapshot = await postRef.collection('comments').orderBy(sortingField, 'asc').limit(pageSize).get();
		}
		const comments = await getComments(commentsSnapshot, postRef, network, postType);
		const count = (await postRef.collection('comments').get()).size;
		return {
			data: JSON.parse(JSON.stringify({ comments, count })),
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

const handler: NextApiHandler<any | { error: string }> = async (req, res) => {
	const { postId = 0, postType, lastDocumentId, pageSize } = req.body;
	console.log(postType, lastDocumentId, pageSize, postId);
	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) res.status(400).json({ error: 'Invalid network in request header' });
	const { data, error, status } = await getPostComments({
		lastDocumentId: lastDocumentId,
		network,
		pageSize: Number(pageSize),
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