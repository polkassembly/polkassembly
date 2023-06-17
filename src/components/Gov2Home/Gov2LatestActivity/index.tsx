// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Tabs } from 'antd';
import Link from 'next/link';
import React, { useContext, useState } from 'react';
import { networkTrackInfo } from 'src/global/post_trackInfo';
import CountBadgePill from 'src/ui-components/CountBadgePill';
import styled from 'styled-components';

import { getColumns } from '~src/components/Home/LatestActivity/columns';
import PostsTable from '~src/components/Home/LatestActivity/PostsTable';
import { NetworkContext } from '~src/context/NetworkContext';
import { ProposalType } from '~src/global/proposalType';

import AllGov2PostsTable from './AllGov2PostsTable';
import TrackPostsTable from './TrackPostsTable';

const Gov2LatestActivity = ({ className, gov2LatestPosts }: { className?:string, gov2LatestPosts: any }) => {
	const [currentTab, setCurrentTab] = useState('all');
	const { network } = useContext(NetworkContext);

	const tabItems = [
		{
			children: (
				<AllGov2PostsTable
					error={gov2LatestPosts?.allGov2Posts?.error}
					posts={gov2LatestPosts.allGov2Posts?.data?.posts}
				/>
			),
			key: 'all',
			label: (
				<CountBadgePill
					label='All'
					count={gov2LatestPosts.allGov2Posts?.data?.count}
				/>
			)
		},
		{
			children: (
				<PostsTable
					count={gov2LatestPosts.discussionPosts?.data?.count || 0}
					columns={getColumns(ProposalType.DISCUSSIONS)}
					error={gov2LatestPosts?.discussionPosts?.error}
					posts={gov2LatestPosts?.discussionPosts?.data?.posts}
					type={ProposalType.DISCUSSIONS}
				/>
			),
			key: 'discussions',
			label: (
				<CountBadgePill
					label='Discussions'
					count={gov2LatestPosts.discussionPosts?.data?.count}
				/>
			)
		}
	];

	if(network) {
		for (const trackName of Object.keys(networkTrackInfo[network])) {
			tabItems.push({
				children: (
					<TrackPostsTable
						error={gov2LatestPosts[trackName]?.error}
						posts={gov2LatestPosts[trackName]?.data?.posts}
					/>
				),
				key: trackName.split(/(?=[A-Z])/).join('-').toLowerCase(),
				label:(
					<CountBadgePill
						label={trackName.split(/(?=[A-Z])/).join(' ')}
						count={gov2LatestPosts[trackName]?.data?.count}
					/>
				)
			});
		}
	}

	return (
		<div className={`${className} bg-white drop-shadow-md p-2 lg:p-6 rounded-xxl`}>
			<div className="flex justify-between items-center">
				<h2 className='text-bodyBlue text-xl font-medium leading-8 sm:mb-6 sm:mt-2 sm:mt-0 xs:mx-2 xs:my-3 sm:mx-0 sm:my-0'>Latest Activity</h2>
				{currentTab !== 'all' && <Link className='text-sidebarBlue font-medium hover:text-pink_primary py-0.5 px-2 rounded-lg' href={`/${currentTab}`}>View all</Link>}
			</div>
			<Tabs
				type="card"
				items={tabItems}
				className='ant-tabs-tab-bg-white text-bodyBlue text-sm font-medium'
				onChange={(key) => setCurrentTab(key)}
			/>
		</div>
	);
};

export default React.memo(styled(Gov2LatestActivity)`
	th {
		color: #485F7D !important;
		font-weight: 500 !important;
		font-size: 14px !important;
		line-height: 21px !important;
		white-space: nowrap;
	}

	th.ant-table-cell {
		color: #485F7D !important;
		font-weight: 500 !important;
		font-size: 14px !important;
		line-height: 21px !important;
		white-space: nowrap;
	}

	.ant-table-thead > tr > th {
		color: #485F7D !important;
		font-weight: 500 !important;
		font-size: 14px !important;
		line-height: 21px !important;
		white-space: nowrap;
	}

	.ant-table-row{
		color: #243A57 !important;
		font-size: 14px !important;
		font-weight: 400 !important;
	}

	tr{
		color: #243A57 !important;
		font-size: 14px !important;
		font-weight: 400 !important;
		cursor: pointer !important;
		white-space: nowrap;
	}

	.ant-tabs-tab-bg-white .ant-tabs-tab:not(.ant-tabs-tab-active) {
		background-color: white;
		border-top-color: white;
		border-left-color: white;
		border-right-color: white;
		border-bottom-color: #E1E6EB;
	}

	.ant-tabs-tab-bg-white .ant-tabs-tab-active{
		border-top-color: #E1E6EB;
		border-left-color: #E1E6EB;
		border-right-color: #E1E6EB;
		border-radius: 6px 6px 0 0 !important;
	}

	.ant-tabs-tab-bg-white .ant-tabs-nav:before{
		border-bottom: 1px solid #E1E6EB;
	}
`);