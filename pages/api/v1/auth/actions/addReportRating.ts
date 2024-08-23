// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import { Post } from '~src/types';

const handler: NextApiHandler<MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const { postId, proposalType, user_id, rating } = req.body;

	if (!postId || !proposalType || !user_id || rating === undefined) {
		return res.status(400).json({ message: 'Missing parameters in request body' });
	}

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user) return res.status(403).json({ message: messages.UNAUTHORISED });

	const postDocRef = postsByTypeRef(network, proposalType).doc(String(postId));
	const postDoc = await postDocRef.get();

	if (!postDoc.exists) return res.status(404).json({ message: 'Post not found.' });

	const postData = postDoc.data() as Post;
	const progressReport = postData.progress_report || {};

	const ratings = progressReport.ratings || [];

	const existingRatingIndex = ratings.findIndex((r: { user_id: string; rating: number }) => r.user_id === user_id);

	if (existingRatingIndex > -1) {
		ratings[existingRatingIndex].rating = rating;
	} else {
		ratings.push({ rating, user_id });
	}

	progressReport.ratings = ratings;

	await postDocRef.update({
		progress_report: progressReport
	});

	return res.status(200).json({ message: 'Progress report updated successfully.' });
};

export default withErrorHandling(handler);
