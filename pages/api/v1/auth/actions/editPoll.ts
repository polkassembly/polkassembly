// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isOffChainProposalTypeValid, isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { isPollTypeValid } from '~src/global/pollTypes';
import { ProposalType } from '~src/global/proposalType';

import { getPollCollectionName } from '../../polls';

const handler: NextApiHandler<MessageType> = async (req, res) => {
	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if(!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const { pollId, postId, userId, blockEnd, pollType, proposalType } = req.body;
	if(!pollId || isNaN(postId) || !userId || !blockEnd) return res.status(400).json({ message: 'Missing parameters in request body' });

	const strProposalType = String(proposalType);
	if (!isOffChainProposalTypeValid(strProposalType)) return res.status(400).json({ message: `The off chain proposal type of the name "${proposalType}" does not exist.` });

	const strPollType = String(pollType);
	if (!pollType || !isPollTypeValid(strPollType)) return res.status(400).json({ message: `The pollType "${pollType}" is invalid` });

	const token = getTokenFromReq(req);
	if(!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if(!user || user.id !== Number(userId)) return res.status(403).json({ message: messages.UNAUTHORISED });

	const updated: any = {};
	let block_end = 0;
	if (strPollType === 'normal') {
		block_end = Number(blockEnd);
		if (isNaN(block_end)) {
			return res.status(400).json({ message: `blockEnd ${blockEnd} must be a number` });
		} else {
			updated['block_end'] = block_end;
		}
	}
	// else if we want to edit option poll

	const pollColName = getPollCollectionName(strPollType);
	const pollRef = postsByTypeRef(network, strProposalType as ProposalType)
		.doc(String(postId))
		.collection(pollColName)
		.doc(String(pollId));

	const pollDoc = await pollRef.get();

	if(!pollDoc.exists) return res.status(404).json({ message: 'Poll not found' });

	pollRef.update(updated).then(() => {
		return res.status(200).json({ message: 'Poll edited.' });
	}).catch((error) => {
		console.error('Error editing poll : ', error);
		return res.status(500).json({ message: 'Error in editing poll' });
	});
};

export default withErrorHandling(handler);
