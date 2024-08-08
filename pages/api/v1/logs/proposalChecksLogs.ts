// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import { isValidNetwork } from '~src/api-utils';

import { EAllowedCommentor, EProposalCheckTypes } from '~src/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import { firestore_db } from '~src/services/firebaseInit';

interface Args {
	activity: EProposalCheckTypes;
	discussionId: number | null;
	content: string | null;
	title: string | null;
	tags: string[];
	allowedCommentors: EAllowedCommentor[];
}

async function handler(req: NextApiRequest, res: NextApiResponse<MessageType>) {
	storeApiKeyUsage(req);

	const { activity, allowedCommentors, content, discussionId, tags, title } = req.body as unknown as Args;

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) {
		return res.status(400).json({ message: messages.INVALID_NETWORK });
	}

	if (![EProposalCheckTypes.PREIMAGE, EProposalCheckTypes.PROPOSAL].includes(activity)) return res.status(400).json({ message: messages.INVALID_PARAMS });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: messages.INVALID_JWT });

	const user = await authServiceInstance.GetUser(token);
	if (!user) return res.status(403).json({ message: messages.UNAUTHORISED });

	try {
		const logsSnapshot = firestore_db.collection('referendumv2_logs').doc(String(user.id)).collection(activity).doc();
		const logsDoc = await logsSnapshot.get();

		const payload: any = {
			allowedCommentors: allowedCommentors || [EAllowedCommentor.ALL],
			created_at: new Date(),
			id: logsDoc.id
		};
		if (typeof discussionId !== 'number' || discussionId === null) {
			payload.content = content || '';
			payload.title = title || '';
			payload.tags = tags || [];
		} else {
			payload.discussion_id = discussionId;
		}

		await logsSnapshot.set(payload, { merge: true });
		return res.status(200).json({ message: messages.SUCCESS });
	} catch (err) {
		return res.status(200).json({ message: err || messages.API_FETCH_ERROR });
	}
}

export default withErrorHandling(handler);
