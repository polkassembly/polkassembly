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
import { getSubsquidProposalType, ProposalType } from '~src/global/proposalType';
import { redisDel } from '~src/auth/redis';

const handler: NextApiHandler<{ message: string; progress_report?: object }> = async (req, res) => {
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

		const { postId, proposalType, rating, reportId } = req.body;

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

		const updatedProgressReports = progressReports.map((report: IProgressReport) => {
			if (report.id === reportId) {
				let ratings = report.ratings || [];
				ratings = ratings.filter((r: { user_id: string }) => r.user_id !== user_id);
				ratings.push({ rating, user_id });
				return {
					...report,
					ratings
				};
			}
			return report;
		});

		await postDocRef.update({
			progress_report: updatedProgressReports
		});

		const subsquidProposalType = getSubsquidProposalType(proposalType);
		if (proposalType == ProposalType.REFERENDUM_V2 && process.env.IS_CACHING_ALLOWED == '1') {
			const referendumDetailsKey = `${network}_OpenGov_${subsquidProposalType}_postId_${postId}`;
			await redisDel(referendumDetailsKey);
		}

		return res.status(200).json({
			message: messages.PROGRESS_REPORT_UPDATED_SUCCESSFULLY,
			progress_report: updatedProgressReports
		});
	} catch (error) {
		console.error('Error in updating progress report:', error);
		return res.status(500).json({ message: error || 'An error occurred while processing the request.' });
	}
};

export default withErrorHandling(handler);
