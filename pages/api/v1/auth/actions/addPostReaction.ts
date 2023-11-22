// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import authServiceInstance from '~src/auth/auth';
import { deleteKeys, redisDel } from '~src/auth/redis';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { ProposalType, getSubsquidLikeProposalType } from '~src/global/proposalType';

async function handler(req: NextApiRequest, res: NextApiResponse<MessageType>) {
	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Missing network name in request headers' });

	const { userId, postId, reaction, postType, trackNumber } = req.body;
	if (!userId || isNaN(postId) || !reaction || !postType) return res.status(400).json({ message: 'Missing parameters in request body' });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user || user.id !== Number(userId)) return res.status(403).json({ message: messages.UNAUTHORISED });

	const postRef = postsByTypeRef(network, postType).doc(String(postId));
	const reactionsCollRef = postRef.collection('post_reactions');

	const userReactionQuery = reactionsCollRef.where('user_id', '==', user.id);

	let reactionDoc;
	let reactionData = {};

	const userReactionQuerySnapshot = await userReactionQuery.get();
	if (!userReactionQuerySnapshot.empty) {
		reactionDoc = userReactionQuerySnapshot.docs[0];
		reactionData = {
			...reactionDoc.data(),
			reaction,
			updated_at: new Date()
		};
	} else {
		reactionDoc = postRef.collection('post_reactions').doc();

		reactionData = {
			created_at: new Date(),
			id: reactionDoc.id,
			reaction,
			updated_at: new Date(),
			user_id: user.id,
			username: user.username
		};
	}

	const subsquidProposalType = getSubsquidLikeProposalType(postType);

	if (process.env.IS_CACHING_ALLOWED == '1') {
		if (!isNaN(trackNumber)) {
			// delete referendum v2 redis cache
			if (postType == ProposalType.REFERENDUM_V2) {
				const trackListingKey = `${network}_${subsquidProposalType}_trackId_${trackNumber}_*`;
				const referendumDetailKey = `${network}_OpenGov_${subsquidProposalType}_postId_${postId}`;
				await redisDel(referendumDetailKey);
				await deleteKeys(trackListingKey);
			}
		} else if (postType == ProposalType.DISCUSSIONS) {
			const discussionListingKey = `${network}_${ProposalType.DISCUSSIONS}_page_*`;
			const discussionDetailKey = `${network}_${ProposalType.DISCUSSIONS}_postId_${postId}`;
			await redisDel(discussionDetailKey);
			await deleteKeys(discussionListingKey);
		}
	}

	await reactionsCollRef
		.doc(reactionDoc.id)
		.set(reactionData, { merge: true })
		.then(() => {
			return res.status(200).json({ message: 'Reaction updated.' });
		})
		.catch((error) => {
			console.error('Error updating reaction: ', error);
			return res.status(500).json({ message: 'Error updating reaction' });
		});
}

export default withErrorHandling(handler);
