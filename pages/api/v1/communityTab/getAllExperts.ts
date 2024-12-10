// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import messages from '~src/util/messages';
import { firestore_db } from '~src/services/firebaseInit';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import { EExpertReqStatus } from '~src/types';
import getUserFromUserId from '~src/auth/utils/getUserFromUserId';

export interface ExpertRequestResponse {
	count: number;
	data: any[];
}

export const getAllApprovedExpertRequests = async ({ username }: { username?: string }) => {
	try {
		let expertReqDocs;

		if (username) {
			const userDoc = await firestore_db?.collection('users')?.where('username', '==', username)?.get();
			if (!userDoc?.empty) {
				const userId = userDoc.docs[0].id;
				expertReqDocs = await firestore_db?.collection('expert_requests')?.where('status', '==', EExpertReqStatus.APPROVED)?.where('userId', '==', userId)?.get();
			} else {
				return {
					data: { count: 0, data: [] } as ExpertRequestResponse,
					error: null,
					status: 200
				};
			}
		} else {
			expertReqDocs = await firestore_db?.collection('expert_requests')?.where('status', '==', EExpertReqStatus.APPROVED)?.get();
		}

		const expertRequests = await Promise.all(
			expertReqDocs?.docs.map(async (doc) => {
				const requestData = doc.data();
				const user = await getUserFromUserId(requestData.userId);
				const { profile_score, username: fetchedUsername, custom_username, profile } = user || {};

				return {
					...requestData,
					custom_username,
					profile,
					profile_score,
					username: fetchedUsername
				};
			})
		);

		return {
			data: { count: expertReqDocs?.size, data: expertRequests } as ExpertRequestResponse,
			error: null,
			status: 200
		};
	} catch (error) {
		return {
			data: null,
			error: error?.message || messages?.API_FETCH_ERROR,
			status: Number(error?.name) || 500
		};
	}
};

const handler: NextApiHandler<ExpertRequestResponse | { message: string }> = async (req, res) => {
	storeApiKeyUsage(req);

	const { username } = req.body;

	const { data, error, status } = await getAllApprovedExpertRequests({ username });

	if (error || !data) {
		return res?.status(status)?.json({ message: error || messages?.API_FETCH_ERROR });
	}
	if (data) {
		return res?.status(status)?.json(data);
	}
};

export default withErrorHandling(handler);
