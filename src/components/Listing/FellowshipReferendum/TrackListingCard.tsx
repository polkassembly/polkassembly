// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Pagination } from '~src/ui-components/Pagination';
import React, { FC, useState } from 'react';

import TrackListingAllTabContent from './TrackListingAllTabContent';
import TrackListingTabContent from './TrackListingTabContent';
import FilterByTags from '~src/ui-components/FilterByTags';
import { useRouter } from 'next/router';
import { handlePaginationChange } from '~src/util/handlePaginationChange';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { IFellowshipReferendumPostsByTrackName } from 'pages/member-referenda';
import CountBadgePill from '~src/ui-components/CountBadgePill';
import { useTheme } from 'next-themes';
import { Tabs } from '~src/ui-components/Tabs';

interface ITrackListingCardProps {
	className?: string;
	posts: IFellowshipReferendumPostsByTrackName | undefined;
	setTrackName: React.Dispatch<React.SetStateAction<string>>;
	fellowshipReferendumPostOrigins: string[];
}

const TrackListingCard: FC<ITrackListingCardProps> = (props) => {
	const { posts, className, setTrackName, fellowshipReferendumPostOrigins } = props;
	const { resolvedTheme: theme } = useTheme();
	const items = [
		{
			children: (
				<TrackListingAllTabContent
					posts={posts?.All?.data?.posts || []}
					error={posts?.All?.error}
					count={posts?.All?.data?.count || 0}
				/>
			),
			key: 'All',
			label: (
				<CountBadgePill
					label='All'
					count={posts?.All?.data?.count || 0}
				/>
			)
		},
		...fellowshipReferendumPostOrigins.map((value) => {
			return {
				children: (
					<TrackListingTabContent
						posts={posts?.[value]?.data?.posts || []}
						error={posts?.[value]?.error}
						count={posts?.[value]?.data?.count || 0}
					/>
				),
				key: value,
				label: (
					<CountBadgePill
						label={value.replace(/([a-z0-9])([A-Z])/g, '$1 $2')}
						count={posts?.[value]?.data?.count || 0}
					/>
				)
			};
		}),
		{
			key: 'Filter',
			label: <FilterByTags className='hidden sm:mb-2 sm:mr-1 sm:mt-1 sm:flex' />
		}
	];
	const router = useRouter();
	const trackName = router.query['trackName'];
	const defaultActiveTab = trackName && ['All', ...fellowshipReferendumPostOrigins].includes(String(trackName)) ? String(trackName) : 'All';
	const [activeTab, setActiveTab] = useState(defaultActiveTab);
	const onTabClick = (key: string) => {
		if (key === 'Filter') return;
		setActiveTab(key);
		const query = { ...router.query };
		delete query.page;
		router.push({
			pathname: router.pathname,
			query: {
				...query,
				page: 1,
				trackName: key
			}
		});
	};

	const onPaginationChange = (page: number) => {
		router.push({
			pathname: router.pathname,
			query: {
				...router.query,
				page,
				trackName: activeTab
			}
		});
		handlePaginationChange({ limit: LISTING_LIMIT, page });
	};

	return (
		<div className={`${className} rounded-xxl bg-white px-0 drop-shadow-md dark:bg-section-dark-overlay xs:py-4 sm:py-8`}>
			<div className='xs:mb-0 xs:flex xs:items-center xs:justify-end xs:px-4 xs:pt-2 sm:hidden'>
				<FilterByTags className='xs:mb-2 xs:mr-1 xs:mt-1 sm:hidden' />
			</div>
			<Tabs
				activeKey={activeTab}
				items={items}
				onTabClick={onTabClick}
				type='card'
				onChange={(v: any) => {
					setTrackName(v);
				}}
				className='ant-tabs-tab-bg-white font-medium text-bodyBlue dark:text-blue-dark-high'
				theme={theme}
			/>
			{(posts?.[activeTab]?.data?.count || 0) > 0 && (posts as any)[activeTab].data.count > LISTING_LIMIT && (
				<Pagination
					className='mb-2 mt-4 flex justify-end sm:mt-6'
					defaultCurrent={1}
					current={router.query.page ? parseInt(router.query.page as string, 10) : 1}
					onChange={onPaginationChange}
					pageSize={LISTING_LIMIT}
					showSizeChanger={false}
					total={posts?.[activeTab]?.data?.count || 0}
					responsive={true}
					theme={theme}
				/>
			)}
		</div>
	);
};

export default TrackListingCard;
