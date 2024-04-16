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
import { Divider } from 'antd';
import DelegationTabs from './DelegationTabs';
import { IDelegationAnalytics } from '../types';

const { Panel } = Collapse;

const AnalyticsDelegation = ({ trackNumber }: { className?: string; trackNumber: number }) => {
	const { resolvedTheme: theme } = useTheme();
	const [delegationData, setDelegationData] = useState<IDelegationAnalytics>({
		delegateesData: {},
		delegatorsData: {},
		totalCapital: '',
		totalDelegates: 0,
		totalDelegators: 0,
		totalVotesBalance: ''
	});

	const getData = async () => {
		const { data, error } = await nextApiClientFetch<IDelegationAnalytics>('/api/v1/trackLevelAnalytics/delegation-analytics-stats', {
			trackNumber
		});

		if (data) {
			setDelegationData(data);
		}
		if (error) console.log(error);
	};

	useEffect(() => {
		if (isNaN(trackNumber)) return;
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trackNumber]);

	return (
		<Collapse
			size='large'
			theme={theme as any}
			className='bg-white dark:border-separatorDark dark:bg-section-dark-overlay'
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
						/>{' '}
						<span className='py-[3.8px] text-base font-semibold text-blue-light-high dark:text-blue-dark-high'>Delegation</span>
					</div>
				}
				key='2'
			>
				<DelegationStats
					totalCapital={delegationData?.totalCapital}
					totalVotesBalance={delegationData?.totalVotesBalance}
					totalDelegates={delegationData?.totalDelegates}
					totalDelegators={delegationData?.totalDelegators}
				/>
				<Divider
					dashed
					className='mb-3 mt-5 border-[#D2D8E0] dark:border-[#5A5A5A]'
				/>
				<DelegationTabs
					delegateesData={delegationData?.delegateesData}
					delegatorsData={delegationData?.delegatorsData}
				/>
			</Panel>
		</Collapse>
	);
};

export default AnalyticsDelegation;
