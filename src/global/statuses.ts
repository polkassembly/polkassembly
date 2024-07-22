// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// Note that clear is a status made up for Polkassembly
// for proposal that got cleared from the queue after a
// clearPublicProposal such as https://polkascan.io/kusama/democracy/referendum/57
export const proposalStatus = {
	CLEARED: 'Cleared',
	PROPOSED: 'Proposed',
	TABLED: 'Tabled'
};

export const proposalStatusOptions = [
	{
		key: proposalStatus.CLEARED,
		label: 'Cleared'
	},
	{
		key: proposalStatus.PROPOSED,
		label: 'Proposed'
	},
	{
		key: proposalStatus.TABLED,
		label: 'Tabled'
	}
];

export const referendumStatus = {
	CANCELLED: 'Cancelled',
	EXECUTED: 'Executed',
	EXPIRED: 'Expired',
	NOTPASSED: 'NotPassed',
	PASSED: 'Passed',
	SCHEDULED: 'Scheduled',
	STARTED: 'Started',
	VOTED: 'Voted'
};

export const referendumStatusOptions = [
	{
		key: referendumStatus.CANCELLED,
		label: 'Cancelled'
	},
	{
		key: referendumStatus.EXECUTED,
		label: 'Executed'
	},
	{
		key: referendumStatus.EXPIRED,
		label: 'Expired'
	},
	{
		key: referendumStatus.NOTPASSED,
		label: 'Not Passed'
	},
	{
		key: referendumStatus.PASSED,
		label: 'Passed'
	},
	{
		key: referendumStatus.SCHEDULED,
		label: 'Scheduled'
	},
	{
		key: referendumStatus.STARTED,
		label: 'Started'
	},
	{
		key: referendumStatus.VOTED,
		label: 'Voted'
	}
];

export const gov2ReferendumStatus = {
	CANCELLED: 'Cancelled',
	CONFIRMED: 'Confirmed',
	CONFIRM_ABORTED: 'ConfirmAborted',
	CONFIRM_STARTED: 'ConfirmStarted',
	CREATED: 'Created',
	DECIDING: 'Deciding',
	DECISION_DEPOSIT_PLACED: 'DecisionDepositPlaced',
	EXECUTED: 'Executed',
	EXECUTION_FAILED: 'ExecutionFailed',
	KILLED: 'Killed',
	REJECTED: 'Rejected',
	SUBMITTED: 'Submitted',
	TIMEDOUT: 'TimedOut'
};

export const gov2ReferendumStatusOptions = [
	{
		key: gov2ReferendumStatus.CANCELLED,
		label: 'Cancelled'
	},
	{
		key: gov2ReferendumStatus.CONFIRMED,
		label: 'Confirmed'
	},
	{
		key: gov2ReferendumStatus.CONFIRM_ABORTED,
		label: 'Confirm Aborted'
	},
	{
		key: gov2ReferendumStatus.CONFIRM_STARTED,
		label: 'Confirm Started'
	},
	{
		key: gov2ReferendumStatus.DECIDING,
		label: 'Deciding'
	},
	{
		key: gov2ReferendumStatus.EXECUTED,
		label: 'Executed'
	},
	{
		key: gov2ReferendumStatus.EXECUTION_FAILED,
		label: 'Execution Failed'
	},
	{
		key: gov2ReferendumStatus.KILLED,
		label: 'Killed'
	},
	{
		key: gov2ReferendumStatus.REJECTED,
		label: 'Rejected'
	},
	{
		key: gov2ReferendumStatus.SUBMITTED,
		label: 'Submitted'
	},
	{
		key: gov2ReferendumStatus.TIMEDOUT,
		label: 'Timed Out'
	}
];

export const gov2ReferendumStatusVotingOptions = [
	{
		key: gov2ReferendumStatus.CONFIRM_ABORTED,
		label: 'Confirm Aborted'
	},
	{
		key: gov2ReferendumStatus.CONFIRM_STARTED,
		label: 'Confirm Started'
	},
	{
		key: gov2ReferendumStatus.DECIDING,
		label: 'Deciding'
	}
];

export const gov2ReferendumStatusClosedOptions = [
	{
		key: gov2ReferendumStatus.CANCELLED,
		label: 'Cancelled'
	},
	{
		key: gov2ReferendumStatus.CONFIRMED,
		label: 'Confirmed'
	},
	{
		key: gov2ReferendumStatus.EXECUTED,
		label: 'Executed'
	},
	{
		key: gov2ReferendumStatus.EXECUTION_FAILED,
		label: 'Execution Failed'
	},
	{
		key: gov2ReferendumStatus.KILLED,
		label: 'Killed'
	},
	{
		key: gov2ReferendumStatus.REJECTED,
		label: 'Rejected'
	},
	{
		key: gov2ReferendumStatus.TIMEDOUT,
		label: 'Timed Out'
	}
];

export const gov2ReferendumStatusSubmittedOptions = [
	{
		key: gov2ReferendumStatus.SUBMITTED,
		label: 'Submitted'
	}
];

export const motionStatus = {
	APPROVED: 'Approved',
	CLOSED: 'Closed',
	DISAPPROVED: 'Disapproved',
	EXECUTED: 'Executed',
	PROPOSED: 'Proposed',
	VOTED: 'Voted'
};

