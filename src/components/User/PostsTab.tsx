// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Tabs } from 'antd';
import { IUserPost } from 'pages/api/v1/listing/user-posts';
import React, { FC } from 'react';
import styled from 'styled-components';
import CountBadgePill from '~src/ui-components/CountBadgePill';
import PostTab from './PostTab';

interface IPostsTabProps {
	posts:
		| {
				[key: string]: IUserPost[];
		  }
		| IUserPost[];
	className?: string;
}

const PostsTab: FC<IPostsTabProps> = (props) => {
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
						),
					};
				});
	return (
		<div className={`${className} bg-white h-full`}>
			{Array.isArray(posts) ? (
				<PostTab posts={posts} />
			) : (
				<Tabs
					className="ant-tabs-tab-bg-white text-navBlue font-normal text-sm borderRemove"
					tabPosition="left"
					type="card"
					items={tabItems as any}
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
