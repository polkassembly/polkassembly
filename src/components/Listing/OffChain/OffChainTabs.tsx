// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { TabsProps } from 'antd';
import { useTheme } from 'next-themes';
import React, { useState } from 'react';
import { OffChainProposalType } from '~src/global/proposalType';
import { Tabs } from '~src/ui-components/Tabs';
import OffChainPostsContainer from './OffChainPostsContainer';
import ForumDiscussions from '~src/components/ForumDiscussions';
import { styled } from 'styled-components';
// import SortByDropdownComponent from '~src/ui-components/SortByDropdown';
// import FilterByTags from '~src/ui-components/FilterByTags';
// import { sortValues } from '~src/global/sortOptions';

interface IOffChainTabs {
	className?: string;
	posts: any[];
	count: number;
	defaultPage?: number;
}

const OffChainTabs = ({ className, posts, count, defaultPage }: IOffChainTabs) => {
	const { resolvedTheme: theme } = useTheme();
	// const [sortBy, setSortBy] = useState<string>(sortValues.COMMENTED);
	const [activeTab, setActiveTab] = useState('PADiscussions');

	const tabItems: TabsProps['items'] = [
		{
			children: (
				<>
					<OffChainPostsContainer
						proposalType={OffChainProposalType.DISCUSSIONS}
						posts={posts}
						defaultPage={defaultPage}
						count={count}
						className=''
						// sortBy={sortBy}
						// setSortBy={setSortBy}
					/>
				</>
			),
			key: 'PADiscussions',
			label: <span className='px-1.5'>Polkassembly Discussions</span>
		},
		{
			children: (
				<>
					<ForumDiscussions />
				</>
			),
			key: 'Forum',
			label: (
				<div className='flex items-center gap-2'>
					<span className='aspect-square w-2 rounded-full bg-pink_primary'></span>Forum Discussions
				</div>
			)
		}
		// {
		// key: 'Filter',
		// : (
		// <div className='flex items-center justify-between py-3 align-middle md:py-5'>
		// <FilterByTags className='mr-2' />
		// <SortByDropdownComponent
		// sortBy={sortBy}
		// setSortBy={setSortBy}
		// />
		// </div>
		// }
	];
	const onTabClick = (key: string) => {
		if (key === 'Filter') return;
		setActiveTab(key);
	};
	return (
		<div className={`${className} mt-[36px] rounded-xxl bg-white px-4 drop-shadow-md dark:bg-section-dark-overlay xs:py-4 sm:py-8`}>
			<Tabs
				theme={theme}
				activeKey={activeTab}
				type='card'
				className=''
				items={tabItems}
				onTabClick={onTabClick}
			/>
		</div>
	);
};

export default styled(OffChainTabs)`
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
