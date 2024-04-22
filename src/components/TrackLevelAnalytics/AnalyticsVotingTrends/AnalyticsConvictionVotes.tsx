// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import Nudge from '~src/components/Post/Tabs/PostStats/Tabs/Nudge';
import dynamic from 'next/dynamic';
import { useTrackLevelAnalytics } from '~src/redux/selectors';
import getAnalyticsVotesByFilter from '../utils/getAnalyticsVotesByFilter';
import { ETrackLevelAnalyticsFilterBy } from '../types';

const AnalyticsDelegationSplitGraph = dynamic(() => import('./TrackAnalyticsgraphs/AnalyticsDelegationSplitGraph'), { ssr: false });
const AnalyticsVoteSplitGraph = dynamic(() => import('./TrackAnalyticsgraphs/AnalyticsVoteSplitGraph'), { ssr: false });
const AnalyticsTurnoutPercentageGraph = dynamic(() => import('./TrackAnalyticsgraphs/AnalyticsTurnoutPercentageGraph'), { ssr: false });

const AnalyticsConvictionVotes = ({ isSmallScreen }: { isSmallScreen: boolean }) => {
	const { votes } = useTrackLevelAnalytics();

	const convictionVotesData = getAnalyticsVotesByFilter(votes, ETrackLevelAnalyticsFilterBy.CONVICTION_VOTES);

	const supportGraph = convictionVotesData.sort((a, b) => a?.supportData?.index - b?.supportData?.index).map((item) => item.supportData);
	const delegationSplit = convictionVotesData.sort((a, b) => a.delegationSplitData.index - b.delegationSplitData.index).map((item) => item.delegationSplitData);
	const votesSplit = convictionVotesData.sort((a, b) => a.votesSplitData.index - b.votesSplitData.index).map((item) => item.votesSplitData);

	return (
		<>
			<Nudge text='Conviction vote is the number of tokens used for voting multiplied by conviction.' />
			<div className='mb-4 flex flex-col gap-4 md:grid md:grid-cols-2'>
				<AnalyticsTurnoutPercentageGraph
					isSmallScreen={isSmallScreen}
					supportData={supportGraph}
				/>
				<AnalyticsDelegationSplitGraph
					isSmallScreen={isSmallScreen}
					delegationSplitData={delegationSplit}
				/>
			</div>
			<AnalyticsVoteSplitGraph
				isSmallScreen={isSmallScreen}
				votesSplitData={votesSplit}
			/>
		</>
	);
};

export default AnalyticsConvictionVotes;