export const motionStatusOptions = [
	{
		key: motionStatus.APPROVED,
		label: 'Approved'
	},
	{
		key: motionStatus.CLOSED,
		label: 'Closed'
	},
	{
		key: motionStatus.DISAPPROVED,
		label: 'Disapproved'
	},
	{
		key: motionStatus.EXECUTED,
		label: 'Executed'
	},
	{
		key: motionStatus.PROPOSED,
		label: 'Proposed'
	},
	{
		key: motionStatus.VOTED,
		label: 'Voted'
	}
];

export const tipStatus = {
	CLOSED: 'Closed',
	CLOSING: 'Closing',
	OPENED: 'Opened',
	RETRACTED: 'Retracted'
};

export const tipStatusOptions = [
	{
		key: tipStatus.CLOSING,
		label: 'Closing'
	},
	{
		key: tipStatus.CLOSED,
		label: 'Closed'
	},
	{
		key: tipStatus.OPENED,
		label: 'Opened'
	},
	{
		key: tipStatus.RETRACTED,
		label: 'Retracted'
	}
];

export const tipStatusMap = {
	[tipStatus.OPENED]: 'Opened',
	[tipStatus.CLOSING]: 'Closing',
	[tipStatus.CLOSED]: 'Rewarded',
	[tipStatus.RETRACTED]: 'Retracted'
};

export const bountyStatus = {
	ACTIVE: 'Active',
	AWARDED: 'Awarded',
	CANCELLED: 'Cancelled',
	CLAIMED: 'Claimed',
	EXTENDED: 'Extended',
	PROPOSED: 'Proposed',
	REJECTED: 'Rejected'
};

export const bountyStatusOptions = [
	{
		key: bountyStatus.ACTIVE,
		label: 'Active'
	},
	{
		key: bountyStatus.AWARDED,
		label: 'Awarded'
	},
	{
		key: bountyStatus.CANCELLED,
		label: 'Cancelled'
	},
	{
		key: bountyStatus.CLAIMED,
		label: 'Claimed'
	},
	{
		key: bountyStatus.EXTENDED,
		label: 'Extended'
	},
	{
		key: bountyStatus.PROPOSED,
		label: 'Proposed'
	},
	{
		key: bountyStatus.REJECTED,
		label: 'Rejected'
	}
];

export const bountyStatusMap = {
	[bountyStatus.AWARDED]: 'Awarded',
	[bountyStatus.ACTIVE]: 'Active',
	[bountyStatus.CANCELLED]: 'Cancelled',
	[bountyStatus.CLAIMED]: 'Claimed',
	[bountyStatus.EXTENDED]: 'Extended',
	[bountyStatus.PROPOSED]: 'Proposed',
	[bountyStatus.REJECTED]: 'Rejected'
};

export const childBountyStatus = {
	ADDED: 'Added',
	AWARDED: 'Awarded',
	CANCELLED: 'Cancelled',
	CLAIMED: 'Claimed'
};

export const childBountyStatusOptions = [
	{
		key: childBountyStatus.ADDED,
		label: 'Added'
	},
	{
		key: childBountyStatus.AWARDED,
		label: 'Awarded'
	},
	{
		key: childBountyStatus.CANCELLED,
		label: 'Cancelled'
	},
	{
		key: childBountyStatus.CLAIMED,
		label: 'Claimed'
	}
];

export const childBountyStatusMap = {
	[childBountyStatus.ADDED]: 'Added',
	[childBountyStatus.AWARDED]: 'Awarded',
	[childBountyStatus.CANCELLED]: 'Cancelled',
	[childBountyStatus.CLAIMED]: 'Claimed'
};

export const approvalStatus = {
	APPROVED: 'approved',
	PENDING: 'pending',
	REJECTED: 'rejected'
};

export const approvalStatusOptions = [
	{
		key: approvalStatus.APPROVED,
		label: 'Approved'
	},
	{
		key: approvalStatus.PENDING,
		label: 'Pending'
	},
	{
		key: approvalStatus.REJECTED,
		label: 'Rejected'
	}
];

export const treasuryProposalStatus = {
	APPROVED: 'approved',
	AWARDED: 'Awarded',
	PROPOSED: 'Proposed',
	REJECTED: 'Rejected'
};

export const treasuryProposalStatusOptions = [
	{
		key: treasuryProposalStatus.APPROVED,
		label: 'Approved'
	},
	{
		key: treasuryProposalStatus.AWARDED,
		label: 'Awarded'
	},
	{
		key: treasuryProposalStatus.PROPOSED,
		label: 'Proposed'
	},
	{
		key: treasuryProposalStatus.REJECTED,
		label: 'Rejected'
	}
];

export const announcementStatus = {
	Announced: 'Announced'
};

export const announcementStatusOptions = [
	{
		key: announcementStatus.Announced,
		label: 'Announced'
	}
];

export const techCommiteeStatus = {
	APPROVED: 'Approved',
	CLOSED: 'Closed',
	DISAPPROVED: 'Disapproved',
	EXECUTED: 'Executed',
	PROPOSED: 'Proposed'
};

export const techCommiteeStatusOptions = [
	{
		key: techCommiteeStatus.APPROVED,
		label: 'Approved'
	},
	{
		key: techCommiteeStatus.CLOSED,
		label: 'Closed'
	},
	{
		key: techCommiteeStatus.DISAPPROVED,
		label: 'Disapproved'
	},
	{
		key: techCommiteeStatus.EXECUTED,
		label: 'Executed'
	},
	{
		key: techCommiteeStatus.PROPOSED,
		label: 'Proposed'
	}
];

export const announcementStatusMap = {
	[announcementStatus.Announced]: 'Announced'
};
