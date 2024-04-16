// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export interface ITrackAnalyticsStats {
	activeProposals: { diff: number; total: number };
	allProposals: { diff: number; total: number };
}

export interface IDelegatorsAndDelegatees {
	[key: string]: {
		count: number;
		data: {
			to: string;
			from: string;
			capital: string;
			lockedPeriod: number;
			votingPower: string;
		}[];
	};
}

export interface IDelegationAnalytics {
	totalCapital: string;
	totalVotesBalance: string;
	totalDelegates: number;
	totalDelegators: number;
	delegateesData: IDelegatorsAndDelegatees;
	delegatorsData: IDelegatorsAndDelegatees;
}

export interface IAnalyticsVoteTrends {
	trackNumber: number | null;
	referendaIndex: number | null;
	votes: {
		convictionVotes: {
			delegationSplitData: { delegated: string | number; index: number | null; solo: string | number };
			supportData: { percentage: string; index: number | null };
			votesSplitData: { abstain: string | number; aye: string | number; nay: string | number; index: number | null };
		};
		voteAmount: {
			delegationSplitData: { delegated: string | number; index: number | null; solo: string | number };
			supportData: { percentage: string; index: number | null };
			votesSplitData: { abstain: string | number; aye: string | number; nay: string | number; index: number | null };
		};
		accounts: {
			delegationSplitData: { delegated: number | string; index: number | null; solo: number | string };
			supportData: { percentage: string; index: number | null };
			votesSplitData: { abstain: number | string; aye: number | string; nay: number | string; index: number | null };
		};
		referendaIndex: number | null;
	};
}

export interface ITrackLevelAnalyticsStore extends IDelegationAnalytics, IAnalyticsVoteTrends {
	activeProposals: { diff: number; total: number };
	allProposals: { diff: number; total: number };
}
