// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isOffChainProposalTypeValid, isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import authServiceInstance from '~src/auth/auth';
import { deleteKeys, redisDel } from '~src/auth/redis';
import { CreatePostResponseType } from '~src/auth/types';
import getDefaultUserAddressFromId from '~src/auth/utils/getDefaultUserAddressFromId';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { ProposalType } from '~src/global/proposalType';
import { firestore_db } from '~src/services/firebaseInit';
import { EActivityAction, EAllowedCommentor, IPostTag, Post } from '~src/types';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import isContentBlacklisted from '~src/util/isContentBlacklisted';
import createUserActivity from '../../utils/create-activity';
import { isSpamDetected } from '~src/util/getPostContentAiSummary';
import { sendSpamNotificationEmail } from '~src/auth/email';
import { BLACKLISTED_USER_IDS } from '~src/global/userIdBlacklist';
import { sanitizeHTML } from '~src/util/sanitizeHTML';
import console_pretty from '~src/api-utils/console_pretty';

async function handler(req: NextApiRequest, res: NextApiResponse<CreatePostResponseType>) {
	storeApiKeyUsage(req);

	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const { content, proposalType, title, topicId, userId, gov_type, tags, inductee_address, allowedCommentors } = req.body;
	if (!content || !title || !topicId || !userId || !proposalType) return res.status(400).json({ message: 'Missing parameters in request body' });

	console_pretty({
		body: req.body
	});

	// Sanitize the content before validation and processing
	const sanitizedContent = content ? sanitizeHTML(content) : '';
	const sanitizedTitle = title ? sanitizeHTML(title) : '';

	console_pretty({
		sanitizedContent,
		sanitizedTitle
	});

	if (typeof content !== 'string' || typeof title !== 'string' || isContentBlacklisted(sanitizedTitle) || isContentBlacklisted(sanitizedContent)) {
		return res.status(400).json({ message: messages.BLACKLISTED_CONTENT_ERROR });
	}

	if (tags && !Array.isArray(tags)) return res.status(400).json({ message: 'Invalid tags parameter' });

	if (allowedCommentors && !Array.isArray(allowedCommentors)) {
		return res.status(400).json({ message: 'Invalid allowedCommentors parameter' });
	}

	if ((allowedCommentors || []).length > 0) {
		const invalidCommentors = allowedCommentors.filter((commentor: unknown) => !Object.values(EAllowedCommentor).includes(String(commentor) as EAllowedCommentor));
		if (invalidCommentors.length > 0) return res.status(400).json({ message: 'Invalid values in allowedCommentors array parameter' });
	}

	const substrate_inductee_address = getSubstrateAddress(inductee_address);

	if (inductee_address && !substrate_inductee_address) return res.status(400).json({ message: 'Invalid inductee_address parameter' });

	const strProposalType = String(proposalType);
	if (!isOffChainProposalTypeValid(strProposalType)) return res.status(400).json({ message: `The off chain proposal type "${proposalType}" is invalid.` });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user || user.id != Number(userId)) return res.status(403).json({ message: messages.UNAUTHORISED });

	if (BLACKLISTED_USER_IDS.includes(Number(user.id))) return res.status(400).json({ message: messages.BLACKLISTED_USER_ERROR });

	const lastPostQuerySnapshot = await postsByTypeRef(network, strProposalType as ProposalType)
		.orderBy('id', 'desc')
		.limit(1)
		.get();
	const postsCount = lastPostQuerySnapshot.empty ? 0 : lastPostQuerySnapshot.docs[0].data().id || 0;
	const newID = Number(postsCount) + 1;

	const userDefaultAddress = await getDefaultUserAddressFromId(Number(userId));

	const postDocRef = postsByTypeRef(network, strProposalType as ProposalType).doc(String(newID));

	const last_comment_at = new Date();
	const newPost: Post = {
		allowedCommentors: allowedCommentors || [EAllowedCommentor.ALL],
		content: sanitizedContent,
		created_at: new Date(),
		gov_type: gov_type,
		history: [],
		id: newID,
		inductee_address: substrate_inductee_address || '',
		isDeleted: false,
		last_comment_at,
		last_edited_at: last_comment_at,
		post_link: null,
		proposer_address: userDefaultAddress?.address || '',
		tags: tags ? tags : [],
		title: sanitizedTitle,
		topic_id: strProposalType === ProposalType.GRANTS ? 6 : Number(topicId),
		user_id: user.id,
		username: user.username
	};

	const batch = firestore_db.batch();
	if (tags && Array.isArray(tags) && tags.length > 0) {
		tags?.map((tag: string) => {
			if (tags && typeof tags === 'string') {
				const tagRef = firestore_db.collection('tags').doc(tag);
				const newTag: IPostTag = {
					last_used_at: new Date(),
					name: tag.toLowerCase()
				};
				batch.set(tagRef, newTag, { merge: true });
			}
		});
	}

	console_pretty({
		newPost
	});

	await postDocRef
		.set(newPost)
		.then(async () => {
			res.status(200).json({ message: 'Post saved.', post_id: newID });
			if (tags && Array.isArray(tags) && tags.length > 0) {
				await batch.commit();
			}
		})
		.catch((error) => {
			// The document probably doesn't exist.
			console.error('Error saving post: ', error);
			return res.status(500).json({ message: 'Error saving post' });
		});

	const isSpam = await isSpamDetected(sanitizedContent);
	if (isSpam) {
		await sendSpamNotificationEmail(sanitizedContent, network, newID);
		await postDocRef.update({
			isSpamDetected: isSpam || false
		});
	}

	if (process.env.IS_CACHING_ALLOWED == '1') {
		const discussionDetail = `${network}_${ProposalType.DISCUSSIONS}_postId_${newID}`;
		const discussionListingKey = `${network}_${ProposalType.DISCUSSIONS}_page_*`;
		const latestActivityKey = `${network}_latestActivity_OpenGov`;
		await redisDel(discussionDetail);
		await redisDel(latestActivityKey);
		await deleteKeys(discussionListingKey);
	}

	try {
		await createUserActivity({
			action: EActivityAction.CREATE,
			content: sanitizedContent,
			network,
			postAuthorId: userId,
			postId: newID,
			postType: proposalType,
			userId
		});
		return;
	} catch (err) {
		console.log(err);
		return;
	}
}

export default withErrorHandling(handler);
