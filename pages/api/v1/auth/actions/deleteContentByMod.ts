// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { deleteComment } from './deleteComment';

async function handler(req: NextApiRequest, res: NextApiResponse<MessageType>) {
	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if(!network) return res.status(400).json({ message: 'Missing network name in request headers' });

	const { commentId= '', postId, postType , replyId= '', reason = '' } = req.body;
	console.log(commentId, postId, postType, replyId, reason);
	if(isNaN(postId) || !postType || !reason) return res.status(400).json({ message: 'Missing parameters in request body' });

	const token = getTokenFromReq(req);
	if(!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if(!user) return res.status(403).json({ message: messages.UNAUTHORISED });

	const { data, error, status } = await deleteComment({
		commentId,
		network,
		postId,
		postType,
		replyId,
		user
	});

	if(error || !data) {
		res.status(status).json({ message: error || messages.API_FETCH_ERROR });
	}
	else {
		res.status(status).json(data);
	}
}

export default withErrorHandling(handler);