// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isProposalTypeValid } from '~src/api-utils';
import { isOffChainProposalTypeValid } from '~src/api-utils';
import { networkDocRef } from '~src/api-utils/firestore_refs';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';

export interface IReportContentResponse {
	message: string;
	user_reports_count: number;
}

async function handler(req: NextApiRequest, res: NextApiResponse<IReportContentResponse | MessageType>) {

	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if(!network) return res.status(400).json({ message: 'Missing network in request header' });

	const { type, content_id, reason, comments, proposalType } = req.body;
	if(!type || !content_id || !reason || !comments || !proposalType) return res.status(400).json({ message: 'Missing parameters in request body' });

	if (!isOffChainProposalTypeValid(proposalType) && !isProposalTypeValid(proposalType)) {
		return res.status(400).json({ message: `Proposal type ${proposalType} is not valid.` });
	}

	const token = getTokenFromReq(req);
	if(!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if(!user) return res.status(400).json({ message: messages.USER_NOT_FOUND });

	if (!['post', 'comment'].includes(type)) return res.status(400).json({ message: messages.REPORT_TYPE_INVALID });
	if (!reason) return res.status(400).json({ message: messages.REPORT_REASON_REQUIRED });
	if (comments.length > 300) return res.status(400).json({ message: messages.REPORT_COMMENTS_LENGTH_EXCEDEED });

	await networkDocRef(network).collection('reports').add({
		comments,
		content_id: ((type === 'post' && proposalType !== 'tips')? Number(content_id): content_id),
		proposal_type: String(proposalType),
		reason,
		resolved: false,
		type,
		user_id: user.id
	}).then(async () => {
		const countQuery = await networkDocRef(network).collection('reports').where('user_id', '==', user.id).where('proposal_type', '==', String(proposalType)).where('content_id', '==', ((type === 'post' && proposalType !== 'tips')? Number(content_id): content_id)).count().get();
		const data = countQuery.data();
		return res.status(200).json({ message: messages.CONTENT_REPORT_SUCCESSFUL, user_reports_count: data?.count });
	}).catch((error) => {
		console.log(' Error while reporting content : ', error);
		return res.status(500).json({ message: 'Error while reporting content.' });
	});

}

export default withErrorHandling(handler);
