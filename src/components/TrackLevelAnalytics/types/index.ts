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
	network: string;
	trackNumber: number;
	referendaIndex: number;
	votes: IVoteDetails;
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
