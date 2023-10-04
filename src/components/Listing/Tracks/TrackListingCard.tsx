// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import { Pagination as AntdPagination } from 'antd';
import { useRouter } from 'next/router';
import { Tabs } from 'antd';
import { IReferendumV2PostsByStatus } from 'pages/root';
import React, { useState } from 'react';
import CountBadgePill from '~src/ui-components/CountBadgePill';

import TrackListingAllTabContent from './TrackListingAllTabContent';
import TrackListingStatusTabContent from './TrackListingStatusTabContent';
import FilterByTags from '~src/ui-components/FilterByTags';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { handlePaginationChange } from '~src/util/handlePaginationChange';
import styled from 'styled-components';

interface Props {
	className?: string;
	posts: IReferendumV2PostsByStatus;
	trackName: string;
	theme?: string;
}

const Pagination = styled(AntdPagination)`
	a{
		color: ${props => props.theme === 'dark' ? '#fff' : '#212121'} !important;
	}
	.ant-pagination-item-active {
		background-color: ${props => props.theme === 'dark' ? 'black' : 'white'} !important;
	}
	.anticon-right {
		color: ${props => props.theme === 'dark' ? 'white' : ''} !important;
	}
	.anticon-left {
		color: ${props => props.theme === 'dark' ? 'white' : ''} !important;
	}
`;

export enum CustomStatus {
	Submitted = 'CustomStatusSubmitted',
	Voting = 'CustomStatusVoting',
	Closed = 'CustomStatusClosed',
	Active = 'CustomStatusActive'
}

