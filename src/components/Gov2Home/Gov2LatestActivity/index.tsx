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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Gov2LatestActivity = ({ className, gov2LatestPosts, theme }: { className?:string, gov2LatestPosts: any , theme?:string }) => {
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
		<div className={`${className} bg-white dark:bg-section-dark-overlay drop-shadow-md p-0 lg:p-6 rounded-xxl`}>
			<div className="flex justify-between items-center pr-4 pl-1">
				<h2 className='text-blue-light-high dark:text-blue-dark-high text-xl font-medium leading-8 mb-6 mt-6 lg:mt-0 mx-3.5 lg:mx-0'>Latest Activity</h2>
				{currentTab !== 'all' && <Link className='text-blue-light-high dark:text-blue-dark-high font-medium hover:text-pink_primary px-2 rounded-lg dark:text-blue-dark-helper dark:font-normal' href={`/${currentTab}`}>View all</Link>}
			</div>
			<Tabs
				type="card"
				items={tabItems}
				className='ant-tabs-tab-bg-white dark:bg-section-dark-overlay text-blue-light-high dark:text-blue-dark-high text-sm md:px-2 font-medium'
				onChange={(key) => setCurrentTab(key)}
			/>
		</div>
	);
};

export default React.memo(styled(Gov2LatestActivity)`
	th {
		/* color: #485F7D !important; */
		font-weight: 500 !important;
		font-size: 14px !important;
		line-height: 21px !important;
		white-space: nowrap;
		color: ${props => props.theme=='dark' ? '#909090' : '#485F7D'} !important;
		background-color: ${props => props.theme=='dark' ? '#0D0D0D' : ''} !important;
	}

	.ant-table-wrapper .ant-table-container::after{
		background-color: ${props => props.theme=='dark' ? '#0D0D0D' : 'none'} !important;
	}

	th.ant-table-cell {
		color: ${props => props.theme=='dark' ? '#909090' : '#485F7D'} !important;
		background-color: ${props => props.theme=='dark' ? '#0D0D0D' : ''} !important;
		font-weight: 500 !important;
		font-size: 14px !important;
		line-height: 21px !important;
		white-space: nowrap;
	}

	.ant-table-thead > tr > th {
		color: ${props => props.theme=='dark' ? '#909090' : '#485F7D'} !important;
		background-color: ${props => props.theme=='dark' ? '#0D0D0D' : ''} !important;
		font-weight: 500 !important;
		font-size: 14px !important;
		line-height: 21px !important;
		white-space: nowrap;
	}

	.ant-table-row{
		color: ${props => props.theme=='dark' ? 'white' : '#243A57'} !important;
		background-color: ${props => props.theme=='dark' ? '#0D0D0D' : ''} !important;
		font-size: 14px !important;
		font-weight: 400 !important;
	}
	.ant-table-row:hover > td{
		background-color: ${props => props.theme=='dark' ? '#595959' : ''} !important;
	}
	tr{
		color: ${props => props.theme=='dark' ? 'white' : '#243A57'} !important;
		background-color: ${props => props.theme=='dark' ? '#0D0D0D' : ''} !important;
		font-size: 14px !important;
		font-weight: 400 !important;
		cursor: pointer !important;
		white-space: nowrap;
	}
	.ant-table-wrapper .ant-table-cell-fix-left, .ant-table-wrapper .ant-table-cell-fix-right{
		background-color: ${props => props.theme=='dark' ? '#0D0D0D' : 'white'} !important;
	}
	.ant-tabs-tab-bg-white dark:bg-section-dark-overlay .ant-tabs-tab:not(.ant-tabs-tab-active) {
		background-color: white;
		border-top-color: white;
		border-left-color: white;
		border-right-color: white;
		border-bottom-color: #E1E6EB;
	}

	.ant-tabs-tab-bg-white dark:bg-section-dark-overlay .ant-tabs-tab-active{
		border-top-color: #E1E6EB;
		border-left-color: #E1E6EB;
		border-right-color: #E1E6EB;
		border-radius: 6px 6px 0 0 !important;
	}

	.ant-tabs-tab-bg-white dark:bg-section-dark-overlay .ant-tabs-nav:before{
		border-bottom: 1px solid #E1E6EB;
	}
	.ant-table-wrapper .ant-table-tbody >tr >th, .ant-table-wrapper .ant-table-tbody >tr >td{
		border-bottom: ${props => props.theme=='dark' ? '1px solid #323232' : '1px solid #E1E6EB'} !important;
	}
	.ant-table-wrapper .ant-table-thead >tr>th, .ant-table-wrapper .ant-table-thead >tr>td{
		border-bottom: ${props => props.theme=='dark' ? '1px solid #323232' : '1px solid #E1E6EB'} !important;
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
		border: ${props => props.theme=='dark' ? '1px solid #4B4B4B' : ''} !important;
		border-bottom: ${props => props.theme=='dark' ? 'none' : ''} !important;
	}
	.ant-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn{
		color: ${props => props.theme=='dark' ? '#FF60B5' : '#e5007a'} !important;
	}
`);