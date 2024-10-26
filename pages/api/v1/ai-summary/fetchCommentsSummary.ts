// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType } from '~src/auth/types';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { ProposalType } from '~src/global/proposalType';
import { ICommentsSummary } from '~src/types';
import { getCommentsAISummaryByPost } from '.';
import { isValidNetwork } from '~src/api-utils';
import messages from '~src/auth/utils/messages';

interface FetchCommentsSummaryFromPostParams {
	network: string;
	postId: string;
	postType: ProposalType;
}

interface FetchCommentsSummaryFromPostResponse {
	data: ICommentsSummary | null;
	error: string | null;
	status: number;
}

export const fetchCommentsSummaryFromPost = async ({ network, postId, postType }: FetchCommentsSummaryFromPostParams): Promise<FetchCommentsSummaryFromPostResponse> => {
	try {
		const postRef = postsByTypeRef(network, postType).doc(String(postId));
		const postDoc = await postRef.get();

		if (!postDoc.exists) {
			return {
				data: null,
				error: 'Comments summary not found',
				status: 404
			};
		}

		const commentsSummary = postDoc.data()?.comments_summary as ICommentsSummary | undefined;

		if (!commentsSummary) {
			await getCommentsAISummaryByPost({ network, postId, postType });

			const updatedPostDoc = await postRef.get();
			const updatedCommentsSummary = updatedPostDoc.data()?.comments_summary as ICommentsSummary | undefined;

			if (updatedCommentsSummary) {
				return {
					data: updatedCommentsSummary,
					error: null,
					status: 200
				};
			} else {
				return {
					data: null,
					error: 'Comments summary generation failed',
					status: 500
				};
			}
		}

		return {
			data: commentsSummary,
			error: null,
			status: 200
		};
	} catch (error) {
		console.error('Error fetching comments summary:', error);
		return {
			data: null,
			error: error || messages.API_FETCH_ERROR,
			status: 500
		};
	}
};

const handler: NextApiHandler<ICommentsSummary | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

	const { postId, postType } = req.body;

	if (Number.isNaN(postId) || !postType) {
		return res.status(400).json({ message: messages.INVALID_PARAMS });
	}

	const { data, error, status } = await fetchCommentsSummaryFromPost({
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
