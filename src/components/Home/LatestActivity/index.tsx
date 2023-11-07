// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

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
import { useTheme } from 'next-themes';
import { Tabs } from '~src/ui-components/Tabs';

interface ILatestActivityProps {
	latestPosts: {
		all?: IApiResponse<ILatestActivityPostsListingResponse>;
	} & ILatestActivityPosts;
	className?: string;
}

const Container = styled.div`
	th {
		/* color: #485F7D !important; */
		font-weight: 500 !important;
		font-size: 14px !important;
		line-height: 21px !important;
		white-space: nowrap;
		color: ${(props) => (props.theme == 'dark' ? '#909090' : '#485F7D')} !important;
		background-color: ${(props) => (props.theme == 'dark' ? '#0D0D0D' : '')} !important;
	}

	.ant-table-wrapper .ant-table-container::after {
		background-color: ${(props) => (props.theme == 'dark' ? '#0D0D0D' : 'none')} !important;
	}

	th.ant-table-cell {
		color: ${(props) => (props.theme == 'dark' ? '#909090' : '#485F7D')} !important;
		background-color: ${(props) => (props.theme == 'dark' ? '#0D0D0D' : '')} !important;
		font-weight: 500 !important;
		font-size: 14px !important;
		line-height: 21px !important;
		white-space: nowrap;
	}

	.ant-table-thead > tr > th {
		color: ${(props) => (props.theme == 'dark' ? '#909090' : '#485F7D')} !important;
		background-color: ${(props) => (props.theme == 'dark' ? '#0D0D0D' : '')} !important;
		font-weight: 500 !important;
		font-size: 14px !important;
		line-height: 21px !important;
		white-space: nowrap;
	}

	.ant-table-row {
		color: ${(props) => (props.theme == 'dark' ? 'white' : '#243A57')} !important;
		background-color: ${(props) => (props.theme == 'dark' ? '#0D0D0D' : '')} !important;
		font-size: 14px !important;
		font-weight: 400 !important;
	}
	.ant-table-row:hover > td {
		background-color: ${(props) => (props.theme == 'dark' ? '#595959' : '')} !important;
	}
	tr {
		color: ${(props) => (props.theme == 'dark' ? 'white' : '#243A57')} !important;
		background-color: ${(props) => (props.theme == 'dark' ? '#0D0D0D' : '')} !important;
		font-size: 14px !important;
		font-weight: 400 !important;
		cursor: pointer !important;
		white-space: nowrap;
	}
	.ant-table-wrapper .ant-table-cell-fix-left,
	.ant-table-wrapper .ant-table-cell-fix-right {
		background-color: ${(props) => (props.theme == 'dark' ? '#0D0D0D' : 'white')} !important;
	}

	.ant-table-wrapper .ant-table-thead > tr > th:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before,
	.ant-table-wrapper .ant-table-thead > tr > td:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before {
		background-color: ${(props) => (props.theme == 'dark' ? 'transparent' : 'white')} !important;
	}

	.ant-table-wrapper .ant-table-tbody > tr > th,
	.ant-table-wrapper .ant-table-tbody > tr > td {
		border-bottom: ${(props) => (props.theme == 'dark' ? '1px solid #323232' : '1px solid #E1E6EB')} !important;
	}
	.ant-table-wrapper .ant-table-thead > tr > th,
	.ant-table-wrapper .ant-table-thead > tr > td {
		border-bottom: ${(props) => (props.theme == 'dark' ? '1px solid #323232' : '1px solid #E1E6EB')} !important;
	}
`;

type TCapitalizeFn = (str: string, lower?: boolean) => string;
const capitalize: TCapitalizeFn = (str, lower = false) => (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, (match) => match.toUpperCase());

const getLabel = (key: 'all' | ProposalType): string => {
	if (key === ProposalType.COUNCIL_MOTIONS) {
		return 'Motions';
	} else if (key === ProposalType.DEMOCRACY_PROPOSALS) {
		return 'Proposals';
	} else if (key === ProposalType.TREASURY_PROPOSALS) {
		return 'Treasury Proposals';
	} else if (key === ProposalType.TECHNICAL_PIPS) {
		return 'Technical';
	} else if (key === ProposalType.UPGRADE_PIPS) {
		return 'Upgrade';
	} else if (key === ProposalType.COMMUNITY_PIPS) {
		return 'Community';
	}
	return capitalize(key);
};

const LatestActivity: FC<ILatestActivityProps> = ({ className, latestPosts }) => {
	const [currentTab, setCurrentTab] = useState('all');
	const { resolvedTheme: theme } = useTheme();
	const tabItems = (Object.entries(latestPosts) as [key: 'all' | ProposalType, value: IApiResponse<ILatestActivityPostsListingResponse>][]).map(([key, value]) => {
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
			key: key === ProposalType.REFERENDUMS ? 'referenda' : label.toLowerCase().split(' ').join('-'),
			label: (
				<CountBadgePill
					label={label}
					count={value?.data?.count}
				/>
			)
		};
	});

	return (
		<>
			<Container
				className={`${className} rounded-xxl bg-white p-0 drop-shadow-md dark:bg-section-dark-overlay lg:p-6`}
				theme={theme}
			>
				<div className='flex items-center justify-between pl-1 pr-4'>
					<h2 className='mx-3.5 mb-6 mt-6 text-xl font-medium leading-8 text-bodyBlue dark:text-blue-dark-high lg:mx-0 lg:mt-0'>Latest Activity</h2>
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
					className='ant-tabs-tab-bg-white text-sm font-medium text-bodyBlue dark:bg-section-dark-overlay dark:text-blue-dark-high  md:px-2'
					type='card'
					items={tabItems}
					onChange={(key: any) => setCurrentTab(key)}
				/>
			</Container>
		</>
	);
};

export default LatestActivity;
