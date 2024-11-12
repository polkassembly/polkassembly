// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getFirestoreProposalType, ProposalType, TSubsquidProposalType } from '~src/global/proposalType';
import { getProposerByIndexAndType } from '../getProposerByIndexAndType';
import REPUTATION_SCORES from '~src/util/reputationScores';
import { getAllVotersByProposalIdAndType } from './getAllVotersByProposalIdAndType';
import changeProfileScoreForAddress from 'pages/api/v1/utils/changeProfileScoreForAddress';
import { getProposalEndedInfo } from './getProposalEndedInfo';
import dayjs from 'dayjs';
import { EUserActivityType } from '~src/types';
import { firestore_db } from '~src/services/firebaseInit';

enum ProposalStatus {
	Noted = 'Noted',
	Proposed = 'Proposed',
	Tabled = 'Tabled',
	Started = 'Started',
	Passed = 'Passed',
	NotPassed = 'NotPassed',
	Cancelled = 'Cancelled',
	CuratorProposed = 'CuratorProposed',
	CuratorAssigned = 'CuratorAssigned',
	CuratorUnassigned = 'CuratorUnassigned',
	Executed = 'Executed',
	ExecutionFailed = 'ExecutionFailed',
	Used = 'Used',
	Invalid = 'Invalid',
	Missing = 'Missing',
	Reaped = 'Reaped',
	Approved = 'Approved',
	Disapproved = 'Disapproved',
	Closed = 'Closed',
	Awarded = 'Awarded',
	Added = 'Added',
	Rejected = 'Rejected',
	Retracted = 'Retracted',
	Slashed = 'Slashed',
	Active = 'Active',
	Extended = 'Extended',
	Claimed = 'Claimed',
	Unrequested = 'Unrequested',
	Requested = 'Requested',
	Submitted = 'Submitted',
	Killed = 'Killed',
	Cleared = 'Cleared',
	Deciding = 'Deciding',
	ConfirmStarted = 'ConfirmStarted',
	ConfirmAborted = 'ConfirmAborted',
	Confirmed = 'Confirmed',
	DecisionDepositPlaced = 'DecisionDepositPlaced',
	TimedOut = 'TimedOut',
	Opened = 'Opened'
}

const isFailedTerminalStatus = (proposalStatus: ProposalStatus) => {
	return [
		ProposalStatus.NotPassed,
		ProposalStatus.Cancelled,
		ProposalStatus.ExecutionFailed,
		ProposalStatus.Invalid,
		ProposalStatus.Disapproved,
		ProposalStatus.Rejected,
		ProposalStatus.Killed,
		ProposalStatus.Slashed,
		ProposalStatus.ConfirmAborted,
		ProposalStatus.TimedOut
	].includes(proposalStatus);
};

export async function _processProposalEnded({ network, proposalIndex, proposalType }: { network: string; proposalIndex: string; proposalType: TSubsquidProposalType }) {
	// fetch proposal status
	const proposalStatus = await getProposalEndedInfo(network, proposalIndex, proposalType);

	console.log('proposalStatus:', proposalStatus);

	if (!proposalStatus) {
		return;
	}

	// 1. get author of proposal and add or subtract reputation score from author
	const proposerAddress = await getProposerByIndexAndType(network, proposalIndex, proposalType);

	const isFailedProposal = isFailedTerminalStatus(proposalStatus.status as ProposalStatus);

	//create activity for user for proposal voting
	const activityPayload = {
		by: proposerAddress,
		created_at: dayjs(proposalStatus.endedAt).toDate() || new Date(),
		is_deleted: false,
		network,
		post_id: proposalIndex.startsWith('0x') ? proposalIndex : Number(proposalIndex),
		post_type: getFirestoreProposalType(proposalType) as ProposalType,
		type: isFailedProposal ? EUserActivityType.PROPOSAL_FAILED : EUserActivityType.PROPOSAL_PASSED,
		updated_at: dayjs(proposalStatus.endedAt).toDate() || new Date()
	};

	//save activity to firestore
	await firestore_db.collection('user_activities').add(activityPayload);

	// get count of proposal failed or passed

	const activityCount =
		(
			await firestore_db
				.collection('user_activities')
				.where('network', '==', network)
				.where('by', '==', proposerAddress)
				.where('type', '==', isFailedProposal ? EUserActivityType.PROPOSAL_FAILED : EUserActivityType.PROPOSAL_PASSED)
				.count()
				.get()
		).data().count || 0;

	if (proposerAddress) {
		if (isFailedProposal) {
			await changeProfileScoreForAddress(proposerAddress, REPUTATION_SCORES.failed_proposal[activityCount > 2 ? 'third_or_more' : activityCount === 2 ? 'second' : 'first']);
		} else {
			await changeProfileScoreForAddress(proposerAddress, REPUTATION_SCORES.passed_proposal[activityCount > 2 ? 'third_or_more' : activityCount === 2 ? 'second' : 'first']);
		}
	}

	// 3. get all votes for this proposal and add or subtract reputation score from voters
	const voters = await getAllVotersByProposalIdAndType({
		network,
		proposalIndex,
		proposalType
	});

	const votersPromises = voters.map(async (voter) => {
		await changeProfileScoreForAddress(voter, REPUTATION_SCORES[isFailedProposal ? 'vote_failed' : 'vote_passed'].value);
	});

	await Promise.all(votersPromises);
}
