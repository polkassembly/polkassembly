// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { _processBountyClaimed } from '~src/api-utils/reputationEventsUtils/_processBountyClaimed';
import { _processDecisionDepositPlaced } from '~src/api-utils/reputationEventsUtils/_processDecisionDepositPlaced';
import { _processProposalCreated } from '~src/api-utils/reputationEventsUtils/_processProposalCreated';
import { _processProposalEnded } from '~src/api-utils/reputationEventsUtils/_processProposalEnded';
import { _processRemovedVote } from '~src/api-utils/reputationEventsUtils/_processRemovedVote';
import { _processTipped } from '~src/api-utils/reputationEventsUtils/_processTipped';
import { _processVoted } from '~src/api-utils/reputationEventsUtils/_processVoted';
import { MessageType } from '~src/auth/types';
import { isValidSubsquidProposalType, TSubsquidProposalType } from '~src/global/proposalType';
import { EReputationEvent } from '~src/global/reputationEvents';
import getSubstrateAddress from '~src/util/getSubstrateAddress';

async function handler(req: NextApiRequest, res: NextApiResponse<MessageType>) {
	if (req.method !== 'POST') {
		return res.status(405).json({ message: 'Method not allowed' });
	}

	const network = req.headers['x-network'] as string;

	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid x-network header' });

	if (req.headers['x-api-key'] !== process.env.GOV_EVENT_API_KEY) {
		return res.status(401).json({ message: 'Unauthorized' });
	}

	const { event, address, proposalIndex, proposalType } = req.body as { event: EReputationEvent; address: string; proposalIndex: string; proposalType: TSubsquidProposalType };

	if (!event) return res.status(400).json({ message: 'Missing event in request body' });

	const substrateAddress = getSubstrateAddress(address);

	switch (event) {
		case EReputationEvent.PROPOSAL_ENDED: {
			if (!proposalIndex || !proposalType || !isValidSubsquidProposalType(proposalType)) {
				return res.status(400).json({ message: 'Missing proposalIndex or proposalType in request body' });
			}

			// process reputation scores for proposal 'Vote Successfully Passed' and 'Vote Failed' and 'Failed Proposal'
			await _processProposalEnded({
				network,
				proposalIndex,
				proposalType
			});

			return res.status(200).json({ message: 'Success' });
		}

		case EReputationEvent.PROPOSAL_CREATED: {
			if (!proposalIndex || !proposalType || !isValidSubsquidProposalType(proposalType) || !substrateAddress) {
				return res.status(400).json({ message: 'Missing parameters in request body' });
			}

			await _processProposalCreated({
				proposalType,
				proposerAddress: substrateAddress
			});

			return res.status(200).json({ message: 'Success' });
		}

		case EReputationEvent.VOTED: {
			if (!proposalIndex || !proposalType || !isValidSubsquidProposalType(proposalType) || !substrateAddress) {
				return res.status(400).json({ message: 'Missing parameters in request body' });
			}

			await _processVoted({
				voterAddress: substrateAddress
			});

			return res.status(200).json({ message: 'Success' });
		}

		case EReputationEvent.BOUNTY_CLAIMED: {
			if (!proposalIndex || !proposalType || !isValidSubsquidProposalType(proposalType) || !substrateAddress) {
				return res.status(400).json({ message: 'Missing parameters in request body' });
			}

			await _processBountyClaimed({
				payeeAddress: substrateAddress
			});

			return res.status(200).json({ message: 'Success' });
		}

		case EReputationEvent.TIPPED: {
			if (!proposalIndex || !proposalType || !isValidSubsquidProposalType(proposalType) || !substrateAddress) {
				return res.status(400).json({ message: 'Missing parameters in request body' });
			}

			await _processTipped({
				network,
				proposalIndex,
				proposalType,
				tipperAddress: address // sending non substrate address to query subsquid
			});

			return res.status(200).json({ message: 'Success' });
		}

		case EReputationEvent.DECISION_DEPOSIT_PLACED: {
			if (!proposalIndex || !proposalType || !isValidSubsquidProposalType(proposalType) || !substrateAddress) {
				return res.status(400).json({ message: 'Missing parameters in request body' });
			}

			// process reputation scores for proposal 'User can place decision deposit on behalf of another proposal'
			await _processDecisionDepositPlaced({
				depositorAddress: address, // sending non substrate address to query subsquid
				network,
				proposalIndex,
				proposalType
			});

			return res.status(200).json({ message: 'Success' });
		}

		case EReputationEvent.REMOVED_VOTE: {
			if (!proposalIndex || !proposalType || !isValidSubsquidProposalType(proposalType) || !substrateAddress) {
				return res.status(400).json({ message: 'Missing parameters in request body' });
			}

			await _processRemovedVote({
				network,
				proposalIndex,
				proposalType,
				voterAddress: address // sending non substrate address to query subsquid
			});

			return res.status(200).json({ message: 'Success' });
		}

		default: {
			return res.status(400).json({ message: 'Invalid event in request body' });
		}
	}
}

export default withErrorHandling(handler);
