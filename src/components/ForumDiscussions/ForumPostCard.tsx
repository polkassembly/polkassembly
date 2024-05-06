// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import { Topic } from './types';
import { Divider } from 'antd';
import { ClockCircleOutlined, LikeOutlined, EyeFilled } from '@ant-design/icons';
import { CommentsIcon } from '~src/ui-components/CustomIcons';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';

interface ForumPostCardProps {
	topics: Topic[];
}

const ForumPostCard: FC<ForumPostCardProps> = ({ topics }) => {
	// const [tagsModal, setTagsModal] = useState<boolean>(false);
	return (
		<div className='mt-6'>
			{topics.map((topic, index) => {
				const { title, id, created_at, reply_count, like_count, tags, views } = topic;
				const date = new Date(created_at);
				return (
					<div
						key={topic.id}
						className={`${(index + 1) % 2 !== 0 ? 'bg-[#FBFBFC] dark:bg-[#161616]' : 'dark:bg-section-dark-overlay'}`}
					>
						<div className='min-h-[100px] cursor-pointer border-2 border-[#DCDFE350] p-3 transition-all duration-200 hover:border-pink_primary hover:shadow-xl dark:border-[1px] dark:border-separatorDark xs:hidden sm:flex md:p-4'>
							<span className='flex-none text-center font-medium text-bodyBlue dark:text-blue-dark-high sm:mt-2 sm:w-[120px]'>#{id}</span>
							<div className='flex-1 flex-col sm:mt-1 sm:flex sm:justify-between'>
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
										{tags && tags.length > 0 && (
											<Divider
												type='vertical'
												className='border-l-1 border-lightBlue dark:border-icon-dark-inactive max-sm:hidden'
											/>
										)}

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
						{/* <TagsModal
							tags={tags}
							openTagsModal={tagsModal}
							setOpenTagsModal={setTagsModal}
						/> */}
					</div>
				);
			})}
		</div>
	);
};

export default ForumPostCard;
