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

export const getAllApprovedExpertRequests = async () => {
	try {
		const expertReqDocs = await firestore_db
			?.collection('expert_requests')
			?.where('status', '==', EExpertReqStatus?.APPROVED)
			?.get();

		const expertRequests = await Promise.all(
			expertReqDocs?.docs.map(async (doc) => {
				const requestData = doc.data();
				const user = await getUserFromUserId(requestData.userId);
				const { profile_score, username, custom_username, profile } = user || {};

				return {
					...requestData,
					custom_username,
					profile,
					profile_score,
					username
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

	const { data, error, status } = await getAllApprovedExpertRequests();

	if (error || !data) {
		return res?.status(status)?.json({ message: error || messages?.API_FETCH_ERROR });
	}
	if (data) {
		return res?.status(status)?.json(data);
	}
};

export default withErrorHandling(handler);
