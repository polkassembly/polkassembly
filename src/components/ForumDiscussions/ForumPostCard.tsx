// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useEffect, useState } from 'react';
import { IForumTopic } from './types';
import { Divider } from 'antd';
import { ClockCircleOutlined, LikeOutlined, EyeFilled } from '@ant-design/icons';
import { ForumCommentsIcon } from '~src/ui-components/CustomIcons';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';
import Link from 'next/link';
import getCategoryName from './utils/getCategoryName';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import ImageIcon from '~src/ui-components/ImageIcon';
import formatAvatarUrl from './utils/FormatAvatarUrl';
import SkeletonAvatar from '~src/basic-components/Skeleton/SkeletonAvatar';
import SkeletonButton from '~src/basic-components/Skeleton/SkeletonButton';
import { Pagination } from '~src/ui-components/Pagination';
import { useTheme } from 'next-themes';
import { LISTING_LIMIT } from '~src/global/listingLimit';

interface ForumPostCardProps {
	topics: IForumTopic[];
}

function formatCount(count: number) {
	if (count >= 10000) {
		return (count / 1000).toFixed(1) + 'k';
	}
	return count.toString();
}

const ForumPostCard: FC<ForumPostCardProps> = ({ topics }) => {
	const { resolvedTheme: theme } = useTheme();
	const [usernames, setUsernames] = useState<{ [key: number]: string }>({});
	const [userImg, setUserImg] = useState<{ [key: number]: string }>({});
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [currentPage, setCurrentPage] = useState<number>(1);

	const fetchUsernames = async (topicsToFetch: IForumTopic[]) => {
		setIsLoading(true);
		const userMap: { [key: number]: string } = {};
		const userImgMap: { [key: number]: string } = {};

		const fetchPromises = topicsToFetch.map(async (topic) => {
			try {
				const { data } = await nextApiClientFetch<any>(`/api/v1/discourse/getTopicById?id=${topic.id}`);
				const { posts } = data?.data?.post_stream || {};
				const username = posts?.length > 0 ? posts[0].username || posts[0].name : 'Unknown';
				const avatarTemplate = posts?.length > 0 ? posts[0].avatar_template : '/path/to/default/avatar.png';
				userMap[topic.id] = username;
				userImgMap[topic.id] = formatAvatarUrl(avatarTemplate, '22');
			} catch (error) {
				console.error(`Failed to fetch data for topic ID ${topic.id}:`, error);
				userMap[topic.id] = 'Failed to load';
				userImgMap[topic.id] = '/path/to/default/avatar.png';
			}
		});

		await Promise.allSettled(fetchPromises);

		setUsernames(userMap);
		setUserImg(userImgMap);
		setIsLoading(false);
	};

	useEffect(() => {
		const endIndex = currentPage * LISTING_LIMIT;
		const startIndex = endIndex - LISTING_LIMIT;
		const currentTopics = topics.slice(startIndex, endIndex);
		fetchUsernames(currentTopics);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage]);

	return (
		<div className='mt-4'>
			{topics.slice((currentPage - 1) * LISTING_LIMIT, currentPage * LISTING_LIMIT).map((topic, index) => {
				const { title, id, created_at, reply_count, like_count, tags, views, slug, category_id } = topic;
				const date = new Date(created_at);
				const username = usernames[id];
				const user_avatar = userImg[id];
				return (
					<div
						key={topic.id}
						className={`${(index + 1) % 2 !== 0 ? 'bg-[#FBFBFC] dark:bg-[#161616]' : 'dark:bg-section-dark-overlay'}`}
					>
						<Link href={`/forum/t/${slug}/${id}`}>
							<div className='min-h-[100px] cursor-pointer border-2 border-[#DCDFE350] p-3 transition-all duration-200 hover:border-pink_primary hover:shadow-xl dark:border-[1px] dark:border-separatorDark xs:hidden sm:flex md:p-4'>
								<span className='flex-none text-center font-medium text-bodyBlue dark:text-blue-dark-high sm:mt-2 sm:w-[120px]'>#{id}</span>

								<div className='flex-1 flex-col gap-1 sm:mt-1 sm:flex sm:justify-between'>
									{isLoading ? (
										<div className='flex gap-2'>
											<SkeletonAvatar
												active
												size='small'
											/>
											<SkeletonButton
												active
												size='small'
											/>
										</div>
									) : (
										<div className='mb-1 flex items-center gap-2'>
											{user_avatar && (
												<ImageIcon
													src={formatAvatarUrl(user_avatar, '22')}
													alt='user image'
													imgClassName='rounded-full w-[18px]'
												/>
											)}
											<span className='text-xs font-medium text-blue-light-high dark:text-blue-dark-high'>{username}</span>
										</div>
									)}
									<span className='text-sm font-medium text-[#334D6E] dark:text-blue-dark-high'>{title}</span>
									<div className='flex-col items-start text-xs font-medium text-bodyBlue dark:text-blue-dark-high xs:hidden sm:flex lg:flex-row lg:items-center'>
										<div className='mr-2 flex items-center gap-x-3 p-1'>
											<div className='items-center justify-center gap-x-1.5 xs:hidden sm:flex'>
												<LikeOutlined className='-mt-[2px] text-[13px] text-lightBlue dark:text-icon-dark-inactive' />
												<span className='text-lightBlue dark:text-blue-dark-medium'>{like_count}</span>
											</div>

											<div className='items-center xs:hidden sm:flex'>
												<ForumCommentsIcon className='mr-1 text-[13px] text-lightBlue dark:text-icon-dark-inactive' />
												<span className=' text-lightBlue dark:text-blue-dark-medium'>{reply_count}</span>
											</div>
											<div className='items-center xs:hidden sm:flex'>
												<EyeFilled className='mr-1 text-[13px] text-lightBlue dark:text-icon-dark-inactive' />
												<span className=' text-lightBlue dark:text-blue-dark-medium'>{formatCount(views)}</span>
											</div>
										</div>
										<div className='flex items-center gap-x-2'>
											<Divider
												type='vertical'
												className='border-l-1 border-lightBlue dark:border-icon-dark-inactive max-sm:hidden '
											/>
											{created_at && (
												<>
													<div className='hidden items-center text-lightBlue dark:text-icon-dark-inactive sm:flex'>
														<ClockCircleOutlined className='mr-1' /> {getRelativeCreatedAt(date)}
													</div>
												</>
											)}
											{category_id && (
												<>
													<Divider
														type='vertical'
														className='border-l-1 border-lightBlue dark:border-icon-dark-inactive max-sm:hidden '
													/>
													<div
														className={`rounded-[4px] ${
															[9, 25, 27].includes(category_id)
																? 'bg-[#FFEDF2] text-[#CD1F59] dark:bg-[#0B353C] dark:text-[#93C9D1]'
																: 'bg-[#FFF4EB] text-[#AC6A30] dark:bg-[#302234] dark:text-[#CCAED4]'
														}  px-2 py-1 text-[12px] font-medium `}
													>
														{getCategoryName(category_id)}
													</div>
												</>
											)}

											{tags && tags.length > 0 && (
												<>
													<Divider
														type='vertical'
														className='border-l-1 border-lightBlue dark:border-icon-dark-inactive max-sm:hidden '
													/>
													{tags?.slice(0, 2).map((tag, index) => (
														<div
															key={index}
															style={{ fontSize: '10px' }}
															className='rounded-xl border-[1px] border-solid border-section-light-container px-[14px] py-[4px] font-medium text-lightBlue dark:border-[#3B444F] dark:border-separatorDark dark:text-blue-dark-medium'
														>
															{tag}
														</div>
													))}
													{tags.length > 2 && (
														<span
															className='text-bodyBlue dark:text-blue-dark-high'
															style={{ background: '#D2D8E050', borderRadius: '20px', fontSize: '10px', padding: '4px 8px' }}
															onClick={(e) => {
																e.stopPropagation();
																e.preventDefault();
																// setTagsModal(true);
															}}
														>
															+{tags.length - 2}
														</span>
													)}
												</>
											)}

											{/* {topic ? (
									<div className='flex items-center sm:-mt-1'>
										<Divider
											type='vertical'
											className='border-l-1 border-lightBlue dark:border-icon-dark-inactive max-sm:hidden sm:mt-1'
										/>
										<TopicTag
											theme={theme as any}
											className='sm:mx-2 sm:mt-0'
											topic={topic}
										/>
									</div>
								) : null} */}
										</div>
									</div>
								</div>
							</div>
							<div
								className={
									'h-auto min-h-[150px] border-2 border-grey_light transition-all duration-200 hover:border-pink_primary hover:shadow-xl dark:border-[1px] dark:border-separatorDark xs:flex xs:p-2 sm:hidden md:p-4'
								}
							>
								<div className='flex-1 flex-col xs:mt-1 xs:flex sm:hidden'>
									{category_id && (
										<div
											className={`flex rounded-[4px] justify-start${
												[9, 25, 27].includes(category_id)
													? 'bg-[#FFEDF2] text-[#CD1F59] dark:bg-[#0B353C] dark:text-[#93C9D1]'
													: 'bg-[#FFF4EB] text-[#AC6A30] dark:bg-[#302234] dark:text-[#CCAED4]'
											}  px-2 py-1 text-[12px] font-medium `}
										>
											{getCategoryName(category_id)}
										</div>
									)}
									<div className='max-xs-hidden m-2.5 text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>
										#{id} {title}
									</div>
									<div className='flex-col items-start text-xs font-medium text-bodyBlue dark:text-blue-dark-high xs:ml-2 xs:mt-1 xs:flex xs:gap-0 sm:ml-0 sm:hidden sm:gap-2.5 lg:flex-row lg:items-center'>
										<div className='items-center xs:flex xs:justify-start sm:hidden'>
											{isLoading ? (
												<div className='flex gap-2'>
													<SkeletonAvatar
														active
														size='small'
													/>
													<SkeletonButton
														active
														size='small'
													/>
												</div>
											) : (
												<div className='mb-1 flex items-center gap-2'>
													{user_avatar && (
														<ImageIcon
															src={formatAvatarUrl(user_avatar, '22')}
															alt='user image'
															imgClassName='rounded-full w-[18px]'
														/>
													)}
													<span className='text-xs font-medium text-blue-light-high dark:text-blue-dark-high'>{username}</span>
												</div>
											)}
											<Divider
												type='vertical'
												className='border-l-1 border-lightBlue dark:border-icon-dark-inactive max-lg:hidden xs:inline-block sm:mt-0.5'
											/>
											{created_at && (
												<>
													<div className='mt-0 items-center text-[10.5px] xs:-mt-0.5 xs:flex xs:text-lightBlue xs:dark:text-icon-dark-inactive sm:text-sm lg:flex'>
														<ClockCircleOutlined className='mr-1 mt-0' /> {getRelativeCreatedAt(date)}
													</div>
												</>
											)}
										</div>

										<div className='items-center justify-between xs:mt-3.5 xs:flex xs:gap-x-2'>
											{tags && tags.length > 0 && (
												<Divider
													type='vertical'
													className='border-l-1 border-lightBlue dark:border-icon-dark-inactive max-lg:hidden'
												/>
											)}
											{tags && tags.length > 0 && (
												<>
													{tags?.slice(0, 2).map((tag, index) => (
														<div
															key={index}
															style={{ fontSize: '10px' }}
															className='rounded-xl border-[1px] border-solid border-section-light-container px-[14px] py-[4px] font-medium text-lightBlue dark:border-[#3B444F] dark:border-separatorDark dark:text-blue-dark-high'
														>
															{tag}
														</div>
													))}
													{tags.length > 2 && (
														<span
															className='text-bodyBlue dark:text-blue-dark-high'
															style={{ background: '#D2D8E050', borderRadius: '20px', fontSize: '10px', padding: '4px 8px' }}
															// onClick={(e) => {
															// e.stopPropagation();
															// e.preventDefault();
															// setTagsModal(true);
															// }}
														>
															+{tags.length - 2}
														</span>
													)}
												</>
											)}
										</div>
									</div>
								</div>
							</div>
						</Link>
					</div>
				);
			})}
			{topics.length > 0 && (
				<div className='m-6 flex justify-end'>
					<Pagination
						theme={theme}
						size='large'
						defaultCurrent={1}
						current={currentPage}
						onChange={setCurrentPage}
						total={topics.length}
						pageSize={LISTING_LIMIT}
						showSizeChanger={false}
						responsive={true}
					/>
				</div>
			)}
		</div>
	);
};

export default ForumPostCard;
