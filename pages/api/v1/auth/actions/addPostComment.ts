// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isOffChainProposalTypeValid, isProposalTypeValid, isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { ProposalType, getSubsquidLikeProposalType } from '~src/global/proposalType';
import { EActivityAction, EAllowedCommentor, PostComment } from '~src/types';
import { FIREBASE_FUNCTIONS_URL, firebaseFunctionsHeader } from '~src/components/Settings/Notifications/utils';
import isContentBlacklisted from '~src/util/isContentBlacklisted';
import { deleteKeys } from '~src/auth/redis';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import createUserActivity from '../../utils/create-activity';
import { IDocumentPost } from './addCommentOrReplyReaction';
import { getCommentsAISummaryByPost } from '../../ai-summary';
import { firestore_db } from '~src/services/firebaseInit';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { BLACKLISTED_USER_IDS } from '~src/global/userIdBlacklist';
import { applyRateLimit } from '~src/api-middlewares/rateLimiter';

export interface IAddPostCommentResponse {
	id: string;
}

const handler: NextApiHandler<IAddPostCommentResponse | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	// Apply rate limiting
	try {
		await applyRateLimit(req, res);
	} catch (error) {
		return res.status(429).json({ message: 'Too many requests, please try again later.' });
	}

	const network = String(req.headers['x-network']);

	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Missing network name in request headers' });

	const { userId, content, postId, postType, sentiment, trackNumber = null, isExpertComment, userAddress } = req.body;
	if (!userId || !content || isNaN(postId) || !postType) return res.status(400).json({ message: 'Missing parameters in request body' });

	if (typeof content !== 'string' || isContentBlacklisted(content)) return res.status(400).json({ message: messages.BLACKLISTED_CONTENT_ERROR });

	const strProposalType = String(postType);

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user || user.id !== Number(userId)) return res.status(403).json({ message: messages.UNAUTHORISED });

	if (BLACKLISTED_USER_IDS.includes(Number(user.id))) return res.status(400).json({ message: messages.BLACKLISTED_USER_ERROR });

	if (!isOffChainProposalTypeValid(strProposalType) && !isProposalTypeValid(strProposalType)) {
		return res.status(400).json({ message: `The post type of the name "${postType}" does not exist.` });
	}

	const encodedUserAddress = getEncodedAddress(userAddress, network);
	const expertReqSnapshot = firestore_db.collection('expert_requests');
	let expertDocId: null | string;

	if (isExpertComment && !!encodedUserAddress) {
		const expertReqDocs = await expertReqSnapshot
			.where('userId', '==', user?.id)
			.where('address', '==', encodedUserAddress)
			.limit(1)
			.get();

		if (expertReqDocs.empty) {
			return res.status(400).json({ message: 'The Address is not a Expert Address.' });
		}
		if (expertReqDocs?.docs?.[0]?.exists) {
			expertDocId = expertReqDocs?.docs?.[0].data()?.id;
		}
	}

	const postRef = postsByTypeRef(network, strProposalType as ProposalType).doc(String(postId));
	const postData: IDocumentPost = (await postRef.get()).data() as IDocumentPost;

	// check for allowedCommentors
	if (String(user.id) !== String(postData.user_id) && postData?.allowedCommentors && (postData.allowedCommentors || []).length > 0) {
		if (postData.allowedCommentors.includes(EAllowedCommentor.NONE)) {
			return res.status(403).json({ message: 'User has disabled comments on this post.' });
		}

		// TODO: check if allowedCommentors does not include 'all' that means there is some condition
		// if (!postData.allowedCommentors.includes(EAllowedCommentor.ALL)) {
		// // loop through and check if user qualifies for any of the conditions (ex: is verified onchain)
		// }
	}

	const last_comment_at = new Date();
	const newCommentRef = postRef.collection('comments').doc();

	const newComment: PostComment = {
		content: content,
		created_at: new Date(),
		history: [],
		id: newCommentRef.id,
		isDeleted: false,
		isExpertComment: Boolean(isExpertComment) || false,
		sentiment: sentiment || 0,
		updated_at: last_comment_at,
		user_id: user.id,
		user_profile_img: user?.profile?.image || '',
		username: user.username
	};

	const subsquidProposalType = getSubsquidLikeProposalType(postType);

	if (process.env.IS_CACHING_ALLOWED == '1') {
		if (!isNaN(trackNumber)) {
			// delete referendum v2 redis cache
			if (postType == ProposalType.REFERENDUM_V2) {
				const trackListingKey = `${network}_${subsquidProposalType}_trackId_${Number(trackNumber)}_*`;
				await deleteKeys(trackListingKey);
			}
		} else if (postType == ProposalType.DISCUSSIONS) {
			const discussionListingKey = `${network}_${ProposalType.DISCUSSIONS}_page_*`;
			await deleteKeys(discussionListingKey);
		}
	}

	await newCommentRef
		.set(newComment)
		.then(async () => {
			await postRef.update({
				last_comment_at
			});
			const triggerName = 'newCommentAdded';

			const args = {
				commentId: String(newComment.id),
				network,
				postId: String(postId),
				postType: strProposalType
			};

			fetch(`${FIREBASE_FUNCTIONS_URL}/notify`, {
				body: JSON.stringify({
					args,
					trigger: triggerName
				}),
				headers: firebaseFunctionsHeader(network),
				method: 'POST'
			});
			res.status(200).json({
				id: newComment.id
			});
			if (isExpertComment && expertDocId) {
				const expertReqDoc = expertReqSnapshot.doc(expertDocId);
				const expertSnapShot = await expertReqDoc?.get();
				if (expertSnapShot?.exists) {
					await expertReqDoc.update({ totalReviews: expertSnapShot?.data()?.totalReviews || 0 + 1 });
				}
			}
		})
		.catch((error) => {
			console.error('Error saving comment: ', error);
			return res.status(500).json({ message: 'Error saving comment' });
		});

	await getCommentsAISummaryByPost({ network, postId, postType });

	try {
		const postAuthorId = postData?.user_id || null;

		if (typeof postAuthorId == 'number') {
			await createUserActivity({ action: EActivityAction.CREATE, commentAuthorId: userId, commentId: newComment.id, content, network, postAuthorId, postId, postType, userId });
		}
		return;
	} catch (err) {
		console.log(err);
		return;
	}
};

export default withErrorHandling(handler);
