// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import Link from 'next/link';
import { LeftOutlined } from '@ant-design/icons';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';
import { ClockCircleOutlined } from '@ant-design/icons';
import ImageIcon from '~src/ui-components/ImageIcon';
import { Divider } from 'antd';
import { Tabs } from '~src/ui-components/Tabs';
import { useTheme } from 'next-themes';
import ForumDescription from './forumDescription';
import ForumComments from './ForumComments';
import CommentMapping from '../utils/CommentsMapping';
import formatAvatarUrl from '../utils/FormatAvatarUrl';

interface ForumTopicProps {
	data: any;
}

const ForumTopicContainer = ({ data }: ForumTopicProps) => {
	console.log(data);
	const {
		fancy_title,
		title,
		created_at,
		like_count,
		id,
		reply_count,
		// tags,
		post_stream: { posts }
	} = data;
	const { name: cName, username: cUsername, avatar_template: cImg, cooked: description, display_username: dUsername } = posts[0];
	const { resolvedTheme: theme } = useTheme();
	const date = new Date(created_at);
	const allComments = CommentMapping(posts);

	const tabItems: any[] = [
		{
			children: (
				<ForumDescription
					description={description}
					like_count={like_count}
				/>
			),
			key: 'description',
			label: 'Description'
		}
	];

	return (
		<div>
			<Link
				className='inline-flex items-center text-sidebarBlue hover:text-pink_primary dark:text-white'
				href={'/forum'}
			>
				<div className='flex items-center'>
					<LeftOutlined className='mr-2 text-xs' />
					<span className='text-sm font-medium'>Back to Forum </span>
				</div>
			</Link>
			<div className='my-6 w-[65%] rounded-xxl bg-white p-3 drop-shadow-md dark:bg-section-dark-overlay md:p-4 lg:p-6 '>
				<h2 className={'mb-3 text-lg font-medium leading-7 text-bodyBlue dark:text-blue-dark-high'}>
					#{id} {fancy_title ? fancy_title : title}
				</h2>
				<div className='flex items-center gap-1'>
					<div className='flex items-center gap-1'>
						<div className='rounded-full'>
							<ImageIcon
								src={formatAvatarUrl(cImg, '14')}
								alt='user image'
								imgClassName='rounded-full'
							/>
						</div>
						<span className='text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium'>{dUsername ? dUsername : cUsername ? cUsername : cName}</span>
						<span className='text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium'>in</span>
					</div>
					<Divider
						type='vertical'
						className='border-l-1 border-lightBlue dark:border-icon-dark-inactive md:inline-block'
					/>
					{created_at && (
						<>
							<div className='hidden  items-center text-xs font-normal text-lightBlue dark:text-icon-dark-inactive sm:flex'>
								<ClockCircleOutlined className='mr-1' /> <span></span>
								{getRelativeCreatedAt(date)}
							</div>
						</>
					)}
				</div>
				<Tabs
					theme={theme}
					type='card'
					isPostTab={true}
					className='ant-tabs-tab-bg-white my-5 font-medium text-bodyBlue dark:bg-section-dark-overlay dark:text-blue-dark-high'
					items={tabItems}
				/>
				<Divider className='border-l-1 border-[#D2D8E0B2] dark:border-separatorDark md:inline-block' />
				<span className='text-lg font-medium text-bodyBlue dark:font-normal dark:text-blue-dark-high'>
					{reply_count || 0}
					<span className='ml-1'>Comments</span>
				</span>
				<ForumComments comments={allComments} />
			</div>
		</div>
	);
};

export default ForumTopicContainer;
