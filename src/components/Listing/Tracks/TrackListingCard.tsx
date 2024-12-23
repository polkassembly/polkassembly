// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import { useRouter } from 'next/router';
import { IReferendumV2PostsByStatus } from 'pages/root';
import React, { useEffect, useState } from 'react';
import CountBadgePill from '~src/ui-components/CountBadgePill';

import TrackListingAllTabContent from './TrackListingAllTabContent';
import TrackListingStatusTabContent from './TrackListingStatusTabContent';
import FilterByTags from '~src/ui-components/FilterByTags';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { handlePaginationChange } from '~src/util/handlePaginationChange';
import styled from 'styled-components';
import { useTheme } from 'next-themes';
import { Tabs } from '~src/ui-components/Tabs';
import { Pagination } from '~src/ui-components/Pagination';
import SortByDropdownComponent from '~src/ui-components/SortByDropdown';
import { sortValues } from '~src/global/sortOptions';
import FilterByStatus from '~src/ui-components/FilterByStatus';

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

const TrackListingCard = ({ className, posts, trackName }: Props) => {
	const { resolvedTheme: theme } = useTheme();
	const router = useRouter();
	const trackStatus = router.query['trackStatus'];
	const [sortBy, setSortBy] = useState<string>(sortValues.COMMENTED);
	const [statusItem, setStatusItem] = useState([]);
	const [initialCountForAll, setInitialCountForAll] = useState<number | undefined>(undefined);
	const [initialCountForSubmitted, setInitialCountForSubmitted] = useState<number | undefined>(undefined);
	const [initialCountForVoting, setInitialCountForVoting] = useState<number | undefined>(undefined);
	const [initialCountForClosed, setInitialCountForClosed] = useState<number | undefined>(undefined);
	useEffect(() => {
		if (initialCountForAll === undefined && posts?.all?.data?.count !== undefined) {
			setInitialCountForAll(posts?.all?.data?.count);
			setInitialCountForSubmitted(posts?.submitted?.data?.count);
			setInitialCountForVoting(posts?.voting?.data?.count);
			setInitialCountForClosed(posts?.closed?.data?.count);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const items = [
		{
			label: (
				<CountBadgePill
					label='All'
					count={initialCountForAll || 0}
				/>
			),
			key: 'All',
			children: (
				<TrackListingAllTabContent
					posts={posts?.all?.data?.posts || []}
					error={posts?.all?.error}
					count={posts?.all?.data?.count || 0}
					statusItem={statusItem}
				/>
			)
		},
		{
			label: (
				<CountBadgePill
					label='Submitted'
					count={initialCountForSubmitted || 0}
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
					statusItem={statusItem}
				/>
			)
		},
		{
			label: (
				<CountBadgePill
					label='Voting'
					count={initialCountForVoting || 0}
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
					statusItem={statusItem}
				/>
			)
		},
		{
			label: (
				<CountBadgePill
					label='Closed'
					count={initialCountForClosed || 0}
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
					statusItem={statusItem}
				/>
			)
		},
		{
			label: (
				<div className='mt-1 flex items-center gap-x-2 '>
					{trackStatus !== 'submitted' && <FilterByStatus setStatusItem={setStatusItem} />}
					<FilterByTags />
					<SortByDropdownComponent
						sortBy={sortBy}
						setSortBy={setSortBy}
						isUsedInTrackListing={true}
					/>
				</div>
			),

			key: 'Filter'
		}
	];

	const defaultActiveTab =
		trackStatus && ['closed', 'all', 'voting', 'submitted'].includes(String(trackStatus)) ? String(trackStatus).charAt(0).toUpperCase() + String(trackStatus).slice(1) : 'All';
	const [activeTab, setActiveTab] = useState(defaultActiveTab);

	const onTabClick = (key: string) => {
		if (key === 'Filter') return;
		setActiveTab(key);

		const newQuery: { [key: string]: any } = { ...router.query, trackStatus: key.toLowerCase() };
		delete newQuery.proposalStatus;
		delete newQuery.filterBy;

		router.push({
			pathname: router.pathname,
			query: newQuery
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
		<div className={`${className} mt-[36px] rounded-xxl bg-white px-0 drop-shadow-md dark:bg-section-dark-overlay xs:py-4 sm:py-8`}>
			<div className='xs:mb-0 xs:flex xs:items-center xs:justify-end xs:pt-2 sm:hidden'>
				<div className='mt-1 flex items-center gap-x-1 xs:mb-2 xs:mr-1 xs:mt-1 sm:hidden'>
					{trackStatus !== 'submitted' && <FilterByStatus setStatusItem={setStatusItem} />}
					<FilterByTags />
					<SortByDropdownComponent
						sortBy={sortBy}
						setSortBy={setSortBy}
						isUsedInTrackListing={true}
					/>
				</div>
				{/* <FilterByTags className='xs:mb-2 xs:mr-1 xs:mt-1 sm:hidden' /> */}
			</div>
			<Tabs
				theme={theme}
				activeKey={activeTab}
				items={items}
				onTabClick={onTabClick}
				type='card'
				className='px-0 md:px-0'
			/>
			{((posts?.all?.data?.count || 0) > 10 && activeTab === 'All') ||
			((posts?.submitted?.data?.count || 0) > 10 && activeTab === 'Submitted') ||
			((posts?.voting?.data?.count || 0) > 10 && activeTab === 'Voting') ||
			((posts?.closed?.data?.count || 0) > 10 && activeTab === 'Closed') ? (
				<Pagination
					theme={theme}
					className='mb-2 mt-4 flex justify-end px-4 sm:mt-6 sm:px-10'
					defaultCurrent={1}
					current={router.query.page ? parseInt(router.query.page as string, 10) : 1}
					onChange={onPaginationChange}
					pageSize={LISTING_LIMIT}
					showSizeChanger={false}
					total={posts?.[activeTab.toLowerCase() as keyof IReferendumV2PostsByStatus]?.data?.count || 0}
					responsive={true}
				/>
			) : null}
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
	@media only screen and (max-width: 640px) {
		.ant-tabs-nav {
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
