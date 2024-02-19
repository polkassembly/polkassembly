// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import messages from '~src/util/messages';
import { MessageType } from '~src/auth/types';
import { ProposalType, getProposalTypeTitle, getSubsquidProposalType } from '~src/global/proposalType';
import { GET_PROPOSAL_BY_INDEX_AND_TYPE } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { gov2ReferendumStatus } from '~src/global/statuses';

export interface ITitleAndContent {
	title: string;
	content: string;
}

export const getTitleAndContent = async ({ network, index }: { network: string; index: number }) => {
	try {
		const query = GET_PROPOSAL_BY_INDEX_AND_TYPE;
		const postVariables = {
			index_eq: Number(index),
			type_eq: getSubsquidProposalType(ProposalType.REFERENDUM_V2)
		};
		const subsquidRes = await fetchSubsquid({
			network,
			query: query,
			variables: postVariables
		});
		const proposalData = subsquidRes.data.proposals?.[0];
		if (!proposalData) {
			return {
				data: { content: '', title: '' } as ITitleAndContent,
				error: 'The Proposal number is not valid',
				status: 200
			};
		}
		const canVote =
			Boolean(proposalData.status) &&
			[
				gov2ReferendumStatus.CONFIRM_ABORTED,
				gov2ReferendumStatus.CONFIRM_STARTED,
				gov2ReferendumStatus.DECISION_DEPOSIT_PLACED,
				gov2ReferendumStatus.DECIDING,
				gov2ReferendumStatus.SUBMITTED
			].includes(proposalData.status);
		if (!canVote) {
			return {
				data: { content: '', title: '' } as ITitleAndContent,
				error: `The Proposal is currently in ${proposalData.status} status and cannot be cancelled or killed`,
				status: 200
			};
		}
		const postDocRef = postsByTypeRef(network, ProposalType.REFERENDUM_V2).doc(String(index));
		const data = await postDocRef.get();
		if (data.exists) {
			const post = data.data();
			return {
				data: { content: post?.content, title: post?.title } as ITitleAndContent,
				error: null,
				status: 200
			};
		}

		const title = `This is a ${getProposalTypeTitle(ProposalType.REFERENDUM_V2)} with index #${index}`;
		const content = `This is a ${getProposalTypeTitle(
			ProposalType.REFERENDUM_V2
		)}. Only this user can edit this description and the title. If you own this account, login and tell us more about your proposal.`;
		return {
			data: { content, title } as ITitleAndContent,
			error: null,
			status: 200
		};
	} catch (error) {
		return {
			data: null,
			error: error.message || messages.API_FETCH_ERROR,
			status: Number(error.name) || 500
		};
	}
};

const handler: NextApiHandler<ITitleAndContent | MessageType> = async (req, res) => {
	const { index } = req.body;
	const network = String(req.headers['x-network']);

	if (!index) {
		return res.status(400).json({ message: messages.NETWORK_VALIDATION_ERROR });
	}
	if (!network || !isValidNetwork(network)) {
		return res.status(400).json({ message: messages.NETWORK_VALIDATION_ERROR });
	}
	const { data, error, status } = await getTitleAndContent({
		index,
		network
	});

	if (error || !data) {
		return res.status(status).json({ message: error || messages.API_FETCH_ERROR });
	} else {
		return res.status(status).json(data);
	}
};

export default withErrorHandling(handler);
