// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Tabs } from 'antd';
import Link from 'next/link';
import { ILatestActivityPosts } from 'pages';
import { ILatestActivityPostsListingResponse } from 'pages/api/v1/latest-activity/on-chain-posts';
import React, { FC, useState } from 'react';
import CountBadgePill from 'src/ui-components/CountBadgePill';
import styled from 'styled-components';

import { ProposalType } from '~src/global/proposalType';
import { IApiResponse } from '~src/types';

import { getColumns } from './columns';
import PostsTable from './PostsTable';

interface ILatestActivityProps {
	latestPosts: {
		all?: IApiResponse<ILatestActivityPostsListingResponse>;
	} & ILatestActivityPosts;
	className?: string
	theme?: string
}
type TCapitalizeFn = (str: string, lower?: boolean) => string;
const capitalize: TCapitalizeFn = (str, lower = false) =>
	(lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase());

const getLabel = (key: 'all' | ProposalType): string => {
	if (key === ProposalType.COUNCIL_MOTIONS) {
		return 'Motions';
	} else if (key === ProposalType.DEMOCRACY_PROPOSALS) {
		return 'Proposals';
	} else if (key === ProposalType.TREASURY_PROPOSALS) {
		return 'Treasury Proposals';
	}
	return capitalize(key);
};

const LatestActivity: FC<ILatestActivityProps> = ({ className, latestPosts, theme }) => {

	const [currentTab, setCurrentTab] = useState('all');
	const tabItems = (
			Object.entries(latestPosts) as [key: 'all' | ProposalType, value: IApiResponse<ILatestActivityPostsListingResponse>][]
	).map(([key, value]) => {
		const label = getLabel(key);
		return {
			children: (
				<PostsTable
					count={value?.data?.count || 0}
					posts={value?.data?.posts}
					error={value?.error || ''}
					columns={getColumns(key)}
					type={key}
				/>
			),
			key: key === ProposalType.REFERENDUMS? 'referenda': label.toLowerCase().split(' ').join('-'),
			label: <CountBadgePill label={label} count={value?.data?.count} />
		};
	});
	console.log('theemeee', theme);
	return (
		<div className={`${className} bg-white dark:bg-section-dark-overlay drop-shadow-md p-0 lg:p-6 rounded-xxl`}>
			<div className="flex justify-between items-center pr-4 pl-1">
				<h2 className='text-blue-light-high dark:text-blue-dark-high text-xl font-medium leading-8 mb-6 mt-6 lg:mt-0 mx-3.5 lg:mx-0'>Latest Activity</h2>
				{currentTab !== 'all' && <Link className='text-blue-light-high dark:text-blue-dark-high font-medium hover:text-pink_primary px-2 rounded-lg' href={`/${currentTab}`}>View all</Link>}
			</div>
			<Tabs
				className='ant-tabs-tab-bg-white dark:bg-section-dark-overlay text-blue-light-high dark:text-blue-dark-high text-sm md:px-2 font-medium'
				type="card"
				items={tabItems}
				onChange={(key) => setCurrentTab(key)}
			/>
		</div>
	);
};

export default styled(LatestActivity)`
	th {
		color: ${props => props.theme=='dark' ? '#909090' : '#485F7D'} !important;
		background-color: ${props => props.theme=='dark' ? '#0D0D0D' : ''} !important;
		font-weight: 500 !important;
		font-size: 14px !important;
		line-height: 21px !important;
	}

	th.ant-table-cell {
		color: ${props => props.theme=='dark' ? '#909090' : '#485F7D'} !important;
		background-color: ${props => props.theme=='dark' ? '#0D0D0D' : ''} !important;
		font-weight: 500 !important;
		font-size: 14px !important;
		line-height: 21px !important;
	}

	.ant-table-thead > tr > th {
		color: ${props => props.theme=='dark' ? '#909090' : '#485F7D'} !important;
		background-color: ${props => props.theme=='dark' ? '#0D0D0D' : ''} !important;
		font-weight: 500 !important;
		font-size: 14px !important;
		line-height: 21px !important;
		white-space: nowrap;
	}

	.ant-table-row {
		color: ${props => props.theme=='dark' ? 'white' : '#243A57'} !important;
		background-color: ${props => props.theme=='dark' ? '#0D0D0D' : ''} !important;
		font-size: 14px !important;
		font-weight: 400 !important;
	}

	.ant-table-row:hover > td{
		background-color: ${props => props.theme=='dark' ? '#595959' : ''} !important;
	}
	tr {
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
		border-bottom: ${props => props.theme=='dark' ? '1px solid #272C31' : '1px solid #E1E6EB'} !important;
	}
	.ant-table-wrapper .ant-table-thead >tr>th, .ant-table-wrapper .ant-table-thead >tr>td{
		border-bottom: ${props => props.theme=='dark' ? '1px solid #272C31' : '1px solid #E1E6EB'} !important;
	}
	.ant-tabs-card >.ant-tabs-nav .ant-tabs-tab, .ant-tabs-card >div>.ant-tabs-nav .ant-tabs-tab{
		border: ${props => props.theme=='dark' ? 'none' : ''} !important;
	}
	.ant-tabs-top >.ant-tabs-nav::before, .ant-tabs-bottom >.ant-tabs-nav::before, .ant-tabs-top >div>.ant-tabs-nav::before, .ant-tabs-bottom >div>.ant-tabs-nav::before{
		border: ${props => props.theme=='dark' ? 'none' : ''} !important;
	}
	.ant-table-wrapper .ant-table-thead >tr>th:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before, .ant-table-wrapper .ant-table-thead >tr>td:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before{
		background: none !important;
	}
	.ant-tabs-card >.ant-tabs-nav .ant-tabs-tab-active, .ant-tabs-card >div>.ant-tabs-nav .ant-tabs-tab-active{
		background-color: ${props => props.theme=='dark' ? '#0D0D0D' : 'white'} !important;
		border: ${props => props.theme=='dark' ? '1px solid #29323C' : ''} !important;
		border-bottom: ${props => props.theme=='dark' ? 'none' : ''} !important;
	}

`;