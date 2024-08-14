// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import AnalyticsVotingTrends from '../TrackLevelAnalytics/AnalyticsVotingTrends';
import dynamic from 'next/dynamic';
import getAnalyticsVotesByFilter from '../TrackLevelAnalytics/utils/getAnalyticsVotesByFilter';
import { useTrackLevelAnalytics } from '~src/redux/selectors';
import { ETrackLevelAnalyticsFilterBy } from '../TrackLevelAnalytics/types';
import AnalyticsReferendumOutcome from './AnalyticsReferendumOutcome';
import AnalyticsReferendumCount from './AnalyticsReferendumCount';
import AnalyticsStats from './AnalyticsStats';
const AnalyticsTurnoutPercentageGraph = dynamic(() => import('../TrackLevelAnalytics/AnalyticsVotingTrends/TrackAnalyticsgraphs/AnalyticsTurnoutPercentageGraph'), { ssr: false });

const GovAnalytics = () => {
	const { votes } = useTrackLevelAnalytics();
	const isSmallScreen = window.innerWidth < 640;
	const convictionVotesData = getAnalyticsVotesByFilter(votes, ETrackLevelAnalyticsFilterBy.CONVICTION_VOTES);
	const supportGraph = convictionVotesData.sort((a, b) => a?.supportData?.index - b?.supportData?.index).map((item) => item.supportData);

	return (
		<section className='flex h-full w-full items-center rounded-xl border-none bg-white px-6 py-4 dark:bg-black'>
			<div className='flex w-full flex-col gap-y-4'>
				<AnalyticsStats />
				<div className='mb-4 flex flex-col gap-4 md:grid md:grid-cols-2'>
					<AnalyticsTurnoutPercentageGraph
						isSmallScreen={isSmallScreen}
						supportData={supportGraph}
					/>
					<AnalyticsTurnoutPercentageGraph
						isSmallScreen={isSmallScreen}
						supportData={supportGraph}
					/>
				</div>

				<div className='mb-4 flex flex-col gap-4 md:grid md:grid-cols-2'>
					<AnalyticsReferendumOutcome />
					<AnalyticsReferendumCount />
				</div>
				<AnalyticsVotingTrends isUsedInAnalytics={true} />
			</div>
		</section>
	);
};

export default GovAnalytics;
