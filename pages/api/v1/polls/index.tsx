// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isOffChainProposalTypeValid, isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { MessageType } from '~src/auth/types';
import POLL_TYPE, { isPollTypeValid } from '~src/global/pollTypes';
import { ProposalType } from '~src/global/proposalType';
import { IOptionPoll, IPoll, IRemarkPoll } from '~src/types';

export function getPollCollectionName(pollType: string): string {
	switch(pollType) {
	case 'normal':
		return 'polls';
	case 'option':
		return 'option_polls';
	case 'remark_poll':
		return 'remark_polls';
	}
	return '';
}

export interface IPollsResponse {
	polls: IPoll[];
}

export interface IOptionPollsResponse {
	optionPolls: IOptionPoll[];
}

const handler: NextApiHandler<IPollsResponse | IOptionPollsResponse | IRemarkPoll | MessageType> = async (req, res) => {
	const { postId = null, pollType, proposalType } = req.query;
	if (isNaN(Number(postId))) return res.status(400).json({ message: 'Invalid post ID.' });

	const network = String(req.headers['x-network']);
	if(!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const strProposalType = String(proposalType);
	if (!isOffChainProposalTypeValid(strProposalType)) return res.status(400).json({ message: `The off chain proposal type of the name "${proposalType}" does not exist.` });

	const strPollType = String(pollType);
	if (!pollType || !isPollTypeValid(strPollType)) return res.status(400).json({ message: `The pollType "${pollType}" is invalid` });

	const pollsQuery = await postsByTypeRef(network, strProposalType as ProposalType)
		.doc(String(postId))
		.collection(getPollCollectionName(strPollType))
		.get();

	if(pollsQuery.empty) return res.status(404).json({ message: 'No polls found for this post.' });

	const polls: IPoll[] = [];
	const optionPolls: IOptionPoll[] = [];
	let remarkPoll: IRemarkPoll | undefined = undefined;

	pollsQuery.forEach((poll) => {
		if (poll.exists) {
			const data = poll.data();
			if (data) {
				if (strPollType === POLL_TYPE.OPTION) {
					optionPolls.push({
						created_at: data.created_at,
						end_at: data.end_at,
						id: data.id,
						option_poll_votes: data.option_poll_votes || [],
						options: data.options || [],
						question: data.question || '',
						updated_at: data.updated_at
					});
				} else if (strPollType === POLL_TYPE.NORMAL) {
					polls.push({
						block_end: data.block_end,
						created_at: data.created_at,
						id: data.id,
						poll_votes: data.poll_votes || [],
						updated_at: data.updated_at
					});
				} else if (strPollType === POLL_TYPE.REMARK) {
					remarkPoll = {
						...data,
						created_at: data.created_at?.toDate ? data.created_at?.toDate(): data.created_at,
						updated_at: data.updated_at?.toDate ? data.updated_at?.toDate(): data.updated_at
					} as IRemarkPoll;
				}
			}
		}
	});

	if (strPollType === POLL_TYPE.OPTION) {
		res.status(200).json({
			optionPolls
		});
	} else if (strPollType === POLL_TYPE.NORMAL) {
		res.status(200).json({
			polls
		});
	} else if (strPollType === POLL_TYPE.REMARK && remarkPoll) {
		res.status(200).json(remarkPoll);
	} else {
		return res.status(400).json({ message: `The pollType "${pollType}" is invalid` });
	}
	return;
};

export default withErrorHandling(handler);