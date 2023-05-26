// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Pagination, Tabs } from 'antd';
import React, { FC, useState } from 'react';

import TrackListingAllTabContent from './TrackListingAllTabContent';
import TrackListingTabContent from './TrackListingTabContent';
import FilterByTags from '~src/ui-components/FilterByTags';
import FilteredTags from '~src/ui-components/filteredTags';
import { useRouter } from 'next/router';
import { handlePaginationChange } from '~src/util/handlePaginationChange';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { IFellowshipReferendumPostsByTrackName } from 'pages/member-referenda';
import CountBadgePill from '~src/ui-components/CountBadgePill';

interface ITrackListingCardProps {
	className?: string;
	posts: IFellowshipReferendumPostsByTrackName|undefined;
    setTrackName: React.Dispatch<React.SetStateAction<string>>;
    fellowshipReferendumPostOrigins: string[];
}

const TrackListingCard: FC<ITrackListingCardProps> = (props) => {
	const { posts, className, setTrackName, fellowshipReferendumPostOrigins } = props;
	const items = [
		{
			children: <TrackListingAllTabContent
				posts={posts?.All?.data?.posts || []}
				error={posts?.All?.error}
				count={posts?.All?.data?.count || 0}
			/>,
			key: 'All',
			label: <CountBadgePill label='All' count={posts?.All?.data?.count || 0} />
		},
		...fellowshipReferendumPostOrigins.map((value) => {
			return {
				children: <TrackListingTabContent
					posts={posts?.[value]?.data?.posts || []}
					error={posts?.[value]?.error}
					count={posts?.[value]?.data?.count || 0}
				/>,
				key: value,
				label: <CountBadgePill label={value.replace(/([a-z0-9])([A-Z])/g, '$1 $2')} count={posts?.[value]?.data?.count || 0} />
			};
		})
	];
	const router = useRouter();
	const trackName = router.query['trackName'];
	const defaultActiveTab = trackName && ['All', ...fellowshipReferendumPostOrigins].includes(String(trackName))? String(trackName): 'All';
	const [activeTab, setActiveTab] = useState(defaultActiveTab);
	const onTabClick = (key: string) => {
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
		<div
			className={`${className} bg-white drop-shadow-md rounded-md p-4 md:p-8 text-sidebarBlue`}
		><div className='flex items-center justify-between mb-10'>
				<div>
					<h1 className='dashboard-heading'>Fellowship Referenda</h1>
					<FilteredTags/>
				</div>
				<FilterByTags className='mr-[2px] mt-[-8px]'/>
			</div>
			<Tabs
				activeKey={activeTab}
				items={items}
				onTabClick={onTabClick}
				type="card"
				onChange={(v) => {
					setTrackName(v);
				}}
				className='ant-tabs-tab-bg-white text-sidebarBlue font-medium'
			/>
			{
				posts?.[activeTab]?.data?.count && (posts as any)[activeTab].data.count > LISTING_LIMIT &&
				<Pagination
					className='flex justify-end mt-6'
					defaultCurrent={1}
					current={router.query.page ? parseInt(router.query.page as string, 10) : 1}
					onChange={onPaginationChange}
					pageSize={LISTING_LIMIT}
					showSizeChanger={false}
					total={posts?.[activeTab]?.data?.count || 0}
					responsive={true}
				/>
			}
		</div>
	);
};

export default TrackListingCard;