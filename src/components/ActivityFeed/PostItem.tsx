// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import Markdown from '~src/ui-components/Markdown';
import { IoMdTime } from 'react-icons/io';
import { GrLike, GrDislike } from 'react-icons/gr';
import { FaShareAlt } from 'react-icons/fa';
import { LiaCommentsSolid } from 'react-icons/lia';
import { formatDate, truncateContent } from './utils/utils';
import { PostItemProps } from './utils/types';

const PostItem: React.FC<PostItemProps> = ({ post, currentUserdata }) => {
	const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
	const isExpanded = expandedPostId === post.post_id;

	const toggleExpandPost = (postId: number) => {
		setExpandedPostId(expandedPostId === postId ? null : postId);
	};

	const postreaction = post?.details?.post_reactions || {};
	const dislikeCount = postreaction['👎'] ? postreaction['👎'].count : 0;
	let bgColor = 'bg-gray-500';
	let statusLabel = post.status || 'Active';

	if (post.status === 'Deciding') {
		bgColor = 'bg-[#D05704]';
	} else if (post.status === 'Submitted') {
		bgColor = 'bg-[#3866CE]';
	} else if (post.status === 'Executed') {
		bgColor = 'bg-[#2ED47A]';
	} else if (post.status === 'Rejected') {
		bgColor = 'bg-[#BD2020]';
	} else if (!post.status) {
		bgColor = 'bg-[#2ED47A]';
		statusLabel = 'Active';
	}

	const fullContent = post?.details?.content || 'No content available for this post.';
	const truncatedContent = truncateContent(fullContent, 50);
	const shouldShowReadMore = fullContent.length > truncatedContent.length;
	const postContent = isExpanded ? fullContent : truncatedContent;

	return (
		<div className='activityborder rounded-2xl bg-white p-8 font-poppins shadow-md'>
			<div className='flex justify-between'>
				<div className='flex gap-4'>
					<p className='text-2xl font-bold text-[#485F7D]'>{'2500DOT'}</p>
					<div>
						<p className='rounded-lg bg-[#F3F4F6] p-2 text-[#485F7D]'>~ {'$36k'}</p>
					</div>
					<div>
						<p className={`rounded-full p-2 text-white ${bgColor}`}>{statusLabel}</p>
					</div>
				</div>
				<div>
					<div className='castvoteborder  m-0 flex cursor-pointer items-center gap-1 p-0 px-3 text-[#E5007A]'>
						<img
							src='/Vote.svg'
							alt=''
							className='m-0 h-6 w-6 p-0'
						/>
						<p className='cursor-pointerfont-medium  pt-3'>Cast Vote</p>
					</div>
				</div>
			</div>
			<div className='flex items-center gap-2 pt-2'>
				<img
					src={post.proposerProfile?.profileimg || '/rankcard3.svg'}
					alt='profile'
					className='h-6 w-6 rounded-full'
				/>
				<p className='pt-3 text-sm font-medium text-[#243A57]'>{post.proposerProfile?.username || 'Anonymous'}</p>
				<span className='text-[#485F7D]'>in</span>
				<span className='rounded-lg bg-[#FCF1F4] p-2 text-sm text-[#EB5688]'>{post?.topic?.name || 'General'}</span>
				<p className=' pt-3 text-[#485F7D]'>|</p>
				<div className='flex gap-2'>
					<IoMdTime className='mt-3 h-5 w-5 text-[#485F7D]' />
					<p className=' pt-3 text-sm text-gray-500'>{formatDate(String(post.created_at))}</p>
				</div>
			</div>
			<p className='pt-2 font-medium text-[#243A57]'>
				#{post?.title || '#45 Standard Guidelines to judge Liquidity Treasury Proposals on the main governance side - Kusama and Polkadot'}
			</p>
			<Markdown
				className='text-[#243A57]'
				md={postContent || 'No content available for this post.'}
				isPreview={!isExpanded}
			/>
			{shouldShowReadMore && (
				<p
					className='cursor-pointer font-medium text-[#1B61FF]'
					onClick={() => toggleExpandPost(post.post_id)}
				>
					{isExpanded ? 'Show Less' : 'Read More'}
				</p>
			)}
			<div className=' flex items-center justify-between text-sm text-gray-500'>
				<div>
					{postreaction['👍']?.usernames?.length > 0 && (
						<div className='flex items-center'>
							<img
								src={post.firstVoterProfileImg || '/rankcard3.svg'}
								alt='Voter Profile'
								className='h-5 w-5 rounded-full'
							/>
							<p className='ml-2 pt-3'>
								{postreaction['👍'].count === 1
									? `${postreaction['👍'].usernames[0]} has liked this post`
									: `${postreaction['👍'].usernames[0]} & ${postreaction['👍'].count - 1} others liked this post`}
							</p>
						</div>
					)}
				</div>
				<div className='flex gap-3'>
					<p className=' text-sm text-gray-600'>{dislikeCount} dislikes</p>
					<p className='  text-[#485F7D]'>|</p>
					<p className=' text-sm text-gray-600'>{post?.details?.comments_count || 0} Comments</p>
				</div>
			</div>
			<hr />
			<div className=' mt-1 flex items-center space-x-4'>
				<div className='flex  items-center gap-2'>
					<GrLike className='cursor-pointer text-[#E5007A]' />
					<p className='cursor-pointer pt-3 text-[#E5007A]'>Like</p>
				</div>
				<div className='flex items-center gap-2'>
					<GrDislike className='cursor-pointer text-[#E5007A]' />
					<p className=' cursor-pointer pt-3 text-[#E5007A]'>Like</p>
				</div>
				<div className='flex items-center gap-2'>
					<FaShareAlt className='cursor-pointer text-[#E5007A]' />
					<p className=' cursor-pointer pt-3 text-[#E5007A]'>Share</p>
				</div>
				<div className='flex items-center gap-2'>
					<LiaCommentsSolid className='cursor-pointer text-[#E5007A]' />
					<p className=' cursor-pointer pt-3 text-[#E5007A]'>Comment</p>
				</div>
			</div>
			<div className='mt-3 flex'>
				<img
					src={`${currentUserdata?.image ? currentUserdata?.image : '/rankcard3.svg'}`}
					alt=''
					className='h-10 w-10 rounded-full'
				/>
				<input
					type='text'
					placeholder='Type your comment here'
					className='activityborder2 ml-7 h-10 w-full rounded-l-lg p-2 outline-none'
				/>
				<button className='activityborder2 w-28 cursor-pointer rounded-r-lg bg-[#485F7D] bg-opacity-[5%] p-2 text-[#243A57] '>Post</button>
			</div>
		</div>
	);
};

export default PostItem;
