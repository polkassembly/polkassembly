// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isProposalTypeValid, isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { MessageType } from '~src/auth/types';
import { ProposalType } from '~src/global/proposalType';
import fetch from 'node-fetch';
import { ICommentsSummary } from '~src/types';
import messages from '~src/auth/utils/messages';

interface GetCommentsAISummaryResponse {
	data: ICommentsSummary | null;
	error: string | null;
	status: number;
}

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
		const commentsRef = postRef.collection('comments');
		const commentsSnapshot = await commentsRef.get();

		if (commentsSnapshot.empty) {
			return {
				data: null,
				error: 'No comments found for this post.',
				status: 404
			};
		}

		const htmlTagRegex = /<\/?[^>]+(>|$)/g;

		const commentsTextPromises = commentsSnapshot.docs.map(async (commentDoc) => {
			const commentData = commentDoc.data();
			if (!commentData || !commentData.content) return '';

			let commentText = commentData.content.replace(htmlTagRegex, '');

			const repliesRef = commentDoc.ref.collection('replies');
			const repliesSnapshot = await repliesRef.get();

			const repliesPromises = repliesSnapshot.docs.map(async (replyDoc) => {
				const replyData = replyDoc.data();
				if (replyData && replyData.content) {
					return replyData.content.replace(htmlTagRegex, '');
				}
				return '';
			});

			const repliesResults = await Promise.allSettled(repliesPromises);

			repliesResults.forEach((result) => {
				if (result.status === 'fulfilled') {
					commentText += ' ' + (result as PromiseFulfilledResult<string>).value;
				}
			});

			return commentText;
		});

		const commentsTextsResults = await Promise.allSettled(commentsTextPromises);

		const allCommentsText = commentsTextsResults
			.filter((result) => result.status === 'fulfilled' && (result as PromiseFulfilledResult<string>).value)
			.map((result) => (result as PromiseFulfilledResult<string>).value)
			.join(' ')
			.trim();

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
				text: allCommentsText
			}),
			headers: {
				'Content-Type': 'application/json'
			},
			method: 'POST'
		});

		if (!response.ok) {
			throw new Error(`Error fetching AI summary: ${response.statusText}`);
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
		console.error('Error in getCommentsAISummary:', error);
		return {
			data: null,
			error: (error as Error).message,
			status: 500
		};
	}
};

const handler: NextApiHandler<ICommentsSummary | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	const { postId, postType } = req.body;

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

	if (!postId || isNaN(Number(postId)) || !postType || !isProposalTypeValid(postType)) {
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
