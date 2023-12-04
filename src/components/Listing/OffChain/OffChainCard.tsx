// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ClockCircleOutlined, DislikeOutlined, LikeOutlined } from '@ant-design/icons';
import { Divider, Tooltip } from 'antd';
import React, { FC, useState } from 'react';
import getRelativeCreatedAt from 'src/util/getRelativeCreatedAt';
import { CommentsIcon, WarningMessageIcon } from '~src/ui-components/CustomIcons';
import OnchainCreationLabel from '~src/ui-components/OnchainCreationLabel';
import { getFormattedLike } from '~src/util/getFormattedLike';
import TopicTag from '~src/ui-components/TopicTag';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import TagsModal from '~src/ui-components/TagsModal';

export interface IDiscussionProps {
	created_at: Date;
	address: string;
	commentsCount?: number;
	title: string;
	username: string;
	topic: string;
	postReactionCount: {
		'👍': number;
		'👎': number;
	};
	post_id: string;
	tags: string[] | [];
	spam_users_count?: number;
	className?: string;
}

const DiscussionCard: FC<IDiscussionProps> = (props) => {
	const { created_at, commentsCount, address, title, username, topic, postReactionCount, post_id, tags, spam_users_count, className } = props;
	const currentUser = useUserDetailsSelector();
	const ownPost = currentUser.username === username;
	const relativeCreatedAt = getRelativeCreatedAt(created_at);
	const [tagsModal, setTagsModal] = useState<boolean>(false);
	const { resolvedTheme: theme } = useTheme();

	return (
		<>
			<div
				className={`${
					ownPost && 'border-l-4 border-l-pink_primary'
				} min-h-[120px] border-2 border-[#DCDFE350] p-3 transition-all duration-200 hover:border-pink_primary hover:shadow-xl dark:border-[1px] dark:border-separatorDark xs:hidden sm:flex md:p-4 ${className}`}
			>
				<span className='flex-none text-center font-medium text-bodyBlue dark:text-blue-dark-high sm:mt-2 sm:w-[120px]'>#{post_id}</span>
				<div className='flex-1 flex-col sm:mt-[6px] sm:flex sm:justify-between'>
					<OnchainCreationLabel
						address={address}
						topic={topic}
						username={username}
						truncateUsername={false}
					/>
					<div className='hidden sm:mb-1 sm:mt-2 sm:flex sm:flex-row sm:items-start sm:justify-between'>
						<div className='mt-3 lg:mt-1'>
							<h1 className='flex text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>
								{title}
								{spam_users_count && typeof spam_users_count === 'number' && spam_users_count > 0 ? (
									<div className='ml-5 hidden items-center justify-center lg:flex'>
										<Tooltip
											color='#E5007A'
											title='This post could be a spam.'
										>
											<WarningMessageIcon className='text-xl text-[#FFA012]' />
										</Tooltip>
									</div>
								) : null}
							</h1>
						</div>
					</div>
					<div className='flex-col items-start text-xs font-medium text-bodyBlue dark:text-blue-dark-high xs:hidden sm:flex lg:flex-row lg:items-center'>
						<div className='flex items-center gap-x-2'>
							<div className='items-center justify-center gap-x-1.5 xs:hidden sm:flex'>
								<LikeOutlined className='text-lightBlue dark:text-icon-dark-inactive' />
								<span className='text-lightBlue dark:text-blue-dark-medium'>{getFormattedLike(postReactionCount['👍'])}</span>
							</div>

							<div className='items-center justify-center gap-x-1.5 xs:hidden sm:flex'>
								<DislikeOutlined className='text-lightBlue dark:text-icon-dark-inactive' />
								<span className='text-lightBlue dark:text-blue-dark-medium'>{getFormattedLike(postReactionCount['👎'])}</span>
							</div>

							<div className='items-center xs:hidden sm:flex'>
								<CommentsIcon className='mr-1 text-lightBlue dark:text-icon-dark-inactive' />
								<span className=' text-lightBlue dark:text-blue-dark-medium'>{commentsCount}</span>
							</div>
							<Divider
								type='vertical'
								className='border-l-1 border-lightBlue dark:border-icon-dark-inactive max-sm:hidden sm:mt-1'
							/>

							{tags && tags.length > 0 && (
								<>
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
												setTagsModal(true);
											}}
										>
											+{tags.length - 2}
										</span>
									)}
								</>
							)}
							{tags && tags.length > 0 && (
								<Divider
									type='vertical'
									className='border-l-1 border-lightBlue dark:border-icon-dark-inactive max-sm:hidden'
								/>
							)}
							{relativeCreatedAt && (
								<>
									<div className='hidden items-center text-lightBlue dark:text-icon-dark-inactive sm:flex'>
										<ClockCircleOutlined className='mr-1' /> {relativeCreatedAt}
									</div>
								</>
							)}
							{topic ? (
								<div className='flex items-center sm:-mt-1'>
									<Divider
										type='vertical'
										className='border-l-1 border-lightBlue dark:border-icon-dark-inactive max-sm:hidden sm:mt-1'
									/>
									<TopicTag
										theme={theme}
										className='sm:mx-2 sm:mt-0'
										topic={topic}
									/>
								</div>
							) : null}
						</div>
					</div>
				</div>
				<TagsModal
					tags={tags}
					openTagsModal={tagsModal}
					setOpenTagsModal={setTagsModal}
				/>
			</div>

			<div
				className={`${
					ownPost && 'border-l-4 border-l-pink_primary'
				} h-auto min-h-[150px] border-2 border-grey_light transition-all duration-200 hover:border-pink_primary hover:shadow-xl dark:border-[1px] dark:border-separatorDark xs:flex xs:p-2 sm:hidden md:p-4 ${className}`}
			>
				<div className='flex-1 flex-col xs:mt-1 xs:flex sm:hidden'>
					{topic && (
						<div className='flex justify-start'>
							<TopicTag
								theme={theme}
								className='xs:mx-2 xs:my-0.5'
								topic={topic}
							/>
						</div>
					)}
					<div className='max-xs-hidden m-2.5 text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>
						#{post_id} {title}
						<div className='flex items-center justify-between'>
							{spam_users_count && typeof spam_users_count === 'number' && spam_users_count > 0 ? (
								<div className='flex items-center justify-center lg:hidden'>
									<Tooltip
										color='#E5007A'
										title='This post could be a spam.'
									>
										<WarningMessageIcon className='text-xl text-[#FFA012]' />
									</Tooltip>
								</div>
							) : null}
						</div>
						{spam_users_count && typeof spam_users_count === 'number' && spam_users_count > 0 ? (
							<div className='hidden items-center justify-center lg:flex'>
								<Tooltip
									color='#E5007A'
									title='This post could be a spam.'
								>
									<WarningMessageIcon className='text-xl text-[#FFA012]' />
								</Tooltip>
							</div>
						) : null}
					</div>
					<div className='flex-col items-start text-xs font-medium text-bodyBlue dark:text-blue-dark-high xs:ml-2 xs:mt-1 xs:flex xs:gap-0 sm:ml-0 sm:hidden sm:gap-2.5 lg:flex-row lg:items-center'>
						<div className='xs:flex xs:justify-start sm:hidden'>
							<OnchainCreationLabel
								address={address}
								username={username}
							/>
							<Divider
								type='vertical'
								className='border-l-1 border-lightBlue dark:border-icon-dark-inactive max-lg:hidden xs:mt-0.5 xs:inline-block'
							/>
							{relativeCreatedAt && (
								<>
									<div className='mt-0 items-center text-sm xs:-mt-0.5 xs:flex xs:text-lightBlue xs:dark:text-icon-dark-inactive lg:flex'>
										<ClockCircleOutlined className='mr-1 mt-0' /> {relativeCreatedAt}
									</div>
								</>
							)}
						</div>

						<div className='items-center justify-between xs:mt-3.5 xs:flex xs:gap-x-2'>
							{tags && tags.length > 0 && (
								<Divider
									type='vertical'
									className='border-l-1 my-4 border-lightBlue dark:border-icon-dark-inactive max-lg:hidden'
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
											onClick={(e) => {
												e.stopPropagation();
												e.preventDefault();
												setTagsModal(true);
											}}
										>
											+{tags.length - 2}
										</span>
									)}
								</>
							)}
						</div>
					</div>
				</div>
				<TagsModal
					tags={tags}
					openTagsModal={tagsModal}
					setOpenTagsModal={setTagsModal}
				/>
			</div>
		</>
	);
};

export default DiscussionCard;
