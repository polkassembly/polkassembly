// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';

async function handler(req: NextApiRequest, res: NextApiResponse<MessageType>) {
	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if(!network) return res.status(400).json({ message: 'Missing network name in request headers' });

	const { userId, postId, reaction, postType } = req.body;
	if(!userId || isNaN(postId) || !reaction || !postType) return res.status(400).json({ message: 'Missing parameters in request body' });

	const token = getTokenFromReq(req);
	if(!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if(!user || user.id !== Number(userId)) return res.status(403).json({ message: messages.UNAUTHORISED });

	const postRef = postsByTypeRef(network, postType).doc(String(postId));
	const userReactionsSnapshot = await postRef
		.collection('post_reactions')
		.where('user_id', '==', user.id).limit(1).get();

	if(!userReactionsSnapshot.empty) {
		const reactionDocRef = userReactionsSnapshot.docs[0].ref;
		await reactionDocRef.delete().then(() => {
			return res.status(200).json({ message: 'Reaction removed.' });
		}).catch((error) => {
			console.error('Error removing reaction: ', error);
			return res.status(500).json({ message: 'Error removing reaction' });
		});
	}else {
		return res.status(400).json({ message: 'No reaction found' });
	}
}

export default withErrorHandling(handler);
