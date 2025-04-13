// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
export enum EProposalTypeV2 {
	ALLIANCE_MOTION = 'AllianceMotion',
	ANNOUNCEMENT = 'Announcement',
	DEMOCRACY_PROPOSAL = 'DemocracyProposal',
	TECH_COMMITTEE_PROPOSAL = 'TechCommitteeProposal',
	TREASURY_PROPOSAL = 'TreasuryProposal',
	REFERENDUM = 'Referendum',
	FELLOWSHIP_REFERENDUM = 'FellowshipReferendum',
	COUNCIL_MOTION = 'CouncilMotion',
	BOUNTY = 'Bounty',
	TIP = 'Tip',
	CHILD_BOUNTY = 'ChildBounty',
	REFERENDUM_V2 = 'ReferendumV2',
	TECHNICAL_COMMITTEE = 'TechnicalCommittee',
	COMMUNITY = 'Community',
	UPGRADE_COMMITTEE = 'UpgradeCommittee',
	ADVISORY_COMMITTEE = 'AdvisoryCommittee',
	DISCUSSION = 'Discussion',
	GRANT = 'Grant'
}

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
	ANNOUNCEMENT = 'announcement',
	ALLIANCE_MOTION = 'alliance_motion',
	TECHNICAL_PIPS = 'technical_pips',
	UPGRADE_PIPS = 'upgrade_pips',
	COMMUNITY_PIPS = 'community_pips',
	ADVISORY_COMMITTEE = 'advisory_committee',
	USER_CREATED_BOUNTIES = 'user_created_bounties'
}

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
	| 'FellowshipReferendum'
	| 'TechnicalCommittee'
	| 'Community'
	| 'UpgradeCommittee'
	| 'AdvisoryCommittee';

export function getSubsquidProposalType(
	proposalType: Exclude<ProposalType, ProposalType.DISCUSSIONS | ProposalType.GRANTS | ProposalType.USER_CREATED_BOUNTIES>
): TSubsquidProposalType {
	switch (proposalType) {
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
		case ProposalType.TECHNICAL_PIPS:
			return 'TechnicalCommittee';
		case ProposalType.COMMUNITY_PIPS:
			return 'Community';
		case ProposalType.UPGRADE_PIPS:
			return 'UpgradeCommittee';
		case ProposalType.ADVISORY_COMMITTEE:
			return 'AdvisoryCommittee';
	}
}

export const convertProposalTypeToV2 = (proposalType: ProposalType) => {
	if (proposalType === ProposalType.DISCUSSIONS) {
		return 'Discussion';
	} else if (proposalType === ProposalType.GRANTS) {
		return 'Grants';
	} else if (proposalType === ProposalType.USER_CREATED_BOUNTIES) {
		return 'UserCreatedBounties';
	}
	const postType = getSubsquidProposalType(proposalType);
	return postType || '';
};
