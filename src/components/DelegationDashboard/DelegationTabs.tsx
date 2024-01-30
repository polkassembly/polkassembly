// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import classNames from 'classnames';
import React from 'react';
import styled from 'styled-components';
import { Tabs } from '~src/ui-components/Tabs';
import BecomeDelegate from './BecomeDelegate';
import TotalDelegationData from './TotalDelegationData';
import TrendingDelegates from './TrendingDelegates';
import { Skeleton, TabsProps } from 'antd';
import DelegationProfile from '~src/ui-components/DelegationProfile';
import DashboardTrackListing from './TracksListing';

interface Props {
	className?: string;
	theme?: string;
	isLoggedOut: boolean;
	userDetails: any;
}

const DelegationTabs = ({ className, theme, isLoggedOut, userDetails }: Props) => {
	const tabItems: TabsProps['items'] = [
		{
			children: (
				<>
					{isLoggedOut && <h2 className='mb-6 mt-5 text-2xl font-semibold text-bodyBlue dark:text-blue-dark-high max-lg:pt-[60px] md:mb-5'>Delegation </h2>}
					<BecomeDelegate />
					<TotalDelegationData />
					<TrendingDelegates />
				</>
			),
			key: '1',
			label: 'Dashboard'
		},
		{
			children: (
				<>
					<BecomeDelegate />
					<DelegationProfile
						address={userDetails?.delegationDashboardAddress}
						username={userDetails?.username || ''}
						className='mt-8 rounded-xxl bg-white px-6 py-5 drop-shadow-md dark:bg-section-dark-overlay'
					/>
					<div className='mt-8 rounded-xxl bg-white p-5 drop-shadow-md dark:bg-section-dark-overlay'>
						{!!userDetails?.delegationDashboardAddress && userDetails?.delegationDashboardAddress?.length > 0 ? (
							<DashboardTrackListing
								theme={theme}
								address={String(userDetails.delegationDashboardAddress)}
							/>
						) : (
							<Skeleton />
						)}
					</div>
				</>
			),
			key: '2',
			label: 'My Delegation'
		}
	];

	return (
		<div className={classNames(className, 'mt-8 rounded-[18px]')}>
			<Tabs
				defaultActiveKey='2'
				theme={theme}
				type='card'
				className='ant-tabs-tab-bg-white font-medium text-bodyBlue dark:bg-transparent dark:text-blue-dark-high'
				items={tabItems}
			/>
		</div>
	);
};

export default styled(DelegationTabs)`
	.ant-tabs-tab-active .active-icon {
		filter: brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7151%) hue-rotate(321deg) brightness(90%) contrast(101%);
	}
	//dark mode icon color change
	// .dark .darkmode-icons {
	// filter: brightness(100%) saturate(0%) contrast(4) invert(100%) !important;
	// }
`;
