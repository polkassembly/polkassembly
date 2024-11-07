// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { IProgressReport } from '~src/types';
import messages from '~src/auth/utils/messages';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import { getFirestoreProposalType, ProposalType } from '~src/global/proposalType';
import { Timestamp } from 'firebase-admin/firestore';

const handler: NextApiHandler<{ message: string; progress_report?: IProgressReport[] }> = async (req, res) => {
	try {
		storeApiKeyUsage(req);
		if (req.method !== 'POST') {
			return res.status(405).json({ message: 'Invalid request method, POST required.' });
		}

		const network = String(req.headers['x-network']);
		if (!network || !isValidNetwork(network)) {
			return res.status(400).json({ message: messages.INVALID_NETWORK });
		}

		const { postId, type } = req.body;

		if (!postId || !network || !type) {
			return res.status(400).json({ message: 'Invalid request parameters.' });
		}

		const proposalType = getFirestoreProposalType(type) as ProposalType;

		const postDocRef = postsByTypeRef(network, proposalType).doc(String(postId));
		const postDoc = await postDocRef.get();

		if (!postDoc.exists) {
			return res.status(404).json({ message: 'Post not found.' });
		}

		let progressReport = postDoc.data()?.progress_report;

		if (!progressReport) {
			return res.status(400).json({ message: 'Progress report not found for the specified post.' });
		}

		progressReport = progressReport.map((report: IProgressReport) => ({
			...report,
			created_at: report.created_at instanceof Timestamp ? report.created_at.toDate() : report.created_at
		}));

		return res.status(200).json({
			message: 'Progress report found.',
			progress_report: progressReport
		});
	} catch (error) {
		console.error('Error checking progress report:', error);
		return res.status(500).json({ message: 'An error occurred while checking the progress report.' });
	}
};

export default withErrorHandling(handler);
