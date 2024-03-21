// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { activityDocRef, postsByTypeRef } from '~src/api-utils/firestore_refs';
import authServiceInstance from '~src/auth/auth';
import { deleteKeys, redisDel } from '~src/auth/redis';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { ProposalType, getSubsquidLikeProposalType } from '~src/global/proposalType';
import createUserActivity from '../../utils/create-activity';
import { EActivityAction } from '~src/types';

async function handler(req: NextApiRequest, res: NextApiResponse<MessageType>) {
	storeApiKeyUsage(req);

	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Missing network name in request headers' });

	const { userId, postId, reaction, postType, trackNumber } = req.body;
	if (!userId || isNaN(postId) || !reaction) return res.status(400).json({ message: 'Missing parameters in request body' });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user || user.id !== Number(userId)) return res.status(403).json({ message: messages.UNAUTHORISED });

	const postRef = postType ? postsByTypeRef(network, postType).doc(String(postId)) : activityDocRef(network, String(postId));
	const userReactionsSnapshot = await postRef
		.collection(postType ? 'post_reactions' : 'reactions')
		.where('user_id', '==', user.id)
		.limit(1)
		.get();

	const subsquidProposalType = postType ? getSubsquidLikeProposalType(postType) : null;

	if (process.env.IS_CACHING_ALLOWED == '1' && subsquidProposalType) {
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

	if (!userReactionsSnapshot.empty) {
		const reactionDocRef = userReactionsSnapshot.docs[0].ref;
		const reactionData: any = (await reactionDocRef.get()).data();
		await reactionDocRef
			.delete()
			.then(async () => {
				res.status(200).json({ message: 'Reaction removed.' });
			})
			.catch((error) => {
				console.error('Error removing reaction: ', error);
				return res.status(500).json({ message: 'Error removing reaction' });
			});
		try {
			if (reactionData?.id) {
				await createUserActivity({ action: EActivityAction.DELETE, network, reactionId: reactionData?.id, userId: userId });
				return;
			}
		} catch (err) {
			console.log(err);
			return;
		}
	} else {
		return res.status(400).json({ message: 'No reaction found' });
	}
}

export default withErrorHandling(handler);
