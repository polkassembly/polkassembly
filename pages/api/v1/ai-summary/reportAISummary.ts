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
import dayjs from 'dayjs';
import { isValidNetwork } from '~src/api-utils';

const createReportInFirestore = async ({
	userId,
	network,
	postType,
	postIndex
}: {
	userId: number;
	network: string;
	postType: string;
	postIndex: number;
}): Promise<{ success: boolean; message: string; error?: string; data?: any }> => {
	try {
		const existingReportQuery = await firestore_db
			.collection('ai_summary_reports')
			.where('userId', '==', userId)
			.where('network', '==', network)
			.where('postType', '==', postType)
			.where('postIndex', '==', postIndex)
			.get();

		if (!existingReportQuery.empty) {
			return {
				success: true,
				message: 'You have already reported this post.',
				data: { isAlreadyReported: true }
			};
		}

		const reportData = {
			userId,
			network,
			postType,
			postIndex,
			reportedAt: dayjs().toDate()
		};

		await firestore_db.collection('ai_summary_reports').add(reportData);

		return {
			success: true,
			message: 'Report successfully submitted.',
			data: { isAlreadyReported: false }
		};
	} catch (error) {
		console.error('Error creating report:', error);
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

	if (!postType) {
		return res.status(400).json({ message: 'Invalid postType' });
	}

	if (typeof postIndex !== 'number' || postIndex < 0 || !Number.isInteger(postIndex)) {
		return res.status(400).json({ message: 'Invalid postIndex' });
	}

	const response = await createReportInFirestore({ userId: user.id, network, postType, postIndex });

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
