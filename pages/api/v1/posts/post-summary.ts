// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';

async function handler(req: NextApiRequest, res: NextApiResponse<MessageType>) {
	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if(!network) return res.status(400).json({ message: 'Missing network name in request headers' });

	const { postId, postType, summary } = req.body;
	if(isNaN(postId) || !postType || !summary) return res.status(400).json({ message: 'Missing parameters in request body' });

	const postRef = postsByTypeRef(network, postType).doc(String(postId));
	const postDoc = await postRef.get();

	if (postDoc.exists) {
		await postRef.set({ summary: summary }, { merge: true });
		return res.status(200).json({ message: messages.POST_SUMMARY_UPDATED });
	}
	return res.status(200).json({ message: messages.ERROR_UPDATING_POST_SUMMARY });
}

export default withErrorHandling(handler);
