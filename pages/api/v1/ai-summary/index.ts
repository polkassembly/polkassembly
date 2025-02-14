// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { MessageType } from '~src/auth/types';
import { ProposalType } from '~src/global/proposalType';
import fetch from 'node-fetch';
import { ICommentsSummary, Post } from '~src/types';
import messages from '~src/auth/utils/messages';
import { removeSymbols } from '~src/util/htmlDiff';
import { QuerySnapshot } from 'firebase-admin/firestore';
import { DocumentData } from 'firebase-admin/firestore';

interface GetCommentsAISummaryResponse {
	data: ICommentsSummary | null;
	error: string | null;
	status: number;
}

const cleanContentForSummary = (content: string): string => {
	const htmlTagRegex = /<\/?[^>]+(>|$)/g;
	const imgTagRegex = /<img[^>]*>/g;

	return removeSymbols(
		content
			.replace(imgTagRegex, '')
			.replace(htmlTagRegex, '')
			.replace(/```[\s\S]*?```|`[^`]*`/g, '') // Removes code blocks and inline code
			.replace(/&nbsp;/g, ' ')
			.replace(/\n/g, ' ')
			.replace(/\+/g, ' ')
			.replace(/"/g, '')
			.replace(/\s\s+/g, ' ')
	);
};

export const getCommentsAISummaryByPost = async ({
	network,
	postId,
	postType
}: {
	network: string;
	postId: string;
	postType: ProposalType;
}): Promise<GetCommentsAISummaryResponse> => {
	const postRef = postsByTypeRef(network, postType).doc(String(postId));

	try {
		let linkedPostCommentsSnapshot: QuerySnapshot<DocumentData, DocumentData> | null = null;

		// get post link comments
		const postData = (await postRef.get()).data() as Post;

		if (postData.post_link) {
			const postLinkRef = postsByTypeRef(network, postData.post_link.type).doc(String(postData.post_link.id));
			// get post link comments
			const postLinkCommentsRef = postLinkRef.collection('comments').where('isDeleted', '!=', true);
			linkedPostCommentsSnapshot = await postLinkCommentsRef.get();
		}

		const commentsRef = postRef.collection('comments').where('isDeleted', '!=', true);
		const commentsSnapshot = await commentsRef.get();

		if (commentsSnapshot.empty && (!linkedPostCommentsSnapshot || linkedPostCommentsSnapshot.empty)) {
			return {
				data: null,
				error: 'No comments found for this post.',
				status: 404
			};
		}

		const unwantedContents = [
			{
				content:
					'Please consider this a temporary notification after our vote has gone on chain. If you would like additional feedback on our rationale for this vote, please join our OpenGov Public Forum on Telegram here:',
				id: 19585
			}
		];

		const commentsDataPromises = [...commentsSnapshot.docs, ...(linkedPostCommentsSnapshot?.docs || [])].map(async (commentDoc) => {
			const commentData = commentDoc.data();
			if (!commentData || !commentData.content) return '';

			const commentObj = {
				content: cleanContentForSummary(commentData.content),
				id: commentData.user_id || 'unknown'
			};

			if (unwantedContents.some((unwanted) => commentObj.content.includes(unwanted.content) && commentObj.id === unwanted.id)) {
				return '';
			}

			const repliesRef = commentDoc.ref.collection('replies').where('isDeleted', '!=', true);
			const repliesSnapshot = await repliesRef.get();

			const repliesPromises = repliesSnapshot.docs.map(async (replyDoc) => {
				const replyData = replyDoc.data();
				if (replyData && replyData.content) {
					const replyObj = {
						content: cleanContentForSummary(replyData.content),
						id: replyData.user_id || 'unknown'
					};

					if (unwantedContents.some((unwanted) => replyObj.content.includes(unwanted.content) && replyObj.id === unwanted.id)) {
						return '';
					}

					return replyObj;
				}
				return '';
			});

			const repliesResults = await Promise.allSettled(repliesPromises);

			const repliesObjects = repliesResults
				.filter((result) => result.status === 'fulfilled' && result.value)
				.map((result) => (result as PromiseFulfilledResult<{ id: string; content: string }>).value)
				.filter((replyObj) => replyObj.content !== '');

			return [commentObj, ...repliesObjects].filter((comment) => comment.content !== '');
		});

		const commentsDataResults = await Promise.allSettled(commentsDataPromises);

		const allCommentsAndReplies = commentsDataResults
			.filter((result) => result.status === 'fulfilled' && result.value)
			.flatMap((result) => (result as PromiseFulfilledResult<any[]>).value);

		if (!allCommentsAndReplies.length) {
			return {
				data: null,
				error: 'No comments or replies found.',
				status: 404
			};
		}

		const commentsData = [{ network, postId }, ...allCommentsAndReplies];

		const apiUrl: string | undefined = process.env.AI_API_ENDPOINTS;

		if (!apiUrl) {
			return {
				data: null,
				error: 'AI summary endpoint is not defined',
				status: 500
			};
		}

		const response = await fetch(apiUrl, {
			body: JSON.stringify({
				text: commentsData
			}),
			headers: {
				'Content-Type': 'application/json'
			},
			method: 'POST'
		});

		if (!response.ok) {
			console.error('Error occurred:', response.statusText.replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, '[REDACTED]'));
			return {
				data: null,
				error: 'Internal Server Error',
				status: response.status
			};
		}

		const data = (await response.json()) as ICommentsSummary | null;

		if (data) {
			await postRef.set({ comments_summary: data }, { merge: true });
			return {
				data,
				error: null,
				status: 200
			};
		} else {
			return {
				data: null,
				error: 'Failed to parse AI summary response',
				status: 500
			};
		}
	} catch (error) {
		return {
			data: null,
			error: messages.API_FETCH_ERROR,
			status: 500
		};
	}
};

const handler: NextApiHandler<ICommentsSummary | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	const { postId, postType } = req.body;

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

	if (!postId || !postType) {
		return res.status(400).json({ message: messages.INVALID_PARAMS });
	}

	const { data, error, status } = await getCommentsAISummaryByPost({
		network,
		postId: String(postId),
		postType: postType as ProposalType
	});

	if (error || !data) {
		return res.status(status).json({ message: error || messages.API_FETCH_ERROR });
	} else {
		return res.status(status).json(data);
	}
};

export default withErrorHandling(handler);
