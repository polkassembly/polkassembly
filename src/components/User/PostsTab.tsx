// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import styled from 'styled-components';
import CountBadgePill from '~src/ui-components/CountBadgePill';
import PostTab from './PostTab';
import { useTheme } from 'next-themes';
import { Tabs } from '~src/ui-components/Tabs';
import { Empty } from 'antd';
import { IUserPost } from '~src/types';

interface IPostsTabProps {
	posts:
		| {
				[key: string]: IUserPost[];
		  }
		| IUserPost[];
	className?: string;
}

const PostsTab: FC<IPostsTabProps> = (props) => {
	const { resolvedTheme: theme } = useTheme();
	const { posts, className } = props;
	if (!posts) return null;
	const tabItems = Array.isArray(posts)
		? []
		: Object.entries(posts)
				.sort((a, b) => b?.[1].length - a?.[1]?.length)
				.map(([key, value]) => {
					return {
						children: <PostTab posts={value} />,
						key: key,
						label: (
							<CountBadgePill
								label={key.split('_').join(' ')}
								count={value.length}
							/>
						)
					};
				});
	return (
		<div className={`${className} h-full bg-white dark:bg-section-dark-overlay`}>
			{Array.isArray(posts) ? (
				<PostTab posts={posts} />
			) : (
				<Tabs
					theme={theme}
					className='ant-tabs-tab-bg-white borderRemove text-sm font-normal text-navBlue'
					tabPosition='left'
					type='card'
					items={tabItems as any}
					EmptyState={<Empty />}
				/>
			)}
		</div>
	);
};

export default styled(PostsTab)`
	.borderRemove .ant-tabs-tab {
		border: none !important;
	}
	.borderRemove .ant-tabs-nav-list {
		background: white;
	}
	.borderRemove .ant-tabs-nav {
		min-width: 135px;
	}
`;
