// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { IAnalyticsVoteTrends, IDelegationAnalytics, ITrackAnalyticsStats, ITrackLevelAnalyticsStore } from './@types';

const initialState: ITrackLevelAnalyticsStore = {
	activeProposals: { diff: 0, total: 0 },
	allProposals: { diff: 0, total: 0 },
	delegateesData: {},
	delegatorsData: {},
	referendaIndex: null,
	totalCapital: '0',
	totalDelegates: 0,
	totalDelegators: 0,
	totalVotesBalance: '0',
	trackNumber: null,
	votes: {
		accounts: {
			delegationSplitData: { delegated: 0, index: null, solo: 0 },
			supportData: { index: null, percentage: '0' },
			votesSplitData: { abstain: 0, aye: 0, index: null, nay: 0 }
		},
		convictionVotes: {
			delegationSplitData: { delegated: '0', index: null, solo: '0' },
			supportData: { index: null, percentage: '0' },
			votesSplitData: { abstain: '0', aye: '0', index: null, nay: '0' }
		},
		referendaIndex: null,
		voteAmount: {
			delegationSplitData: { delegated: '0', index: null, solo: '0' },
			supportData: { index: null, percentage: '0' },
			votesSplitData: { abstain: '0', aye: '0', index: null, nay: '0' }
		}
	}
};

export const trackLevelAnalyticsStore = createSlice({
	extraReducers: (builder) => {
		builder.addCase(HYDRATE, (state, action) => {
			return {
				...state,
				...(action as PayloadAction<any>).payload.trackLevelAnalyticsStore
			};
		});
	},
	initialState,
	name: 'trackLevelAnalytics',
	reducers: {
		setTrackLevelAnalyticsStats: (state, action: PayloadAction<ITrackAnalyticsStats>) => {
			state.activeProposals = action.payload.activeProposals;
			state.allProposals = action.payload.allProposals;
		},
		setTrackLevelDelegationAnalyticsData: (state, action: PayloadAction<IDelegationAnalytics>) => {
			state.totalCapital = action.payload.totalCapital;
			state.totalVotesBalance = action.payload.totalVotesBalance;
			state.totalDelegates = action.payload.totalDelegates;
			state.totalDelegators = action.payload.totalDelegators;
			state.delegateesData = action.payload.delegateesData;
			state.delegatorsData = action.payload.delegatorsData;
		},
		setTrackLevelVotesAnalyticsStats: (state, action: PayloadAction<IAnalyticsVoteTrends>) => {
			state.votes = action.payload.votes;
			state.referendaIndex = action.payload.referendaIndex;
			state.trackNumber = action.payload.trackNumber;
		}
	}
});
const trackLevelAnalyticsActions = trackLevelAnalyticsStore.actions;

const setTrackLevelAnalyticsStats: any = (payload: ITrackAnalyticsStats) => {
	return (dispatch: any) => {
		dispatch(trackLevelAnalyticsActions.setTrackLevelAnalyticsStats(payload));
	};
};

const setTrackLevelDelegationAnalyticsData: any = (payload: IDelegationAnalytics) => {
	return (dispatch: any) => {
		dispatch(trackLevelAnalyticsActions.setTrackLevelDelegationAnalyticsData(payload));
	};
};

const setTrackLevelVotesAnalyticsStats: any = (payload: IAnalyticsVoteTrends) => {
	return (dispatch: any) => {
		dispatch(trackLevelAnalyticsActions.setTrackLevelVotesAnalyticsStats(payload));
	};
};

export default trackLevelAnalyticsStore.reducer;
export { setTrackLevelAnalyticsStats, trackLevelAnalyticsActions, setTrackLevelDelegationAnalyticsData, setTrackLevelVotesAnalyticsStats };
