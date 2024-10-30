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

const handler: NextApiHandler<{ message: string; progress_report_views?: number[] }> = async (req, res) => {
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
			return res.status(401).json({ message: messages.INVALID_JWT });
		}

		const user = await authServiceInstance.GetUser(token);
		if (!user || !user.id) {
			return res.status(401).json({ message: messages.UNAUTHORISED });
		}

		const { postId, proposalType } = req.body;
		if (!postId || !proposalType || !isProposalTypeValid(proposalType)) {
			return res.status(400).json({ message: messages.INVALID_PARAMS });
		}

		const postDocRef = postsByTypeRef(network, proposalType).doc(String(postId));
		const postDoc = await postDocRef.get();

		if (!postDoc.exists) {
			return res.status(404).json({ message: 'Post not found.' });
		}

		const existingProgressReportViews: number[] = postDoc.data()?.progress_report_views || [];

		if (!existingProgressReportViews.includes(user.id)) {
			existingProgressReportViews.push(user.id);

			await postDocRef.update({
				last_viewed_at: new Date(),
				progress_report_views: existingProgressReportViews
			});
		}

		return res.status(200).json({
			message: 'Progress report views updated successfully.',
			progress_report_views: existingProgressReportViews
		});
	} catch (error) {
		console.error('Error in updating progress report views:', error);
		return res.status(500).json({ message: messages.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
