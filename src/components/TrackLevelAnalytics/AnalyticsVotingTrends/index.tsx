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
import { StatTabs } from '~src/components/Post/Tabs/PostStats/Tabs/StatTabs';
import AnalyticsConvictionVotes from './AnalyticsConvictionVotes';
import AnalyticsVoteAmountVotes from './AnalyticsVoteAmountVotes';
import AnalyticsAccountsVotes from './AnalyticsAccountsVotes';
import Skeleton from '~src/basic-components/Skeleton';
import SkeletonButton from '~src/basic-components/Skeleton/SkeletonButton';
import { ETrackLevelAnalyticsFilterBy, IAnalyticsVoteTrends } from '../types';
import { useDispatch } from 'react-redux';
import { setTrackLevelVotesAnalyticsData } from '~src/redux/trackLevelAnalytics';
import NoVotesIcon from '~assets/icons/analytics/no-votes.svg';
import GovAnalyticsConvictions from '~src/components/GovAnalytics/GovAnalyticsConvictions';

const { Panel } = Collapse;

interface ITabItem {
	key: string;
	label: string;
	children: React.ReactNode;
}

const AnalyticsVotingTrends = ({ trackId, isUsedInAnalytics }: { trackId?: number; isUsedInAnalytics?: boolean }) => {
	const { resolvedTheme: theme } = useTheme();
	const dispatch = useDispatch();
	const [activeTab, setActiveTab] = useState<string>(ETrackLevelAnalyticsFilterBy.CONVICTION_VOTES);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [activeKey, setActiveKey] = useState<string | number | undefined>(undefined);
	const [noData, setNoData] = useState<boolean>(false);
	const isSmallScreen = window.innerWidth < 640;

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

	const tabItems: ITabItem[] = [
		{
			children: <>{!isUsedInAnalytics ? <AnalyticsConvictionVotes isSmallScreen={isSmallScreen} /> : <GovAnalyticsConvictions isSmallScreen={isSmallScreen} />}</>,
			key: ETrackLevelAnalyticsFilterBy.CONVICTION_VOTES,
			label: 'Conviction Votes'
		},
		{
			children: <AnalyticsVoteAmountVotes isSmallScreen={isSmallScreen} />,
			key: ETrackLevelAnalyticsFilterBy.VOTE_AMOUNT,
			label: 'Vote Amount'
		},
		{
			children: <AnalyticsAccountsVotes isSmallScreen={isSmallScreen} />,
			key: ETrackLevelAnalyticsFilterBy.ACCOUNTS,
			label: 'Accounts'
		}
	];

	return (
		<Collapse
			size='large'
			theme={theme as any}
			className='border-section-light-container bg-white dark:border-separatorDark dark:bg-section-dark-overlay'
			expandIconPosition='end'
			expandIcon={({ isActive }: { isActive?: boolean }) => (isActive ? <ExpandIcon /> : <CollapseIcon />)}
			activeKey={activeKey}
			defaultActiveKey='1'
			onChange={(key: string | string[]) => {
				if (typeof key === 'string' || typeof key === 'number') {
					setActiveKey(key);
				} else if (Array.isArray(key) && key.length > 0) {
					setActiveKey(key[0]);
				} else {
					setActiveKey(undefined);
				}
			}}
		>
			<Panel
				header={
					<div className='flex w-full items-center space-x-4'>
						<div className='flex items-center gap-2'>
							<ImageIcon
								src='/assets/icons/voting-trends.svg'
								alt='Voting Trends icon'
							/>
							<span className='py-[3.8px] text-base font-semibold text-blue-light-high dark:text-blue-dark-high'>Voting Trends</span>
						</div>
						{activeKey === '1' && !noData && (
							<div
								className='hidden sm:flex'
								onClick={(e) => e.stopPropagation()}
							>
								{isLoading ? (
									<SkeletonButton />
								) : (
									<StatTabs
										items={tabItems}
										setActiveTab={setActiveTab}
										activeTab={activeTab}
										isUsedInAnalytics={true}
									/>
								)}
							</div>
						)}
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
						<div
							className='mb-4 sm:hidden'
							onClick={(e) => e.stopPropagation()}
						>
							{isLoading ? (
								<Skeleton />
							) : (
								<StatTabs
									items={tabItems}
									setActiveTab={setActiveTab}
									activeTab={activeTab}
									isUsedInAnalytics={true}
								/>
							)}
						</div>
						{tabItems.find((item) => item.key === activeTab)?.children}
					</>
				)}
			</Panel>
		</Collapse>
	);
};

export default AnalyticsVotingTrends;
