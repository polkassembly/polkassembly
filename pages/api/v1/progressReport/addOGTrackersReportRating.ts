// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isProposalTypeValid, isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import authServiceInstance from '~src/auth/auth';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import { Post, IProgressReport } from '~src/types';
import { Timestamp } from 'firebase-admin/firestore';

const addOrUpdateProgressReport: NextApiHandler<{ message: string; progress_report?: object }> = async (req, res) => {
	try {
		storeApiKeyUsage(req);

		if (req.method !== 'POST') {
			return res.status(405).json({ message: 'Invalid request method, POST required.' });
		}

		const network = String(req.headers['x-network']);
		if (!network || !isValidNetwork(network)) {
			return res.status(400).json({ message: messages.INVALID_NETWORK });
		}

		const token = getTokenFromReq(req);
		if (!token) {
			return res.status(400).json({ message: messages.INVALID_JWT });
		}

		const user = await authServiceInstance.GetUser(token);
		if (!user) {
			return res.status(403).json({ message: messages.UNAUTHORISED });
		}

		const user_id = user?.id?.toString();

		const { postId, proposalType, rating, reportId, progress_summary, progress_file, created_at } = req.body;

		if (!proposalType || rating === undefined || !reportId || isNaN(postId) || !isProposalTypeValid(proposalType)) {
			return res.status(400).json({ message: messages.INVALID_PARAMS });
		}

		const postDocRef = postsByTypeRef(network, proposalType).doc(String(postId));
		const postDoc = await postDocRef.get();

		if (!postDoc.exists) {
			return res.status(404).json({ message: 'Post not found.' });
		}

		const postData = postDoc.data() as Post;
		const progressReports = postData.progress_report || [];

		const reportExists = progressReports.some((report: IProgressReport) => report.id === reportId);

		if (!reportExists) {
			progressReports.push({
				created_at: new Date(created_at),
				id: reportId,
				isFromOgtracker: true,
				progress_file,
				progress_summary,
				ratings: [{ rating, user_id }]
			});
		}

		await postDocRef.update({
			progress_report: progressReports
		});

		return res.status(200).json({
			message: messages.PROGRESS_REPORT_UPDATED_SUCCESSFULLY,
			progress_report: progressReports.map((report: IProgressReport) => ({
				...report,
				created_at: report.created_at instanceof Timestamp ? report.created_at.toDate() : report.created_at
			}))
		});
	} catch (error) {
		console.error('Error in adding/updating progress report:', error);
		return res.status(500).json({ message: error.message || 'An error occurred while processing the request.' });
	}
};

export default withErrorHandling(addOrUpdateProgressReport);
