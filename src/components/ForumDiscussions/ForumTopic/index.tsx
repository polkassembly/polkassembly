// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import Image from 'next/image';
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
import getCategoryName from '../utils/getCategoryName';

interface ForumTopicProps {
	data: any;
}

const ForumTopicContainer = ({ data }: ForumTopicProps) => {
	const {
		fancy_title,
		title,
		created_at,
		like_count,
		id,
		participant_count,
		category_id,
		post_stream: { posts }
	} = data;

	const { name: cName, username: cUsername, avatar_template: cImg, cooked: description, display_username: dUsername, topic_id, topic_slug } = posts[0];
	const { resolvedTheme: theme } = useTheme();
	const date = new Date(created_at);
	const allComments = CommentMapping(posts);

	const tabItems: any[] = [
		{
			children: (
				<ForumDescription
					description={description}
					like_count={like_count}
					username={dUsername}
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
			<div className='my-6 w-full rounded-xxl bg-white p-3 drop-shadow-md dark:bg-section-dark-overlay md:p-4 lg:w-[67%] lg:p-6 '>
				<div className='flex items-center space-x-1'>
					<h2 className={'mb-1 text-lg font-medium leading-7 text-bodyBlue dark:text-blue-dark-high sm:mb-3'}>
						#{id} {fancy_title ? fancy_title : title}
					</h2>
					<Link
						href={`https://forum.polkadot.network/t/${topic_slug}/${topic_id}`}
						target='_blank'
					>
						<Image
							src='/assets/icons/redirect.svg'
							alt='redirection-icon'
							width={16}
							height={16}
							className='-mt-3'
						/>
					</Link>
				</div>
				<div
					className={`mb-3 inline-block rounded-[4px] sm:hidden ${
						[9, 25, 27].includes(category_id)
							? 'bg-[#FFEDF2] text-[#CD1F59] dark:bg-[#CD1F59] dark:text-[#FFEDF2]'
							: 'bg-[#FFF4EB] text-[#AC6A30] dark:bg-[#AC6A30] dark:text-[#FFF4EB]'
					}  px-2 py-1 text-[12px] font-medium `}
				>
					{getCategoryName(category_id)}
				</div>
				<div className='flex items-center gap-1'>
					<div className='flex items-center gap-1'>
						<div className='rounded-full'>
							<ImageIcon
								src={formatAvatarUrl(cImg, '14')}
								alt='user image'
								imgClassName='rounded-full'
							/>
						</div>
						<div className={'flex max-w-full flex-shrink-0 flex-wrap items-center gap-1'}>
							<span className='text-xs font-medium text-blue-light-medium dark:text-blue-dark-medium'>{dUsername ? dUsername : cUsername ? cUsername : cName}</span>
							<div className='hidden text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium sm:flex'>in</div>
							<div
								className={` hidden rounded-[4px] ${
									[9, 25, 27].includes(category_id)
										? 'bg-[#FFEDF2] text-[#CD1F59] dark:bg-[#CD1F59] dark:text-[#FFEDF2]'
										: 'bg-[#FFF4EB] text-[#AC6A30] dark:bg-[#AC6A30] dark:text-[#FFF4EB]'
								}  px-2 py-1 text-[12px] font-medium sm:flex`}
							>
								{getCategoryName(category_id)}
							</div>
						</div>
					</div>
					<Divider
						type='vertical'
						className='border-l-1 border-lightBlue dark:border-icon-dark-inactive md:inline-block'
					/>
					{created_at && (
						<>
							<div className='items-center text-xs font-normal text-lightBlue dark:text-icon-dark-inactive'>
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
					className='ant-tabs-tab-bg-white mb-2.5 mt-5 font-medium text-bodyBlue dark:bg-section-dark-overlay dark:text-blue-dark-high'
					items={tabItems}
				/>
				<Divider className='border-l-1 border-[#D2D8E0B2] dark:border-separatorDark md:inline-block' />
				<span className='text-lg font-medium text-bodyBlue dark:font-normal dark:text-blue-dark-high'>
					{participant_count || 0}
					<span className='ml-1'>{participant_count > 1 ? 'Comments' : 'Comment'}</span>
				</span>
				<ForumComments comments={allComments} />
			</div>
		</div>
	);
};

export default ForumTopicContainer;
