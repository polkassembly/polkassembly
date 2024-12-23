// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider } from 'antd';
import { Pagination } from '~src/ui-components/Pagination';
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { noTitle } from '~src/global/noTitle';
import chainLogo from '~assets/parachain-logos/chain-logo.jpg';
import { ClockCircleOutlined } from '@ant-design/icons';
import Address from '~src/ui-components/Address';
import Markdown from '~src/ui-components/Markdown';
import { chainProperties } from '~src/global/networkConstants';
import Image from 'next/image';
import TopicTag from '~src/ui-components/TopicTag';
import { getTopicNameFromTopicId } from '~src/util/getTopicFromType';
import { ProposalType, getSinglePostLinkFromProposalType } from '~src/global/proposalType';
import { getTopicFromType } from '~src/util/getTopicFromType';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';
import LikeIcon from '~assets/search/search-like.svg';
import DislikeIcon from '~assets/search/search-dislike.svg';
import CommentIcon from '~assets/search/search-comment.svg';
import dayjs from 'dayjs';
import { trackEvent } from 'analytics';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';

interface Props {
	className?: string;
	postsData: any[];
	setOpenModal: (pre: boolean) => void;
	isSuperSearch: boolean;
	setPostsPage: (postsPage: any) => void;
	postsPage: number;
	totalPage: number;
	searchInput?: string;
	theme?: string;
}
const ResultPosts = ({ className, postsData, isSuperSearch, searchInput, postsPage, setPostsPage, totalPage }: Props) => {
	const currentUser = useUserDetailsSelector();
	const { resolvedTheme } = useTheme();

	const eventRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const scrollToTop = setTimeout(() => {
			if (eventRef.current) {
				eventRef.current.scrollTo({ behavior: 'smooth', left: 0, top: 0 });
			}
		}, 1000);
		return () => {
			clearTimeout(scrollToTop);
		};
	}, [postsData, postsPage]);

	return postsData.length > 0 ? (
		<>
			<div
				className={`${className} -mx-6 mt-4 h-[400px] ${postsData.length > 1 ? 'overflow-y-auto' : ''}`}
				ref={eventRef}
			>
				{postsData.map((post, index: number) => {
					let titleString = post?.title || noTitle;

					const titleTrimmed = titleString.match(/.{1,80}(\s|$)/g)![0];
					titleString = `${titleTrimmed} ${titleTrimmed.length != titleString.length ? '...' : ''}`;
					return (
						<a
							rel='noreferrer'
							href={`https://${post?.network}.polkassembly.io/${getSinglePostLinkFromProposalType(post?.post_type)}/${post?.id}`}
							key={index}
							target='_blank'
						>
							<div
								className={`shadow-[0px 22px 40px -4px rgba(235, 235, 235, 0.8)] min-h-[150px] cursor-pointer flex-col rounded-none border-[1px] border-b-[0px] border-solid border-[#f3f4f5] px-9 py-6 hover:border-b-[1px] hover:border-pink_primary max-sm:p-5 ${
									index % 2 === 1 && 'bg-[#fafafb] dark:bg-[#161616]'
								} ${index === postsData.length - 1 ? 'border-b-[1px]' : ''} dark:border-none max-md:flex-wrap`}
								onClick={() => {
									// GAEvent when user clicks on search result
									trackEvent('search_results_clicked', 'clicked_search_result', {
										address: currentUser?.loginAddress || '',
										searchInput: `${searchInput} keyword searched`,
										userId: currentUser?.id || '',
										userName: currentUser?.username || ''
									});
								}}
							>
								<div className='flex items-center gap-2 '>
									{post?.proposer_address ? (
										<Address
											address={post?.proposer_address}
											displayInline
											usernameClassName='text-xs'
										/>
									) : (
										<div className='mb-1 text-xs font-medium text-lightBlue dark:text-blue-dark-medium'>{post?.username}</div>
									)}
									<div className='flex items-center gap-2 text-xs text-lightBlue dark:text-blue-dark-medium md:hidden'>
										<Divider
											style={{ border: '1px solid var(--separatorDark)' }}
											type='vertical'
										/>
										<ClockCircleOutlined className='-mr-1' />
										{getRelativeCreatedAt(dayjs.unix(post?.created_at).toDate())}
									</div>
								</div>
								<div className='mt-2 text-sm font-medium text-blue-light-high dark:text-blue-dark-high'>
									#{post?.id} {titleString}
								</div>
								<Markdown
									imgHidden
									md={post?.parsed_content?.slice(0, 250) + ' .....'}
									className='expand-content my-2 text-sm font-normal tracking-[0.01em] text-[#8696a9]'
								/>
								<div className='my-2 flex flex-shrink-0 flex-wrap gap-1 max-sm:mt-2'>
									<div className='flex items-center gap-2 text-xs text-lightBlue dark:text-blue-dark-medium max-sm:hidden'>
										<div className='flex items-center gap-1 text-xs text-lightBlue dark:text-blue-dark-medium'>
											<LikeIcon />
											<span>{post?.reaction_count?.['👍'] || 0}</span>
										</div>
										<div className='flex items-center gap-1 text-xs text-lightBlue dark:text-blue-dark-medium'>
											<DislikeIcon />
											<span>{post?.reaction_count?.['👎'] || 0}</span>
										</div>
										<div className='flex items-center gap-1 text-xs text-lightBlue dark:text-blue-dark-medium'>
											<CommentIcon />
											<span>{post?.comments_count || 0}</span>
										</div>
										<Divider
											style={{ border: '1px solid var(--separatorDark)' }}
											type='vertical'
										/>
									</div>
									{post?.tags && post?.tags.length > 0 && (
										<div className='flex items-center gap-1'>
											{post?.tags?.slice(0, 2).map((tag: string, index: number) => (
												<div
													key={index}
													className='rounded-[50px] border-[1px] border-solid border-section-light-container bg-white px-[14px] py-1 text-[10px] font-medium text-lightBlue dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-blue-dark-medium'
												>
													{tag}
												</div>
											))}
											{post?.tags.length > 2 && (
												<span className='rounded-[50px] bg-[#e7e9ee] px-2 py-1 text-[10px] font-medium text-blue-light-high dark:text-blue-dark-high'>
													+{post?.tags.length - 2}
												</span>
											)}
											<Divider
												style={{ border: '1px solid var(--separatorDark)' }}
												type='vertical'
											/>
										</div>
									)}
									<div className='flex items-center gap-2 text-xs text-lightBlue dark:text-blue-dark-medium max-sm:hidden'>
										<ClockCircleOutlined className='-mr-1' />
										{getRelativeCreatedAt(dayjs.unix(post?.created_at).toDate())}
										<Divider
											style={{ border: '1px solid var(--separatorDark)' }}
											type='vertical'
										/>
									</div>
									{(post?.topic || post?.topic_id) && (
										<div className='flex items-center'>
											<TopicTag
												className='ml-1'
												theme={resolvedTheme as any}
												topic={getTopicNameFromTopicId((post?.topic || post?.topic_id || post?.topic?.id || getTopicFromType(post?.postType as ProposalType)?.id) as any)}
											/>
											<Divider
												style={{ border: '1px solid var(--separatorDark)' }}
												type='vertical'
											/>
										</div>
									)}
									{!!isSuperSearch && (
										<div className='mr-2 flex items-center justify-center'>
											<Image
												className='h-4 w-4 rounded-full object-contain'
												src={chainProperties[post?.network]?.logo ? chainProperties[post?.network].logo : chainLogo}
												alt='Logo'
											/>
										</div>
									)}
									<div className='flex items-center gap-2 text-xs text-lightBlue dark:text-blue-dark-medium'>
										in{' '}
										<span className='capitalize text-pink_primary'>
											{post?.post_type === 'referendums_v2' ? 'Opengov referenda' : (post?.post_type as ProposalType)?.split('_')?.join(' ')}
										</span>
									</div>
								</div>
							</div>
						</a>
					);
				})}
			</div>
			<div className={`${className} mb-1 flex items-center justify-center px-4 py-4`}>
				<Pagination
					defaultCurrent={1}
					current={postsPage}
					pageSize={LISTING_LIMIT}
					total={totalPage}
					showSizeChanger={false}
					hideOnSinglePage={true}
					onChange={(page: number) => {
						setPostsPage(page);
					}}
					responsive={true}
					theme={resolvedTheme}
				/>
			</div>
		</>
	) : null;
};
export default styled(ResultPosts)`
	.expand-content {
		display: -webkit-box;
		-webkit-line-clamp: 4;
		-webkit-box-orient: vertical;
		width: 100%;
		overflow: hidden !important;
	}
`;
