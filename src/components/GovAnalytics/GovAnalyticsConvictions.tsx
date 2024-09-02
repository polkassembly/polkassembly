// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import dynamic from 'next/dynamic';
import { useTrackLevelAnalytics } from '~src/redux/selectors';
import getAnalyticsVotesByFilter from '../TrackLevelAnalytics/utils/getAnalyticsVotesByFilter';
import { ETrackLevelAnalyticsFilterBy } from '../TrackLevelAnalytics/types';
const AnalyticsDelegationSplitGraph = dynamic(() => import('../TrackLevelAnalytics/AnalyticsVotingTrends/TrackAnalyticsgraphs/AnalyticsDelegationSplitGraph'), { ssr: false });
const AnalyticsVoteSplitGraph = dynamic(() => import('../TrackLevelAnalytics/AnalyticsVotingTrends/TrackAnalyticsgraphs/AnalyticsVoteSplitGraph'), { ssr: false });

const GovAnalyticsConvictions = ({ isSmallScreen }: { isSmallScreen: boolean }) => {
	const { votes } = useTrackLevelAnalytics();

	const convictionVotesData = getAnalyticsVotesByFilter(votes, ETrackLevelAnalyticsFilterBy.CONVICTION_VOTES);

	const sortedConvictionVotesData = convictionVotesData.sort((a, b) => a.delegationSplitData.index - b.delegationSplitData.index);
	const delegationSplit = sortedConvictionVotesData.map((item) => item.delegationSplitData);
	const votesSplit = sortedConvictionVotesData.map((item) => item.votesSplitData);

	return (
		<>
			<AnalyticsDelegationSplitGraph
				isSmallScreen={isSmallScreen}
				delegationSplitData={delegationSplit}
			/>
			<AnalyticsVoteSplitGraph
				isSmallScreen={isSmallScreen}
				votesSplitData={votesSplit}
			/>
		</>
	);
};

export default GovAnalyticsConvictions;
