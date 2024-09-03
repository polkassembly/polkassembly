// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { TabsProps } from 'antd';
import { useTheme } from 'next-themes';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { OffChainProposalType } from '~src/global/proposalType';
import { Tabs } from '~src/ui-components/Tabs';
import OffChainPostsContainer from './OffChainPostsContainer';
import { styled } from 'styled-components';

interface IOffChainTabs {
	className?: string;
	posts: any[];
	count: number;
	defaultPage?: number;
}

const OffChainTabs = ({ className, posts, count, defaultPage }: IOffChainTabs) => {
	const { resolvedTheme: theme } = useTheme();
	const router = useRouter();
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
					/>
				</>
			),
			key: 'PADiscussions',
			label: <span className='px-1.5'>Polkassembly</span>
		},
		{
			children: <></>,
			key: 'Forum',
			label: <div className='flex items-center gap-2'>Forum</div>
		}
	];
	const onTabClick = (key: string) => {
		if (key === 'Forum') {
			router.push('/forum');
		} else {
			setActiveTab(key);
		}
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