<<<<<<< HEAD
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TrackListingCard = ({ className, posts, trackName, theme } : Props) => {
=======
const TrackListingCard = ({ className, posts, trackName }: Props) => {
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
	const items = [
		{
			label: (
				<CountBadgePill
					label='All'
					count={posts?.all?.data?.count || 0}
				/>
			),
			key: 'All',
			children: (
				<TrackListingAllTabContent
					posts={posts?.all?.data?.posts || []}
					error={posts?.all?.error}
					count={posts?.all?.data?.count || 0}
				/>
			)
		},
		{
			label: (
				<CountBadgePill
					label='Submitted'
					count={posts?.submitted?.data?.count || 0}
				/>
			),
			key: 'Submitted',
			children: (
				<TrackListingStatusTabContent
					posts={posts?.submitted?.data?.posts || []}
					error={posts?.submitted?.error}
					trackName={trackName}
					count={posts?.submitted?.data?.count || 0}
					status={CustomStatus.Submitted}
				/>
			)
		},
		{
			label: (
				<CountBadgePill
					label='Voting'
					count={posts?.voting?.data?.count || 0}
				/>
			),
			key: 'Voting',
			children: (
				<TrackListingStatusTabContent
					posts={posts?.voting?.data?.posts || []}
					error={posts?.voting?.error}
					trackName={trackName}
					count={posts?.voting?.data?.count || 0}
					status={CustomStatus.Voting}
				/>
			)
		},
		{
			label: (
				<CountBadgePill
					label='Closed'
					count={posts?.closed?.data?.count || 0}
				/>
			),
			key: 'Closed',
			children: (
				<TrackListingStatusTabContent
					posts={posts?.closed?.data?.posts || []}
					error={posts?.closed?.error}
					trackName={trackName}
					count={posts?.closed?.data?.count || 0}
					status={CustomStatus.Closed}
				/>
			)
		},
		{
			label: <FilterByTags className='xs:hidden sm:mr-5 sm:block' />,
			key: 'Filter'
		}
	];
	const router = useRouter();

	const trackStatus = router.query['trackStatus'];

	const defaultActiveTab =
		trackStatus && ['closed', 'all', 'voting', 'submitted'].includes(String(trackStatus)) ? String(trackStatus).charAt(0).toUpperCase() + String(trackStatus).slice(1) : 'All';
	const [activeTab, setActiveTab] = useState(defaultActiveTab);

	const onTabClick = (key: string) => {
		if (key === 'Filter') return;
		setActiveTab(key);
		router.push({
			pathname: router.pathname,
			query: {
				...router.query,
				page: 1,
				trackStatus: key.toLowerCase()
			}
		});
	};

	const onPaginationChange = (page: number) => {
		router.push({
			pathname: router.pathname,
			query: {
				...router.query,
				page,
				trackStatus: activeTab.toLowerCase()
			}
		});
		handlePaginationChange({ limit: LISTING_LIMIT, page });
	};
	return (
<<<<<<< HEAD
		<div className={`${className} bg-white dark:bg-section-dark-overlay drop-shadow-md rounded-xxl sm:py-8 px-0 xs:py-4`}>
			<div className='sm:hidden xs:flex xs:items-center xs:justify-end xs:mb-0 xs:px-4 xs:pt-2'>
				<FilterByTags className='sm:hidden xs:mr-1 xs:mt-1 xs:mb-2'/>
=======
		<div className={`${className} rounded-xxl bg-white px-0 drop-shadow-md xs:py-4 sm:py-8`}>
			<div className='xs:mb-0 xs:flex xs:items-center xs:justify-end xs:px-4 xs:pt-2 sm:hidden'>
				<FilterByTags className='xs:mb-2 xs:mr-1 xs:mt-1 sm:hidden' />
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
			</div>
			<Tabs
				activeKey={activeTab}
				items={items}
				onTabClick={onTabClick}
<<<<<<< HEAD
				type="card"
				className='ant-tabs-tab-bg-white dark:bg-section-dark-overlay text-blue-light-high dark:text-blue-dark-high font-medium'
			/>
			{
				(posts?.all?.data?.count||0) > 10  && activeTab === 'All' || (posts?.submitted?.data?.count||0) > 10 && activeTab === 'Submitted' || (posts?.voting?.data?.count||0) > 10 && activeTab === 'Voting' || (posts?.closed?.data?.count||0) > 10 && activeTab === 'Closed' ?
					<Pagination
						theme={theme}
						className='flex justify-end sm:mt-6 mt-4 mb-2'
						defaultCurrent={1}
						current={router.query.page ? parseInt(router.query.page as string, 10) : 1}
						onChange={onPaginationChange}
						pageSize={LISTING_LIMIT}
						showSizeChanger={false}
						total={posts?.all?.data?.count || 0}
						responsive={true}
					/>
					: null
			}
=======
				type='card'
				className='ant-tabs-tab-bg-white font-medium text-bodyBlue'
			/>
			{((posts?.all?.data?.count || 0) > 10 && activeTab === 'All') ||
			((posts?.submitted?.data?.count || 0) > 10 && activeTab === 'Submitted') ||
			((posts?.voting?.data?.count || 0) > 10 && activeTab === 'Voting') ||
			((posts?.closed?.data?.count || 0) > 10 && activeTab === 'Closed') ? (
				<Pagination
					className='mb-2 mt-4 flex justify-end sm:mt-6'
					defaultCurrent={1}
					current={router.query.page ? parseInt(router.query.page as string, 10) : 1}
					onChange={onPaginationChange}
					pageSize={LISTING_LIMIT}
					showSizeChanger={false}
					total={posts?.[activeTab.toLowerCase() as keyof IReferendumV2PostsByStatus]?.data?.count || 0}
					responsive={true}
				/>
			) : null}
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
		</div>
	);
};

export default styled(TrackListingCard)`
	.ant-tabs-nav {
		margin-left: 15px;
	}
	.ant-tabs-nav-list {
		width: 100%;
		[data-node-key='Filter'] {
			position: absolute;
			right: 0;
			margin-top: -9.5px;
		}
	}
<<<<<<< HEAD
}

.ant-tabs-card >.ant-tabs-nav .ant-tabs-tab, .ant-tabs-card >div>.ant-tabs-nav .ant-tabs-tab{
		border: ${props => props.theme=='dark' ? 'none' : ''} !important;
		font-weight: ${props => props.theme=='dark' ? '400' : '500'} !important;
}
.ant-tabs-top >.ant-tabs-nav::before, .ant-tabs-bottom >.ant-tabs-nav::before, .ant-tabs-top >div>.ant-tabs-nav::before, .ant-tabs-bottom >div>.ant-tabs-nav::before{
		border-bottom: ${props => props.theme=='dark' ? '1px #4B4B4B solid' : ''} !important;
}
.ant-table-wrapper .ant-table-thead >tr>th:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before, .ant-table-wrapper .ant-table-thead >tr>td:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before{
		background: none !important;
}
.ant-tabs-card >.ant-tabs-nav .ant-tabs-tab-active, .ant-tabs-card >div>.ant-tabs-nav .ant-tabs-tab-active{
		background-color: ${props => props.theme=='dark' ? '#0D0D0D' : 'white'} !important;
		border: ${props => props.theme=='dark' ? '1 px solid #4B4B4B' : ''} !important;
		border-bottom: ${props => props.theme=='dark' ? 'none' : ''} !important;
}
.ant-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn{
		color: ${props => props.theme=='dark' ? '#FF60B5' : '#e5007a'} !important;
}
	@media only screen and (max-width: 640px){
		.ant-tabs-nav{
=======
	@media only screen and (max-width: 640px) {
		.ant-tabs-nav {
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
			margin-left: 0px;
			margin-top: 0px;
		}
		.ant-tabs-nav-list {
			width: auto;
			[data-node-key='Filter'] {
				display: none;
			}
		}
	}
`;
