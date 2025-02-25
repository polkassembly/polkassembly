// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import { Collapse } from '~src/components/Settings/Notifications/common-ui/Collapse';
import { useTheme } from 'next-themes';
import ImageIcon from '~src/ui-components/ImageIcon';
import DelegationStats from './DelegationStats';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { Divider, Spin } from 'antd';
import DelegationTabs from './DelegationTabs';
import { useDispatch } from 'react-redux';
import { setTrackLevelDelegationAnalyticsData } from '~src/redux/trackLevelAnalytics';
import { IDelegationAnalytics } from '~src/redux/trackLevelAnalytics/@types';
import NoVotesIcon from '~assets/icons/analytics/no-votes.svg';

const { Panel } = Collapse;

const AnalyticsDelegation = ({ trackId }: { className?: string; trackId?: number }) => {
	const { resolvedTheme: theme } = useTheme();
	const dispatch = useDispatch();
	const [noData, setNoData] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

	const getData = async () => {
		setLoading(true);
		const url = trackId === undefined ? '/api/v1/trackLevelAnalytics/all-track-delegation-analytics' : '/api/v1/trackLevelAnalytics/track-delegation-analytics-stats';
		const payload = trackId === undefined ? {} : { trackId: trackId };
		try {
			const { data } = await nextApiClientFetch<IDelegationAnalytics>(url, payload);

			if (data) {
				if (!data?.totalDelegates && !data?.totalDelegators) {
					setNoData(true);
					setLoading(false);
				}
				dispatch(setTrackLevelDelegationAnalyticsData(data));
				setNoData(false);
				setLoading(false);
			}
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		if (trackId && isNaN(trackId)) return;
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trackId]);

	return (
		<Collapse
			size='large'
			theme={theme as any}
			className='border-section-light-container bg-white dark:border-separatorDark dark:bg-section-dark-overlay'
			expandIconPosition='end'
			expandIcon={({ isActive }) => {
				return isActive ? <ExpandIcon /> : <CollapseIcon />;
			}}
		>
			<Panel
				header={
					<div className='flex items-center gap-2'>
						<ImageIcon
							src='/assets/icons/delegate-green-icon.svg'
							alt='Delegate icon'
						/>
						<span className='py-[3.8px] text-base font-semibold text-blue-light-high dark:text-blue-dark-high'>Delegation</span>
					</div>
				}
				key='2'
			>
				<Spin spinning={loading}>
					<DelegationStats />
					{noData ? (
						<div className='flex flex-col items-center justify-center gap-5 p-10'>
							<NoVotesIcon />
							<p className='text-sm'>Not enough data available</p>
						</div>
					) : (
						<>
							<Divider
								dashed
								className='mb-3 mt-5 border-section-light-container dark:border-separatorDark'
							/>
							<DelegationTabs />
						</>
					)}
				</Spin>
			</Panel>
		</Collapse>
	);
};

export default AnalyticsDelegation;
