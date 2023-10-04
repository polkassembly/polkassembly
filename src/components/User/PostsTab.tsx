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
<<<<<<< HEAD
    posts: {
        [key: string]: IUserPost[];
    } | IUserPost[];
    className?: string;
	theme?: string;
=======
	posts:
		| {
				[key: string]: IUserPost[];
		  }
		| IUserPost[];
	className?: string;
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
}

const PostsTab: FC<IPostsTabProps> = (props) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { posts, className, theme } = props;
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
<<<<<<< HEAD
		<div className={`${className} bg-white dark:bg-section-dark-overlay h-full`}>
			{
				Array.isArray(posts)?
					<PostTab posts={posts} />
					: (
						<Tabs
							className='ant-tabs-tab-bg-white dark:bg-section-dark-overlay text-navBlue font-normal dark:text-blue-dark-medium text-sm borderRemove'
							tabPosition='left'
							type="card"
							items={tabItems as any}
						/>
					)
			}
=======
		<div className={`${className} h-full bg-white`}>
			{Array.isArray(posts) ? (
				<PostTab posts={posts} />
			) : (
				<Tabs
					className='ant-tabs-tab-bg-white borderRemove text-sm font-normal text-navBlue'
					tabPosition='left'
					type='card'
					items={tabItems as any}
				/>
			)}
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
		</div>
	);
};

export default styled(PostsTab)`
<<<<<<< HEAD
    .borderRemove .ant-tabs-tab {
        border: none !important;
    }
    .borderRemove .ant-tabs-nav-list {
        background: ${props => props.theme === 'dark' ? 'transparent' : 'white'} !important;
    }
	.borderRemove .ant-tabs-nav {
		min-width: 135px;
	}
	.ant-tabs-card >.ant-tabs-nav .ant-tabs-tab-active, .ant-tabs-card >div>.ant-tabs-nav .ant-tabs-tab-active{
		background: ${props => props.theme === 'dark' ? 'none' : 'white'} !important;
	}
`;
=======
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
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
