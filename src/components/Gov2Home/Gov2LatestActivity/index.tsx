// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// import { Tabs } from 'antd';
import Link from 'next/link';
import React, { useState } from 'react';
import { networkTrackInfo } from 'src/global/post_trackInfo';
import CountBadgePill from 'src/ui-components/CountBadgePill';
import styled from 'styled-components';

import { getColumns } from '~src/components/Home/LatestActivity/columns';
import PostsTable from '~src/components/Home/LatestActivity/PostsTable';
import { ProposalType } from '~src/global/proposalType';

import AllGov2PostsTable from './AllGov2PostsTable';
import TrackPostsTable from './TrackPostsTable';
import { useNetworkSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import { Tabs } from '~src/ui-components/Tabs';

const Container = styled.div`
	th {
		color: ${(props: any) => (props.theme == 'dark' ? '#909090' : '#485F7D')} !important;
		background: ${(props: any) => (props.theme == 'dark' ? '#0D0D0D' : '#fafafa')} !important;
		font-weight: 500 !important;
		font-size: 14px !important;
		line-height: 21px !important;
		white-space: nowrap;
	}

	.ant-table-wrapper .ant-table-container::after {
		background-color: ${(props: any) => (props.theme == 'dark' ? '#0D0D0D' : 'white')} !important;
	}

	th.ant-table-cell {
		color: ${(props: any) => (props.theme == 'dark' ? '#909090' : '#485F7D')} !important;
		background-color: ${(props: any) => (props.theme == 'dark' ? '#0D0D0D' : '')} !important;
		font-weight: 500 !important;
		font-size: 14px !important;
		line-height: 21px !important;
		white-space: nowrap;
	}

	.ant-table-thead > tr > th {
		color: ${(props: any) => (props.theme == 'dark' ? '#909090' : '#485F7D')} !important;
		background: ${(props: any) => (props.theme == 'dark' ? '#0D0D0D' : '#fafafa')} !important;
		font-weight: 500 !important;
		font-size: 14px !important;
		line-height: 21px !important;
		white-space: nowrap;
	}

	.ant-table-row {
		color: ${(props: any) => (props.theme == 'dark' ? 'white' : '#243A57')} !important;
		background-color: ${(props: any) => (props.theme == 'dark' ? '#0D0D0D' : '')} !important;
		font-size: 14px !important;
		font-weight: 400 !important;
	}

	.ant-table-row:hover > td {
		background-color: ${(props: any) => (props.theme == 'dark' ? '#595959' : '')} !important;
	}

	tr {
		color: ${(props: any) => (props.theme == 'dark' ? 'white' : '#243A57')} !important;
		background-color: ${(props: any) => (props.theme == 'dark' ? '#0D0D0D' : '')} !important;
		font-size: 14px !important;
		font-weight: 400 !important;
		cursor: pointer !important;
		white-space: nowrap;
	}
	.ant-table-wrapper .ant-table-tbody > tr > th,
	.ant-table-wrapper .ant-table-tbody > tr > td {
		border-bottom: ${(props: any) => (props.theme == 'dark' ? '1px solid #323232' : '1px solid #E1E6EB')} !important;
		background: ${(props: any) => (props.theme == 'dark' ? '#0d0d0d' : '#ffffff')} !important;
	}
	.ant-table-wrapper .ant-table-thead > tr > th,
	.ant-table-wrapper .ant-table-thead > tr > td {
		border-bottom: ${(props: any) => (props.theme == 'dark' ? '1px solid #323232' : '1px solid #E1E6EB')} !important;
		background: ${(props: any) => (props.theme == 'dark' ? '#1C1D1F' : '#fafafa')} !important;
	}
	.ant-table-wrapper .ant-table-thead > tr > th:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before,
	.ant-table-wrapper .ant-table-thead > tr > td:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before {
		background-color: ${(props: any) => (props.theme == 'dark' ? 'transparent' : 'white')} !important;
	}
`;
const Gov2LatestActivity = ({ className, gov2LatestPosts }: { className?: string; gov2LatestPosts: any; theme?: string }) => {
	const [currentTab, setCurrentTab] = useState('all');
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();
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

	if (network) {
		for (const trackName of Object.keys(networkTrackInfo[network])) {
			tabItems.push({
				children: (
					<TrackPostsTable
						error={gov2LatestPosts[trackName]?.error}
						posts={gov2LatestPosts[trackName]?.data?.posts}
					/>
				),
				key: trackName
					.split(/(?=[A-Z])/)
					.join('-')
					.toLowerCase(),
				label: (
					<CountBadgePill
						label={trackName.split(/(?=[A-Z])/).join(' ')}
						count={gov2LatestPosts[trackName]?.data?.count}
					/>
				)
			});
		}
	}

	return (
		<Container
			className={`${className} rounded-xxl bg-white p-0 drop-shadow-md dark:bg-section-dark-overlay lg:p-6`}
			theme={theme as any}
		>
			<div className='flex items-center justify-between pl-1 pr-4'>
				<h2 className='mx-3.5 mb-6 mt-6 text-xl font-semibold leading-8 tracking-tight text-bodyBlue dark:text-blue-dark-high lg:mx-0 lg:mt-0'>Latest Activity</h2>
				{currentTab !== 'all' && (
					<Link
						className='rounded-lg px-2 font-medium text-bodyBlue hover:text-pink_primary dark:text-blue-dark-high'
						href={`/${currentTab}`}
					>
						View all
					</Link>
				)}
			</div>
			<Tabs
				type='card'
				items={tabItems}
				className='ant-tabs-tab-bg-white text-sm font-medium text-bodyBlue dark:bg-section-dark-overlay dark:text-blue-dark-high md:px-2'
				onChange={(key: any) => setCurrentTab(key)}
				theme={theme}
			/>
		</Container>
	);
};

export default React.memo(Gov2LatestActivity);
