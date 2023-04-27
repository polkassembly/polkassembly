// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CustomStatus } from '~src/components/Listing/Tracks/TrackListingCard';

// TODO: Optimize this
export enum ProposalType {
	DEMOCRACY_PROPOSALS = 'democracy_proposals',
	TECH_COMMITTEE_PROPOSALS = 'tech_committee_proposals',
	TREASURY_PROPOSALS = 'treasury_proposals',
	REFERENDUMS = 'referendums',
	FELLOWSHIP_REFERENDUMS = 'fellowship_referendums',
	COUNCIL_MOTIONS = 'council_motions',
	BOUNTIES = 'bounties',
	TIPS = 'tips',
	CHILD_BOUNTIES = 'child_bounties',
	OPEN_GOV = 'referendums_v2',
	REFERENDUM_V2 = 'referendums_v2',
	DISCUSSIONS = 'discussions',
	GRANTS = 'grants',
	ALLIANCE_MOTION = 'AllianceMotion',
	ANNOUNCEMENT = 'Announcement'
}
export enum OffChainProposalType {
	DISCUSSIONS = 'discussions',
	GRANTS = 'grants'
}

export enum EGovType {
	OPEN_GOV = 'open_gov',
	GOV1 = 'gov1'
}

export const govTypes = ['open_gov'];

export type TSubsquidProposalType =
	| 'AllianceMotion'
	| 'Announcement'
	| 'DemocracyProposal'
	| 'TechCommitteeProposal'
	| 'TreasuryProposal'
	| 'Referendum'
	| 'FellowshipReferendum'
	| 'CouncilMotion'
	| 'Bounty'
	| 'Tip'
	| 'ChildBounty'
	| 'ReferendumV2'
	| 'FellowshipReferendum';

export function getSubsquidProposalType(proposalType: Exclude<ProposalType, ProposalType.DISCUSSIONS | ProposalType.GRANTS>): TSubsquidProposalType {
	switch(proposalType) {
	case ProposalType.DEMOCRACY_PROPOSALS:
		return 'DemocracyProposal';
	case ProposalType.TECH_COMMITTEE_PROPOSALS:
		return 'TechCommitteeProposal';
	case ProposalType.TREASURY_PROPOSALS:
		return 'TreasuryProposal';
	case ProposalType.REFERENDUMS:
		return 'Referendum';
	case ProposalType.FELLOWSHIP_REFERENDUMS:
		return 'FellowshipReferendum';
	case ProposalType.COUNCIL_MOTIONS:
		return 'CouncilMotion';
	case ProposalType.BOUNTIES:
		return 'Bounty';
	case ProposalType.TIPS:
		return 'Tip';
	case ProposalType.CHILD_BOUNTIES:
		return 'ChildBounty';
	case ProposalType.OPEN_GOV:
		return 'ReferendumV2';
	case ProposalType.ALLIANCE_MOTION:
		return 'AllianceMotion';
	case ProposalType.ANNOUNCEMENT:
		return 'Announcement';
	}
}
export function getFirestoreProposalType(proposalType: string): string {
	switch(proposalType) {
	case 'AllianceMotion':
		return 'AllianceMotion';
	case 'Announcement':
		return 'Announcement';
	case 'DemocracyProposal':
		return 'democracy_proposals';
	case 'TechCommitteeProposal':
		return 'tech_committee_proposals';
	case 'TreasuryProposal':
		return 'treasury_proposals';
	case 'Referendum':
		return 'referendums';
	case 'FellowshipReferendum':
		return 'fellowship_referendums';
	case 'CouncilMotion':
		return 'council_motions';
	case 'Bounty':
		return 'bounties';
	case 'Tip':
		return 'tips';
	case 'ChildBounty':
		return 'child_bounties';
	case 'ReferendumV2':
		return 'referendums_v2';
	case 'Discussions':
		return 'discussions';
	case 'Grants':
		return 'grants';
	}
	return '';
}

