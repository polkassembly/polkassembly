// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { _processIdentityCleared } from '~src/api-utils/reputationEventsUtils/__processIdentityCleared';
import { _processBountyClaimed } from '~src/api-utils/reputationEventsUtils/_processBountyClaimed';
import { _processCompleteJudgement } from '~src/api-utils/reputationEventsUtils/_processCompleteJudgement';
import { _processDecisionDepositPlaced } from '~src/api-utils/reputationEventsUtils/_processDecisionDepositPlaced';
import { _processDelegated } from '~src/api-utils/reputationEventsUtils/_processDelegated';
import { _processIdentityVerificationSignUp } from '~src/api-utils/reputationEventsUtils/_processIdentityVerificationSignUp';
import { _processProposalCreated } from '~src/api-utils/reputationEventsUtils/_processProposalCreated';
import { _processProposalEnded } from '~src/api-utils/reputationEventsUtils/_processProposalEnded';
import { _processRemovedVote } from '~src/api-utils/reputationEventsUtils/_processRemovedVote';
import { _processTipped } from '~src/api-utils/reputationEventsUtils/_processTipped';
import { _processUndelegated } from '~src/api-utils/reputationEventsUtils/_processUndelegated';
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

	console.log('Line 33: network:', network);

	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid x-network header' });

	if (req.headers['x-api-key'] !== process.env.GOV_EVENT_API_KEY) {
		return res.status(401).json({ message: 'Unauthorized' });
	}

	const { event, address, proposalIndex, proposalType, addressTo } = req.body as {
		event: EReputationEvent;
		address: string;
		proposalIndex: string;
		proposalType: TSubsquidProposalType;
		addressTo: string;
	};

	console.log('Line 48: body:', event, address, proposalIndex, proposalType, addressTo);

	if (!event) return res.status(400).json({ message: 'Missing event in request body' });

	const substrateAddress = getSubstrateAddress(address);

	console.log('Line 54: substrateAddress:', substrateAddress);

	switch (event) {
		case EReputationEvent.PROPOSAL_ENDED: {
			console.log('processing... proposal ended');

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
			console.log('processing... proposal created');

			if (!proposalIndex || !proposalType || !isValidSubsquidProposalType(proposalType) || !substrateAddress) {
				return res.status(400).json({ message: 'Missing parameters in request body' });
			}

			await _processProposalCreated({
				network,
				proposalIndex,
				proposalType,
				proposerAddress: substrateAddress
			});

			return res.status(200).json({ message: 'Success' });
		}

		case EReputationEvent.VOTED: {
			console.log('processing... voted');

			if (!proposalIndex || !proposalType || !isValidSubsquidProposalType(proposalType) || !substrateAddress) {
				return res.status(400).json({ message: 'Missing parameters in request body' });
			}

			await _processVoted({
				network,
				proposalIndex,
				proposalType,
				voterAddress: address
			});

			return res.status(200).json({ message: 'Success' });
		}

		case EReputationEvent.BOUNTY_CLAIMED: {
			console.log('processing... bounty claimed');

			if (!proposalIndex || !proposalType || !isValidSubsquidProposalType(proposalType) || !substrateAddress) {
				return res.status(400).json({ message: 'Missing parameters in request body' });
			}

			await _processBountyClaimed({
				network,
				payeeAddress: substrateAddress,
				proposalIndex,
				proposalType
			});

			return res.status(200).json({ message: 'Success' });
		}

		case EReputationEvent.TIPPED: {
			console.log('processing... tipped');

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
			console.log('processing... decision deposit placed');

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
			console.log('processing... removed vote');

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

		case EReputationEvent.DELEGATED: {
			console.log('processing... delegated');
			if (!substrateAddress || !addressTo) {
				return res.status(400).json({ message: 'Missing parameters in request body' });
			}

			const substrateAddressTo = getSubstrateAddress(addressTo);

			if (!substrateAddressTo) {
				return res.status(400).json({ message: 'Invalid addressTo in request body' });
			}

			await _processDelegated({
				delegateAddress: substrateAddressTo,
				delegatorAddress: substrateAddress,
				network
			});

			return res.status(200).json({ message: 'Success' });
		}

		case EReputationEvent.UNDELEGATED: {
			console.log('processing... undelegated');

			if (!substrateAddress || !addressTo) {
				return res.status(400).json({ message: 'Missing parameters in request body' });
			}

			const substrateAddressTo = getSubstrateAddress(addressTo);

			if (!substrateAddressTo) {
				return res.status(400).json({ message: 'Invalid addressTo in request body' });
			}

			await _processUndelegated({
				delegateAddress: substrateAddressTo,
				delegatorAddress: substrateAddress,
				network
			});

			return res.status(200).json({ message: 'Success' });
		}

		case EReputationEvent.IDENTITY_VERIFICATION_SIGN_UP: {
			console.log('processing... identity verification sign up');
			if (!substrateAddress) {
				return res.status(400).json({ message: 'Missing parameters in request body' });
			}

			await _processIdentityVerificationSignUp({
				address: substrateAddress,
				network
			});

			return res.status(200).json({ message: 'Success' });
		}

		case EReputationEvent.COMPLETE_JUDGEMENT: {
			console.log('processing... complete judgement');
			if (!substrateAddress) {
				return res.status(400).json({ message: 'Missing parameters in request body' });
			}

			await _processCompleteJudgement({
				address: substrateAddress,
				network
			});

			return res.status(200).json({ message: 'Success' });
		}

		case EReputationEvent.IDENTITY_CLEARED:
		case EReputationEvent.IDENTITY_KILLED: {
			console.log('processing... identity cleared or killed');
			if (!substrateAddress) {
				return res.status(400).json({ message: 'Missing parameters in request body' });
			}

			await _processIdentityCleared({
				address: substrateAddress,
				network
			});

			return res.status(200).json({ message: 'Success' });
		}

		default: {
			return res.status(400).json({ message: 'Invalid event in request body' });
		}
	}
}

export default withErrorHandling(handler);
