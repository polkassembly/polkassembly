// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';

async function handler(req: NextApiRequest, res: NextApiResponse<MessageType>) {
	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Missing network name in request headers' });

	const { userId, postId, postType } = req.body;
	if (!userId || isNaN(postId) || !postType) return res.status(400).json({ message: 'Missing parameters in request body' });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user || user.id !== Number(userId)) return res.status(403).json({ message: messages.UNAUTHORISED });

	const postRef = postsByTypeRef(network, postType).doc(String(postId));
	const viewsCollRef = postRef.collection('post_views');

	const userViewQuery = viewsCollRef.where('user_id', '==', user.id);

	let viewDoc;
	let viewData = {};

	const userViewQuerySnapshot = await userViewQuery.get();
	if (!userViewQuerySnapshot.empty) {
		viewDoc = userViewQuerySnapshot.docs[0];
		viewData = {
			...viewDoc.data(),
			updated_at: new Date()
		};
	} else {
		viewDoc = postRef.collection('post_views').doc();

		viewData = {
			created_at: new Date(),
			id: viewDoc.id,
			updated_at: new Date(),
			user_id: user.id,
			username: user.username
		};
	}

	await viewsCollRef
		.doc(viewDoc.id)
		.set(viewData, { merge: true })
		.then(() => {
			return res.status(200).json({ message: 'View updated.' });
		})
		.catch((error) => {
			console.error('Error updating view: ', error);
			return res.status(500).json({ message: 'Error updating view' });
		});
}

export default withErrorHandling(handler);
