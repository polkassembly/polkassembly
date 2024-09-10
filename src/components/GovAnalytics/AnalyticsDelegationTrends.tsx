// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
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
import { IDelegationInfo } from './types';
import Image from 'next/image';

const { Panel } = Collapse;

const AnalyticsDelegationTrends = () => {
	const { resolvedTheme: theme } = useTheme();
	const [loading, setLoading] = useState<boolean>(false);
	const [delegationInfo, setDelegationInfo] = useState<IDelegationInfo | null>(null);
	const { network } = useNetworkSelector();

	const getData = async () => {
		setLoading(true);
		try {
			const response = await nextApiClientFetch<IDelegationInfo | MessageType>('/api/v1/govAnalytics/trackDelegationAnalytics');
			const data = response.data;

			// Check if the data is of type IDelegationInfo and process it
			if (data && !('message' in data)) {
				const updatedTrackInfo: IDelegationInfo = {};

				Object.entries(data).forEach(([key, value]) => {
					const { totalCapital, totalDelegates, totalDelegators, totalVotesBalance } = value;
					const trackName = getTrackNameFromId(network, parseInt(key)).split('_').join(' ');

					updatedTrackInfo[trackName] = {
						totalCapital,
						totalDelegates,
						totalDelegators,
						totalVotesBalance
					};
				});
				setDelegationInfo(updatedTrackInfo);
			}

			setLoading(false);
		} catch (error) {
			console.log(error);
			setLoading(false);
		}
	};

	useEffect(() => {
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Collapse
			size='large'
			theme={theme as any}
			className='bg-white dark:border-separatorDark dark:bg-section-dark-overlay'
			expandIconPosition='end'
			expandIcon={({ isActive }) =>
				isActive ? (
					<Image
						src={'/assets/icons/expand.svg'}
						height={20}
						width={20}
						alt=''
						className={theme == 'dark' ? 'dark-icons' : ''}
					/>
				) : (
					<Image
						src={'/assets/icons/collapse.svg'}
						height={20}
						width={20}
						alt=''
						className={theme == 'dark' ? 'dark-icons' : ''}
					/>
				)
			}
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
				key='2'
			>
				{!loading && !delegationInfo ? (
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