export function getProposalTypeTitle(proposalType: ProposalType) {
	switch(proposalType) {
	case ProposalType.BOUNTIES:
		return 'bounty proposal';
	case ProposalType.CHILD_BOUNTIES:
		return 'child bounty';
	case ProposalType.TREASURY_PROPOSALS:
		return 'treasury proposal';
	case ProposalType.TECH_COMMITTEE_PROPOSALS:
		return 'techincal committee proposal';
	case ProposalType.DEMOCRACY_PROPOSALS:
		return 'democracy proposal';
	case ProposalType.COUNCIL_MOTIONS:
		return 'council motion';
	case ProposalType.FELLOWSHIP_REFERENDUMS:
		return 'fellowship referendum';
	case ProposalType.REFERENDUMS:
		return 'referendum';
	case ProposalType.OPEN_GOV:
		return 'referendumV2';
	case ProposalType.TIPS:
		return 'tip';
	case ProposalType.ALLIANCE_MOTION:
		return 'alliance motion';
	case ProposalType.ANNOUNCEMENT:
		return 'announcement';
	}
}
export function getSinglePostLinkFromProposalType(proposalType: ProposalType | OffChainProposalType): string {
	switch(proposalType) {
	case ProposalType.BOUNTIES:
		return 'bounty';
	case ProposalType.CHILD_BOUNTIES:
		return 'child_bounty';
	case ProposalType.COUNCIL_MOTIONS:
		return 'motion';
	case ProposalType.DEMOCRACY_PROPOSALS:
		return 'proposal';
	case ProposalType.DISCUSSIONS:
		return 'post';
	case ProposalType.GRANTS:
		return 'grant';
	case ProposalType.FELLOWSHIP_REFERENDUMS:
		return 'fellowship_referendum';
	case ProposalType.OPEN_GOV:
		return 'referenda';
	case ProposalType.REFERENDUMS:
		return 'referendum';
	case ProposalType.TECH_COMMITTEE_PROPOSALS:
		return 'tech';
	case ProposalType.TIPS:
		return 'tip';
	case ProposalType.TREASURY_PROPOSALS:
		return 'treasury';
	case ProposalType.ALLIANCE_MOTION:
		return 'alliance-motion';
	case ProposalType.ANNOUNCEMENT:
		return 'alliance-announcement';
	}
	return '';
}
export function getProposalTypeFromSinglePostLink(link: string): ProposalType | undefined {
	switch(link) {
	case 'bounty':
		return ProposalType.BOUNTIES;
	case 'child_bounty':
		return ProposalType.CHILD_BOUNTIES;
	case 'motion':
		return ProposalType.COUNCIL_MOTIONS;
	case 'proposal':
		return ProposalType.DEMOCRACY_PROPOSALS;
	case 'post':
		return ProposalType.DISCUSSIONS;
	case 'grant':
		return ProposalType.GRANTS;
	case 'fellowship_referendum':
		return ProposalType.FELLOWSHIP_REFERENDUMS;
	case 'referenda':
		return ProposalType.OPEN_GOV;
	case 'referendum':
		return ProposalType.REFERENDUMS;
	case 'tech':
		return ProposalType.TECH_COMMITTEE_PROPOSALS;
	case 'tip':
		return ProposalType.TIPS;
	case 'treasury':
		return ProposalType.TREASURY_PROPOSALS;
	}
}

export const proposalTypes = ['democracy_proposals', 'tech_committee_proposals', 'treasury_proposals', 'referendums', 'fellowship_referendums', 'council_motions', 'bounties', 'tips', 'child_bounties', 'open_gov', 'referendums_v2', 'AllianceMotion', 'Announcement'];
export const offChainProposalTypes = ['discussions', 'grants'];

export const checkIsOnChainPost = (proposalType: string) => {
	return !offChainProposalTypes.includes(proposalType);
};

export const gov1ProposalTypes = ['DemocracyProposal', 'TechCommitteeProposal', 'TreasuryProposal', 'Referendum', 'CouncilMotion', 'Bounty', 'Tip', 'ChildBounty'];

export const collectivesProposalTypes = ['AllianceMotion', 'Announcement', 'UnscrupulousItem'];

export enum VoteType {
	MOTION = 'Motion',
	FELLOWSHIP = 'Fellowship',
	REFERENDUM = 'Referendum',
	REFERENDUM_V2 = 'ReferendumV2',
	DEMOCRACY_PROPOSAL = 'DemocracyProposal'
}

export const voteTypes = ['Motion', 'Fellowship', 'Referendum', 'ReferendumV2'];

export enum TrackPostStatus {
	ALL = 'All',
	CONFIRMED = 'Confirmed',
	CANCELLED = 'Cancelled',
	DECIDING = 'Deciding',
	KILLED = 'Killed',
	SUBMITTED = 'Submitted',
	REJECTED = 'Rejected',
	TIMED_OUT = 'TimedOut'
}

export const tracksNo = [0, 1, 10, 11, 12, 13, 14, 15, 20, 21, 30, 31, 32, 33, 34];

export const trackPostStatuses = ['All', 'Confirmed', 'ConfirmStarted', 'Cancelled', 'Deciding', 'DecisionDepositPlaced', 'Killed', 'Submitted', 'Rejected', 'TimedOut'];
export const customOpenGovStatuses = ['All', 'CustomStatusSubmitted', 'CustomStatusVoting', 'CustomStatusClosed'];

export const getStatusesFromCustomStatus = (customStatus: CustomStatus) => {
	switch(customStatus) {
	case CustomStatus.Submitted:
		return ['DecisionDepositPlaced', 'Submitted'];
	case CustomStatus.Voting:
		return ['Deciding', 'ConfirmStarted', 'ConfirmAborted'];
	case CustomStatus.Closed:
		return ['Cancelled', 'TimedOut', 'Confirmed', 'Approved', 'Rejected', 'Executed'];
	}
};