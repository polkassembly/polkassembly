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
import POLL_TYPE, { isPollTypeValid } from '~src/global/pollTypes';
import { ProposalType } from '~src/global/proposalType';

import { getPollCollectionName } from '../../polls';

const handler: NextApiHandler<MessageType> = async (req, res) => {
	if (req.method !== 'POST')
		return res
			.status(405)
			.json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network))
		return res
			.status(400)
			.json({ message: 'Invalid network in request header' });

	const { pollId, postId, userId, pollType, proposalType } = req.body;
	if (!pollId || isNaN(postId) || !userId)
		return res
			.status(400)
			.json({ message: 'Missing parameters in request body' });

	const strProposalType = String(proposalType);
	if (!isOffChainProposalTypeValid(strProposalType))
		return res.status(400).json({
			message: `The off chain proposal type of the name "${proposalType}" does not exist.`,
		});

	const strPollType = String(pollType);
	if (!pollType || !isPollTypeValid(strPollType))
		return res
			.status(400)
			.json({ message: `The pollType "${pollType}" is invalid` });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user || user.id !== Number(userId))
		return res.status(403).json({ message: messages.UNAUTHORISED });

	const pollColName = getPollCollectionName(strPollType);
	if (!['option_polls', 'polls'].includes(pollColName)) {
		return res
			.status(400)
			.json({ message: `The pollType "${pollType}" is invalid` });
	}

	const pollRef = postsByTypeRef(network, strProposalType as ProposalType)
		.doc(String(postId))
		.collection(pollColName)
		.doc(String(pollId));

	const pollDoc = await pollRef.get();

	if (!pollDoc.exists)
		return res.status(404).json({ message: 'Poll not found' });

	let votes_field_name = '';
	if (strPollType === POLL_TYPE.OPTION) {
		votes_field_name = 'option_poll_votes';
	} else if (strPollType === POLL_TYPE.NORMAL) {
		votes_field_name = 'poll_votes';
	} else {
		return res
			.status(400)
			.json({ message: `The pollType "${pollType}" is invalid` });
	}

	const updated: any = {};
	const data = pollDoc.data() as any;

	updated[votes_field_name] = data?.[votes_field_name] || [];
	if (
		!updated[votes_field_name] ||
		!Array.isArray(updated[votes_field_name])
	) {
		return res
			.status(500)
			.json({ message: `The pollType "${pollType}" is invalid` });
	}
	const initialVotes = updated[votes_field_name].length;
	updated[votes_field_name] = updated[votes_field_name].filter(
		(vote: any) => vote.user_id !== user.id,
	);
	if (initialVotes === updated[votes_field_name].length)
		return res.status(400).json({ message: 'No vote found for the user' });

	pollRef
		.update(updated)
		.then(() => {
			return res.status(200).json({ message: 'Poll vote deleted.' });
		})
		.catch((error) => {
			// The document probably doesn't exist.
			console.error('Error deleting poll vote: ', error);
			return res
				.status(500)
				.json({ message: 'Error deleting poll vote' });
		});
};

export default withErrorHandling(handler);
