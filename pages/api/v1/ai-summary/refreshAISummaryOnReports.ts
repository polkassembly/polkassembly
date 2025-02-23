// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import messages from '~src/auth/utils/messages';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import authServiceInstance from '~src/auth/auth';
import { firestore_db } from '~src/services/firebaseInit';
import { isValidNetwork } from '~src/api-utils';
import { fetchCommentsSummaryFromPost } from './fetchCommentsSummary';
import { ProposalType } from '~src/global/proposalType';

const handleReportCheckAndRefresh = async ({
	network,
	postType,
	postIndex
}: {
	network: string;
	postType: ProposalType;
	postIndex: number;
}): Promise<{ success: boolean; message: string; data?: any; error?: string }> => {
	try {
		const reportQuery = await firestore_db.collection('ai_summary_reports').where('postType', '==', postType).where('postIndex', '==', postIndex).get();

		const reportCount = reportQuery.size;
		if (reportCount % 3 !== 0) {
			return {
				success: true,
				message: `Total reports: ${reportCount}. Refresh not triggered.`,
				data: { reportCount }
			};
		}

		const { data, error } = await fetchCommentsSummaryFromPost({
			network,
			postId: String(postIndex),
			postType,
			forceRefresh: true
		});

		if (error) {
			return {
				success: false,
				message: 'Failed to refresh comments summary.',
				error
			};
		}

		const batch = firestore_db.batch();
		reportQuery.forEach((doc) => batch.delete(doc.ref));
		await batch.commit();

		return {
			success: true,
			message: 'Comments summary refreshed successfully and reports deleted successfully.',
			data
		};
	} catch (error) {
		console.error('Error processing request:', error);
		return {
			success: false,
			message: 'Internal Server Error',
			error: error instanceof Error ? error.message : 'Unexpected error occurred.'
		};
	}
};

const handler: NextApiHandler = async (req, res) => {
	storeApiKeyUsage(req);

	if (req.method !== 'POST') {
		return res.status(405).json({ message: 'Method Not Allowed. Use POST.' });
	}

	const token = getTokenFromReq(req);
	if (!token) {
		return res.status(400).json({ message: 'Invalid token' });
	}

	const user = await authServiceInstance.GetUser(token);
	if (!user || !user.id) {
		return res.status(403).json({ message: messages.UNAUTHORISED });
	}

	const { postType, postIndex } = req.body;
	const network = String(req.headers['x-network']);

	if (!network || !isValidNetwork(network)) {
		return res.status(400).json({ message: messages.INVALID_NETWORK });
	}

	if (!postType || !Object.values(ProposalType).includes(postType)) {
		return res.status(400).json({ message: 'Invalid postType' });
	}

	if (typeof postIndex !== 'number' || postIndex < 0 || !Number.isInteger(postIndex)) {
		return res.status(400).json({ message: 'Invalid postIndex' });
	}

	const response = await handleReportCheckAndRefresh({ network, postType, postIndex });

	if (response.success) {
		return res.status(200).json({
			message: response.message,
			data: response.data
		});
	} else {
		return res.status(500).json({
			message: response.message,
			error: response.error
		});
	}
};

export default withErrorHandling(handler);
