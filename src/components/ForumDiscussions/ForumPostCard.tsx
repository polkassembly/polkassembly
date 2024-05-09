// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useEffect, useState } from 'react';
import { Topic } from './types';
import { Divider } from 'antd';
import { ClockCircleOutlined, LikeOutlined, EyeFilled } from '@ant-design/icons';
import { CommentsIcon } from '~src/ui-components/CustomIcons';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';
import Link from 'next/link';
import getCategoryName from './utils/getCategoryName';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import ImageIcon from '~src/ui-components/ImageIcon';
import formatAvatarUrl from './utils/FormatAvatarUrl';

interface ForumPostCardProps {
	topics: Topic[];
}

const ForumPostCard: FC<ForumPostCardProps> = ({ topics }) => {
	// const [tagsModal, setTagsModal] = useState<boolean>(false);
	const [usernames, setUsernames] = useState<{ [key: number]: string }>({});
	const [userImg, setUserImg] = useState<{ [key: number]: string }>({});

	const fetchUsernames = async () => {
		const userMap: { [key: number]: string } = {};
		const userImgMap: { [key: number]: string } = {};
		for (const topic of topics) {
			try {
				const { data } = await nextApiClientFetch<any>(`/api/v1/discourse/getTopicById?id=${topic.id}`);
				const { posts } = data?.data?.post_stream || {};

				if (posts?.length > 0) {
					const username = posts[0].username || posts[0].name || 'Unknown';
					userMap[topic.id] = username;

					const avatarTemplate = posts[0].avatar_template || '/path/to/default/avatar.png';
					userImgMap[topic.id] = avatarTemplate;
				} else {
					console.log(`No posts found for topic ID ${topic.id}`);
					userMap[topic.id] = 'Unknown';
					userImgMap[topic.id] = '/path/to/default/avatar.png';
				}
			} catch (error) {
				console.error(`Failed to fetch data for topic ID ${topic.id}:`, error);
				userMap[topic.id] = 'Failed to load';
				userImgMap[topic.id] = '/path/to/default/avatar.png';
			}
		}
		setUsernames(userMap);
		setUserImg(userImgMap);
	};

	useEffect(() => {
		if (topics.length > 0) {
			fetchUsernames();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [topics]);

	return (
		<div className='mt-6'>
			{topics.map((topic, index) => {
				const { title, id, created_at, reply_count, like_count, tags, views, slug, category_id } = topic;
				const date = new Date(created_at);
				const username = usernames[id] || 'Loading...';
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
									<span className='text-sm font-medium text-[#334D6E] dark:text-blue-dark-high'>{title}</span>
									<div className='flex-col items-start text-xs font-medium text-bodyBlue dark:text-blue-dark-high xs:hidden sm:flex lg:flex-row lg:items-center'>
										<div className='flex items-center gap-x-2'>
											<div className='items-center justify-center gap-x-1.5 xs:hidden sm:flex'>
												<LikeOutlined className='text-lightBlue dark:text-icon-dark-inactive' />
												<span className='text-lightBlue dark:text-blue-dark-medium'>{like_count}</span>
											</div>

											<div className='items-center xs:hidden sm:flex'>
												<CommentsIcon className='mr-1 text-lightBlue dark:text-icon-dark-inactive' />
												<span className=' text-lightBlue dark:text-blue-dark-medium'>{reply_count}</span>
											</div>
											<div className='items-center xs:hidden sm:flex'>
												<EyeFilled className='mr-1 text-lightBlue dark:text-icon-dark-inactive' />
												<span className=' text-lightBlue dark:text-blue-dark-medium'>{views}</span>
											</div>
											<Divider
												type='vertical'
												className='border-l-1 border-lightBlue dark:border-icon-dark-inactive max-sm:hidden sm:mt-1'
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
														className='border-l-1 border-lightBlue dark:border-icon-dark-inactive max-sm:hidden sm:mt-1'
													/>
													<div
														className={`rounded-[4px] ${
															[9, 25, 27].includes(category_id)
																? 'bg-[#FFEDF2] text-[#CD1F59] dark:bg-[#0B353C] dark:text-[#93C9D1]'
																: 'bg-[#FFF4EB] text-[#AC6A30] dark:bg-[#302234] dark:text-[#CCAED4]'
														}  px-2 py-1 text-[10px] font-medium `}
													>
														{getCategoryName(category_id)}
													</div>
												</>
											)}

											{tags && tags.length > 0 && (
												<>
													<Divider
														type='vertical'
														className='border-l-1 border-lightBlue dark:border-icon-dark-inactive max-sm:hidden sm:mt-1'
													/>
													{tags?.slice(0, 2).map((tag, index) => (
														<div
															key={index}
															style={{ fontSize: '10px' }}
															className='rounded-xl border-[1px] border-solid border-[#D2D8E0] px-[14px] py-[4px] font-medium text-lightBlue dark:border-[#3B444F] dark:border-separatorDark dark:text-blue-dark-medium'
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
											}  px-2 py-1 text-[10px] font-medium `}
										>
											{getCategoryName(category_id)}
										</div>
									)}
									<div className='max-xs-hidden m-2.5 text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>
										#{id} {title}
									</div>
									<div className='flex-col items-start text-xs font-medium text-bodyBlue dark:text-blue-dark-high xs:ml-2 xs:mt-1 xs:flex xs:gap-0 sm:ml-0 sm:hidden sm:gap-2.5 lg:flex-row lg:items-center'>
										<div className='items-center xs:flex xs:justify-start sm:hidden'>
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
															className='rounded-xl border-[1px] border-solid border-[#D2D8E0] px-[14px] py-[4px] font-medium text-lightBlue dark:border-[#3B444F] dark:border-separatorDark dark:text-blue-dark-high'
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
		</div>
	);
};

export default ForumPostCard;
