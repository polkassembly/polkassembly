// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import { Pagination } from 'antd';
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
}

export enum CustomStatus {
	Submitted = 'CustomStatusSubmitted',
	Voting = 'CustomStatusVoting',
	Closed = 'CustomStatusClosed',
    Active = 'CustomStatusActive'
}

const TrackListingCard = ({ className, posts, trackName } : Props) => {
	const items = [
		{
			label: <CountBadgePill label='All' count={posts?.all?.data?.count || 0} />,
			key: 'All',
			children: <TrackListingAllTabContent
				posts={posts?.all?.data?.posts || []}
				error={posts?.all?.error}
				count={posts?.all?.data?.count || 0}
			/>
		},
		{
			label: <CountBadgePill label='Submitted' count={posts?.submitted?.data?.count || 0} />,
			key: 'Submitted',
			children: <TrackListingStatusTabContent
				posts={posts?.submitted?.data?.posts || []}
				error={posts?.submitted?.error}
				trackName={trackName}
				count={posts?.submitted?.data?.count || 0}
				status={CustomStatus.Submitted} />
		},
		{
			label: <CountBadgePill label='Voting' count={posts?.voting?.data?.count || 0} />,
			key: 'Voting',
			children: <TrackListingStatusTabContent
				posts={posts?.voting?.data?.posts || []}
				error={posts?.voting?.error}
				trackName={trackName}
				count={posts?.voting?.data?.count || 0}
				status={CustomStatus.Voting}
			/>
		},
		{
			label: <CountBadgePill label='Closed' count={posts?.closed?.data?.count || 0} />,
			key: 'Closed',
			children: <TrackListingStatusTabContent
				posts={posts?.closed?.data?.posts || []}
				error={posts?.closed?.error}
				trackName={trackName}
				count={posts?.closed?.data?.count || 0}
				status={CustomStatus.Closed}
			/>
		},
		{
			label:
				<FilterByTags className='xs:hidden sm:block sm:mr-5'/>,
			key: 'Filter'
		}
	];
	const router = useRouter();
	const trackStatus = router.query['trackStatus'];
	const defaultActiveTab = trackStatus && ['closed', 'all', 'voting', 'submitted'].includes(String(trackStatus))? String(trackStatus).charAt(0).toUpperCase() + String(trackStatus).slice(1) : 'All';
	const [activeTab, setActiveTab] = useState(defaultActiveTab);
	const onTabClick = (key: string) => {
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
		<div className={`${className} bg-white drop-shadow-md rounded-xxl md:py-8 px-0`}>
			<div className='sm:hidden xs:flex xs:items-center xs:justify-end xs:mb-0 xs:px-4 xs:pt-2'>
				<FilterByTags className='sm:hidden xs:mr-1 xs:mt-1 xs:mb-2'/>
			</div>
			<Tabs
				activeKey={activeTab}
				items={items}
				onTabClick={onTabClick}
				type="card"
				className='ant-tabs-tab-bg-white text-bodyBlue font-medium'
			/>
			{
				(posts?.all?.data?.count||0) > 10  && activeTab === 'All' || (posts?.submitted?.data?.count||0) > 10 && activeTab === 'Submitted' || (posts?.voting?.data?.count||0) > 10 && activeTab === 'Voting' || (posts?.closed?.data?.count||0) > 10 && activeTab === 'Closed' ?
					<Pagination
						className='flex justify-end mt-6'
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
		</div>
	);
};

export default styled(TrackListingCard)`
	.ant-tabs-nav{
		margin-left: 15px;
	}
	.ant-tabs-nav-list {
		width: 100%;
		[data-node-key="Filter"] {
		position: absolute;
		right: 0;
	}
}
	@media only screen and (max-width: 640px){
		.ant-tabs-nav{
			margin-left: 0px;
			margin-top: 0px;
		}
		.ant-tabs-nav-list {
			width: auto;
			[data-node-key="Filter"] {
				display: none;
			}
		}
}
`;