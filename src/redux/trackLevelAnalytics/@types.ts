// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IAnalyticsVoteTrends } from '~src/components/TrackLevelAnalytics/types';

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

export interface ITrackLevelAnalyticsStore extends IDelegationAnalytics {
	activeProposals: { diff: number; total: number };
	allProposals: { diff: number; total: number };
	votes: IAnalyticsVoteTrends[];
}
