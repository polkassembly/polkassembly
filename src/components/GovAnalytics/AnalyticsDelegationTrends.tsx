// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import { Collapse } from '~src/components/Settings/Notifications/common-ui/Collapse';
import { useTheme } from 'next-themes';
import ImageIcon from '~src/ui-components/ImageIcon';
import NoVotesIcon from '~assets/icons/analytics/no-votes.svg';
import DelegationDetails from './DelegationDetails';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { MessageType } from '~src/auth/types';
import { Spin } from 'antd';
import { getTrackNameFromId } from '~src/util/trackNameFromId';
import { useNetworkSelector } from '~src/redux/selectors';
import DelegationCapitalDetails from './DelegationCapitalDetails';

const { Panel } = Collapse;

const AnalyticsDelegationTrends = () => {
	const { resolvedTheme: theme } = useTheme();
	const [loading, setLoading] = useState<boolean>(false);
	const [delegationInfo, setDelegationInfo] = useState();
	const { network } = useNetworkSelector();

	const getData = async () => {
		setLoading(true);
		try {
			const { data } = await nextApiClientFetch<any | MessageType>('/api/v1/govAnalytics/trackDelegationAnalytics');
			if (data) {
				Object.keys(data).forEach((key) => {
					delete data[key].delegateesData;
					delete data[key].delegatorsData;
				});
				const updatedTrackInfo: any = {};
				Object.entries(data).forEach(([key, value]) => {
					const trackName = getTrackNameFromId(network, parseInt(key)).split('_').join(' ');
					updatedTrackInfo[trackName] = value as number;
				});
				setDelegationInfo(updatedTrackInfo);
				setLoading(false);
			}
		} catch (error) {
			console.log(error);
			setLoading(false);
		}
	};

	useEffect(() => {
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [noData, setNoData] = useState<boolean>(false);

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
							<span className='py-[3.8px] text-base font-semibold text-blue-light-high dark:text-blue-dark-high'>Voting</span>
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
						<Spin spinning={loading}>
							<div className='flex flex-col gap-y-4'>
								<DelegationCapitalDetails delegationData={delegationInfo} />
								<DelegationDetails delegationData={delegationInfo} />
							</div>
						</Spin>
					</>
				)}
			</Panel>
		</Collapse>
	);
};

export default AnalyticsDelegationTrends;
