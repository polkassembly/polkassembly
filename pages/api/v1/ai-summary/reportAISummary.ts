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
}): Promise<{ success: boolean; data?: any; error?: string; isAlreadyReported: boolean }> => {
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
				isAlreadyReported: true,
				data: existingReportQuery.docs[0].data()
			};
		}

		const reportData = {
			userId,
			network,
			postType,
			postIndex,
			reportedAt: dayjs().toDate()
		};

		const reportRef = await firestore_db.collection('ai_summary_reports').add(reportData);

		return {
			success: true,
			isAlreadyReported: false,
			data: {
				reportId: reportRef.id,
				reportData
			}
		};
	} catch (error) {
		console.error('Error creating report:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'An unexpected error occurred.',
			isAlreadyReported: false
		};
	}
};

const handler: NextApiHandler = async (req, res) => {
	storeApiKeyUsage(req);

	const { postType, postIndex } = req.body;

	const token = getTokenFromReq(req);
	if (!token) {
		return res.status(400).json({ message: 'Invalid token' });
	}

	const user = await authServiceInstance.GetUser(token);
	if (!user || !user.id) {
		return res.status(403).json({ message: messages.UNAUTHORISED });
	}

	const network = String(req.headers['x-network']);

	if (!network || !isValidNetwork(network)) {
		return res.status(400).json({ message: messages.INVALID_NETWORK });
	}

	const userId = user.id;

	if (!postType || !postIndex) {
		return res.status(400).json({ message: 'Missing required fields: network, postType, postIndex' });
	}

	const { success, data, error, isAlreadyReported } = await createReportInFirestore({ userId, network, postType, postIndex });

	if (success) {
		if (isAlreadyReported) {
			return res.status(200).json({
				message: 'You have already reported this post.',
				isAlreadyReported: true,
				data
			});
		} else {
			return res.status(201).json({
				message: 'Report successfully submitted.',
				reportId: data.reportId,
				isAlreadyReported: false,
				data: data.reportData
			});
		}
	} else {
		return res.status(500).json({
			message: error || messages.API_FETCH_ERROR,
			isAlreadyReported: false
		});
	}
};

export default withErrorHandling(handler);
