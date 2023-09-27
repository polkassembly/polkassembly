// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isFirestoreProposalTypeValid, isValidNetwork } from '~src/api-utils';
import { networkDocRef } from '~src/api-utils/firestore_refs';
import authServiceInstance from '~src/auth/auth';
import { ChangeResponseType, MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';

async function handler(req: NextApiRequest, res: NextApiResponse<ChangeResponseType | MessageType>) {
	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const { post_id = null, proposalType } = req.body;

	const strProposalType = String(proposalType);
	if (!isFirestoreProposalTypeValid(strProposalType)) {
		return res.status(400).json({ message: `The proposal type "${proposalType}" is invalid.` });
	}
	if (post_id === null) return res.status(400).json({ message: 'Missing parameters in request body' });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Invalid token' });
	const user = await authServiceInstance.GetUser(token);
	if (!user) return res.status(400).json({ message: messages.USER_NOT_FOUND });

	const postRef = networkDocRef(network).collection('post_types').doc(strProposalType).collection('posts').doc(String(post_id));
	const post = await postRef.get();
	if (!post.exists) return res.status(400).json({ message: 'Post not found' });

	const postSubs = post.data()?.subscribers || [];
	if (!postSubs.includes(user.id)) return res.status(400).json({ message: messages.SUBSCRIPTION_REMOVE_SUCCESSFUL });

	// remove user from post subscribers
	await postRef
		.update({
			subscribers: postSubs.filter((i: any) => Number(i) !== Number(user.id))
		})
		.catch((error) => {
			console.log(' Error while removing user from post subscribers : ', error);
			return res.status(400).json({ message: 'Error while removing user from post subscribers.' });
		});

	return res.status(200).json({ message: messages.SUBSCRIPTION_REMOVE_SUCCESSFUL });
}

export default withErrorHandling(handler);
