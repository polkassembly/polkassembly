// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import { Collapse } from '~src/components/Settings/Notifications/common-ui/Collapse';
import { useTheme } from 'next-themes';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import ImageIcon from '~src/ui-components/ImageIcon';
import { useDispatch } from 'react-redux';
import { setTrackLevelVotesAnalyticsData } from '~src/redux/trackLevelAnalytics';
import NoVotesIcon from '~assets/icons/analytics/no-votes.svg';
import dynamic from 'next/dynamic';
import { ETrackLevelAnalyticsFilterBy, IAnalyticsVoteTrends } from '../TrackLevelAnalytics/types';
import AnalyticsReferendumOutcome from './AnalyticsReferendumOutcome';
import AnalyticsReferendumCount from './AnalyticsReferendumCount';
import getAnalyticsVotesByFilter from '../TrackLevelAnalytics/utils/getAnalyticsVotesByFilter';
import { useTrackLevelAnalytics } from '~src/redux/selectors';
const AnalyticsTurnoutPercentageGraph = dynamic(() => import('../TrackLevelAnalytics/AnalyticsVotingTrends/TrackAnalyticsgraphs/AnalyticsTurnoutPercentageGraph'), { ssr: false });

const { Panel } = Collapse;

const AnalyticsTrends = ({ trackId }: { trackId?: number; isUsedInAnalytics?: boolean }) => {
	const { resolvedTheme: theme } = useTheme();
	const { votes } = useTrackLevelAnalytics();

	const dispatch = useDispatch();
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [noData, setNoData] = useState<boolean>(false);
	const isSmallScreen = window.innerWidth < 640;
	const convictionVotesData = getAnalyticsVotesByFilter(votes, ETrackLevelAnalyticsFilterBy.CONVICTION_VOTES);
	const supportGraph = convictionVotesData.sort((a, b) => a?.supportData?.index - b?.supportData?.index).map((item) => item.supportData);

	const getVoteData = async () => {
		setIsLoading(true);
		const url = trackId === undefined ? '/api/v1/trackLevelAnalytics/all-track-votes-analytics' : '/api/v1/trackLevelAnalytics/votes-analytics';
		const payload = trackId === undefined ? {} : { trackId: trackId };
		try {
			const { data } = await nextApiClientFetch<{ votes: IAnalyticsVoteTrends[] }>(url, payload);
			if (data && data?.votes) {
				dispatch(setTrackLevelVotesAnalyticsData(data?.votes));
				setIsLoading(false);
			}
			if (data && data?.votes.length === 0) {
				setNoData(true);
				setIsLoading(false);
			}
		} catch (error) {
			console.error(error);
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (trackId && isNaN(trackId)) return;
		getVoteData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trackId]);

	return (
		<Collapse
			size='large'
			theme={theme as any}
			className='bg-white dark:border-separatorDark dark:bg-section-dark-overlay'
			expandIconPosition='end'
			expandIcon={({ isActive }) => (isActive ? <ExpandIcon /> : <CollapseIcon />)}
		>
			<Panel
				header={
					<div className='flex w-full items-center space-x-4'>
						<div className='flex items-center gap-2'>
							<ImageIcon
								src='/assets/icons/voting-trends.svg'
								alt='Voting Trends icon'
							/>
							<span className='py-[3.8px] text-base font-semibold text-blue-light-high dark:text-blue-dark-high'>Overview</span>
						</div>
					</div>
				}
				key='1'
			>
				{noData ? (
					<div className='flex flex-col items-center justify-center gap-5 p-10'>
						<NoVotesIcon />
						<p className='text-sm'>Not enough data available</p>
					</div>
				) : (
					<>
						<div className='mb-4 flex flex-col gap-4 md:grid md:grid-cols-2'>
							<AnalyticsReferendumOutcome />
							<AnalyticsReferendumCount />
						</div>
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
					</>
				)}
			</Panel>
		</Collapse>
	);
};

export default AnalyticsTrends;
