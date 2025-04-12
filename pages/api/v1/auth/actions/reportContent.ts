// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isProposalTypeValid, isValidNetwork } from '~src/api-utils';
import { isOffChainProposalTypeValid } from '~src/api-utils';
import { networkDocRef, postsByTypeRef } from '~src/api-utils/firestore_refs';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { checkReportThreshold } from '../../posts/on-chain-post';
import _sendCommentReportMail from '~src/api-utils/_sendCommentReportMail';
import _sendPostSpamReportMail from '~src/api-utils/_sendPostSpamReportMail';
import _sendReplyReportMail from '~src/api-utils/_sendReplyReportMail';
import { deleteKeys, redisDel, redisGet, redisSetex } from 'src/auth/redis';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import { ProposalType } from '~src/global/proposalType';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';

const TTL_DURATION = 3600 * 6; // 6 Hours or 21600 seconds
export interface IReportContentResponse {
	message: string;
	spam_users_count: number;
}

interface IReportContentRequest {
	type: 'post' | 'comment' | 'reply';
	reason: string;
	comments: string;
	proposalType: string;
	post_id: string;
	reply_id?: string;
	comment_id?: string;
	network: string;
	userId: number;
}

export const reportSpamContent = async ({ type, reason, comments, proposalType, post_id, reply_id, comment_id, network, userId }: IReportContentRequest) => {
	if (!network || !isValidNetwork(network)) {
		throw apiErrorWithStatusCode(messages.INVALID_NETWORK, 400);
	}

	if (!type || !reason || !comments || !proposalType) throw apiErrorWithStatusCode('Missing parameters in request body', 400);
	if ((type === 'post' && !post_id) || (type === 'comment' && !(post_id && comment_id)) || (type === 'reply' && !(post_id && comment_id && reply_id))) {
		throw apiErrorWithStatusCode('Missing parameters in request body', 400);
	}
	if (!isOffChainProposalTypeValid(proposalType) && !isProposalTypeValid(proposalType)) {
		throw apiErrorWithStatusCode(`Proposal type ${proposalType} is not valid.`, 400);
	}

	if (!userId) throw apiErrorWithStatusCode(messages.USER_NOT_FOUND, 400);

	if (!['post', 'comment', 'reply'].includes(type)) throw apiErrorWithStatusCode(messages.REPORT_TYPE_INVALID, 400);
	if (!reason) throw apiErrorWithStatusCode(messages.REPORT_REASON_REQUIRED, 400);
	if (comments.length > 300) throw apiErrorWithStatusCode(messages.REPORT_COMMENTS_LENGTH_EXCEEDED, 400);

	const getContentId = () => {
		switch (type) {
			case 'post':
				return proposalType !== 'tips' ? Number(post_id) : post_id;
			case 'comment':
				return comment_id;
			case 'reply':
				return reply_id;
			default:
				return '';
		}
	};
	const contentId: any = getContentId();
	const strPostType = String(proposalType);
	const data: any = {
		comments,
		content_id: contentId,
		proposal_type: strPostType,
		reason,
		resolved: false,
		type,
		user_id: userId
	};

	if (type === 'comment') {
		data.post_id = post_id;
	} else if (type === 'reply') {
		data.post_id = post_id;
		data.comment_id = comment_id;
	}
	try {
		await networkDocRef(network).collection('reports').doc(`${userId}_${contentId}_${strPostType}`).set(data, { merge: true });
		const countQuery = await networkDocRef(network)
			.collection('reports')
			.where('type', '==', type)
			.where('proposal_type', '==', strPostType)
			.where('content_id', '==', contentId)
			.count()
			.get();

		const totalUsers = countQuery.data()?.count || 0;

		if (type == 'post' && checkReportThreshold(totalUsers)) {
			const postReportKey = await redisGet(`postReportKey-${network}_${strPostType}_${post_id}`);
			if (!postReportKey) {
				const postRef = await postsByTypeRef(network, strPostType as ProposalType)
					.doc(post_id)
					.get();
				if (postRef.exists) {
					await postRef.ref.update({
						isSpamDetected: true
					});
				}
				_sendPostSpamReportMail(network, strPostType, contentId, totalUsers);
				await redisSetex(`postReportKey-${network}_${strPostType}_${post_id}`, TTL_DURATION, 'true');
				if (process.env.IS_CACHING_ALLOWED == '1') {
					const discussionDetail = `${network}_${ProposalType.DISCUSSIONS}_postId_${post_id}`;
					const discussionListingKey = `${network}_${ProposalType.DISCUSSIONS}_page_*`;
					const latestActivityKey = `${network}_latestActivity_OpenGov`;
					await Promise.all([redisDel(discussionDetail), redisDel(latestActivityKey), deleteKeys(discussionListingKey)]);
				}
			}
		}
		if (type == 'comment' && checkReportThreshold(totalUsers) && comment_id) {
			const commentReportKey = await redisGet(`commentReportKey-${network}_${strPostType}_${post_id}_${comment_id}`);
			if (!commentReportKey) {
				_sendCommentReportMail(network, strPostType, post_id, comment_id, totalUsers);
				await redisSetex(`commentReportKey-${network}_${strPostType}_${post_id}_${comment_id}`, TTL_DURATION, 'true');
			}
		}
		if (type == 'reply' && checkReportThreshold(totalUsers) && reply_id && comment_id) {
			const replyReportKey = await redisGet(`replyReportKey-${network}_${strPostType}_${post_id}_${comment_id}_${reply_id}`);
			if (!replyReportKey) {
				_sendReplyReportMail(network, strPostType, post_id, comment_id, reply_id, totalUsers);
				await redisSetex(`replyReportKey-${network}_${strPostType}_${post_id}_${comment_id}_${reply_id}`, TTL_DURATION, 'true');
			}
		}
		return {
			data: {
				message: messages.CONTENT_REPORT_SUCCESSFUL,
				spam_users_count: checkReportThreshold(totalUsers)
			},
			error: null,
			status: 200
		};
	} catch (error) {
		return {
			data: null,
			error: messages.API_FETCH_ERROR,
			status: 500
		};
	}
};

async function handler(req: NextApiRequest, res: NextApiResponse<IReportContentResponse | MessageType>) {
	storeApiKeyUsage(req);

	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Missing network in request header' });

	const { type, reason, comments, proposalType, post_id, reply_id, comment_id } = req.body;

	const token = getTokenFromReq(req);
	if (!token) {
		return res.status(401).json({ message: 'Unauthorized' });
	}

	const user = await authServiceInstance.GetUser(token);
	if (!user) {
		return res.status(401).json({ message: 'Unauthorized' });
	}

	const { data, error, status } = await reportSpamContent({ comment_id, comments, network, post_id, proposalType, reason, reply_id, type, userId: user.id });

	if (data) {
		return res.status(status || 200).json(data);
	} else {
		return res.status(status || 400).json({ message: error || messages.API_FETCH_ERROR });
	}
}

export default withErrorHandling(handler);
