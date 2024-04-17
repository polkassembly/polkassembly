// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IDelegatorsAndDelegatees } from '~src/types';

// of the Apache-2.0 license. See the LICENSE file for details.
export interface IDelegationAnalytics {
	totalCapital: string;
	totalVotesBalance: string;
	totalDelegates: number;
	totalDelegators: number;
	delegateesData: IDelegatorsAndDelegatees;
	delegatorsData: IDelegatorsAndDelegatees;
}

export interface IAnalyticsVoteTrends {
	convictionVotes: {
		delegationSplitData: { delegated: string | number; index: number; solo: string | number };
		supportData: { percentage: string; index: number };
		votesSplitData: { abstain: string | number; aye: string | number; nay: string | number; index: number };
	};
	voteAmount: {
		delegationSplitData: { delegated: string | number; index: number; solo: string | number };
		supportData: { percentage: string; index: number };
		votesSplitData: { abstain: string | number; aye: string | number; nay: string | number; index: number };
	};
	accounts: {
		delegationSplitData: { delegated: number | string; index: number; solo: number | string };
		supportData: { percentage: string; index: number };
		votesSplitData: { abstain: number | string; aye: number | string; nay: number | string; index: number };
	};
	referendaIndex: number;
}

export interface IVoteDetails {
	convictionVotes: IVoteDetailType;
	voteAmount: IVoteDetailType;
	accounts: IVoteDetailType;
	referendaIndex: number;
}
export interface IVoteDetailType {
	delegationSplitData: { delegated: string | number; index: number; solo: string | number };
	supportData: { percentage: string; index: number };
	votesSplitData: { abstain: string | number; aye: string | number; nay: string | number; index: number };
}
export interface IDelegateesModal {
	open: boolean;
	setOpen: (pre: boolean) => void;
	className?: string;
	delegateesData: IDelegatorsAndDelegatees;
	index: string;
}
export interface IDelegationStats {
	totalCapital: string;
	totalVotesBalance: string;
	totalDelegates: number;
	totalDelegators: number;
}

export interface IDelegationTabs {
	delegateesData: IDelegatorsAndDelegatees;
	delegatorsData: IDelegatorsAndDelegatees;
}

export interface IAnalyticsDelegationSplitGraph {
	delegationSplitData: { delegated: string | number; index: number; solo: string | number }[];
	isUsedInAccounts?: boolean;
	isSmallScreen?: boolean;
}

export interface IAnalyticsTurnoutPercentageGraph {
	supportData: { percentage: string; index: number }[];
	isSmallScreen?: boolean;
}

export enum ETrackLevelDelegationFilters {
	DELEGATORS = 'delegators',
	DELEGATEES = 'delegatees'
}

export interface IAnalyticsVoteSplitGraph {
	votesSplitData: { abstain: string | number; aye: string | number; nay: string | number; index: number }[];
	isUsedInAccounts?: boolean;
	isSmallScreen?: boolean;
}

export enum ETrackLevelAnalyticsFilterBy {
	CONVICTION_VOTES = 'convictionVotes',
	ACCOUNTS = 'accounts',
	VOTE_AMOUNT = 'voteAmount'
}
