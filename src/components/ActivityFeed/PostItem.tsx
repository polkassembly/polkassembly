// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import Markdown from '~src/ui-components/Markdown';
import { formatDate as formatDateUtil, truncateContent } from './utils/utils';
import { PostItemProps } from './utils/types';
import ImageIcon from '~src/ui-components/ImageIcon';

// Constants
const ANONYMOUS_FALLBACK = 'Anonymous';
const GENERAL_TOPIC_FALLBACK = 'General';
const NO_CONTENT_FALLBACK = 'No content available for this post.';
const FIRST_VOTER_PROFILE_IMG_FALLBACK = '/assets/rankcard3.svg';
const LIKE_LABEL = 'Like';
const DISLIKE_LABEL = 'Dislike';
const COMMENT_LABEL = 'Comment';
const COMMENT_PLACEHOLDER = 'Type your comment here';
const POST_LABEL = 'Post';

const getStatusStyle = (status: string) => {
	const statusStyles: Record<string, { bgColor: string; label: string }> = {
		Deciding: { bgColor: 'bg-[#D05704]', label: 'Deciding' },
		Executed: { bgColor: 'bg-[#2ED47A]', label: 'Executed' },
		Rejected: { bgColor: 'bg-[#BD2020]', label: 'Rejected' },
		Submitted: { bgColor: 'bg-[#3866CE]', label: 'Submitted' }
	};

	return statusStyles[status] || { bgColor: 'bg-[#2ED47A]', label: 'Active' };
};

const formatDate = (dateString: string) => {
	return formatDateUtil(dateString);
};

const PostItem: React.FC<PostItemProps> = ({ post, currentUserdata }) => {
	const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
	const isExpanded = expandedPostId === post.post_id;

	const toggleExpandPost = (postId: number) => {
		setExpandedPostId(expandedPostId === postId ? null : postId);
	};

	const { bgColor, label: statusLabel } = getStatusStyle(post.status || 'Active');

	const { '👍': likes = { count: 0, usernames: [] }, '👎': dislikes = { count: 0 } } = post?.details?.post_reactions || {};

	const fullContent = post?.details?.content || NO_CONTENT_FALLBACK;
	const truncatedContent = truncateContent(fullContent, 50);
	const shouldShowReadMore = fullContent.length > truncatedContent.length;
	const postContent = isExpanded ? fullContent : truncatedContent;

	return (
		<div className='activityborder rounded-2xl bg-white p-8 font-poppins shadow-md'>
			<PostHeader
				bgColor={bgColor}
				statusLabel={statusLabel}
			/>
			<PostDetails
				post={post}
				formatDate={formatDate}
			/>
			<PostContent
				post={post}
				content={postContent}
				shouldShowReadMore={shouldShowReadMore}
				toggleExpandPost={() => toggleExpandPost(post.post_id)}
				isExpanded={isExpanded}
			/>
			<PostReactions
				likes={likes}
				dislikes={dislikes}
				post={post}
			/>
			<PostActions />
			<PostCommentSection currentUserdata={currentUserdata} />
		</div>
	);
};

const PostHeader: React.FC<{ bgColor: string; statusLabel: string }> = ({ bgColor, statusLabel }) => (
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
			<div className='castvoteborder m-0 flex cursor-pointer items-center gap-1 p-0 px-3 text-[#E5007A]'>
				<ImageIcon
					src='/assets/Vote.svg'
					alt=''
					className='m-0 h-6 w-6 p-0'
				/>
				<p className='cursor-pointer pt-3 font-medium'>Cast Vote</p>
			</div>
		</div>
	</div>
);

const PostDetails: React.FC<{ post: any; formatDate: (dateString: string) => string }> = ({ post, formatDate }) => (
	<div className='flex items-center gap-2 pt-2'>
		<img
			src={post.proposerProfile?.profileimg || FIRST_VOTER_PROFILE_IMG_FALLBACK}
			alt='profile'
			className='h-6 w-6 rounded-full'
		/>
		<p className='pt-3 text-sm font-medium text-[#243A57]'>{post.proposerProfile?.username || ANONYMOUS_FALLBACK}</p>
		<span className='text-[#485F7D]'>in</span>
		<span className='rounded-lg bg-[#FCF1F4] p-2 text-sm text-[#EB5688]'>{post?.topic?.name || GENERAL_TOPIC_FALLBACK}</span>
		<p className='pt-3 text-[#485F7D]'>|</p>
		<div className='flex '>
			<ImageIcon
				src='/assets/icons/timer.svg'
				alt='timer'
				className='mt-3 h-5 w-5 text-[#485F7D]'
			/>
			<p className='pt-3 text-sm text-gray-500'>{formatDate(String(post.created_at))}</p>
		</div>
	</div>
);

const PostContent: React.FC<{
	post: any;
	content: string;
	shouldShowReadMore: boolean;
	toggleExpandPost: () => void;
	isExpanded: boolean;
}> = ({ post, content, shouldShowReadMore, toggleExpandPost, isExpanded }) => (
	<>
		<p className='pt-2 font-medium text-[#243A57]'>
			#{post?.title || '45 Standard Guidelines to judge Liquidity Treasury Proposals on the main governance side - Kusama and Polkadot'}
		</p>
		<Markdown
			className='text-[#243A57]'
			md={content}
			isPreview={!isExpanded}
		/>
		{shouldShowReadMore && (
			<p
				className='cursor-pointer font-medium text-[#1B61FF]'
				onClick={toggleExpandPost}
			>
				{isExpanded ? 'Show Less' : 'Read More'}
			</p>
		)}
	</>
);

const PostReactions: React.FC<{
	likes: { count: number; usernames: string[] };
	dislikes: { count: number };
	post: any;
}> = ({ likes, dislikes, post }) => (
	<div className='flex items-center justify-between text-sm text-gray-500'>
		<div>
			{likes.usernames.length > 0 && (
				<div className='flex items-center'>
					<img
						src={post.firstVoterProfileImg || FIRST_VOTER_PROFILE_IMG_FALLBACK}
						alt='Voter Profile'
						className='h-5 w-5 rounded-full'
					/>
					<p className='ml-2 pt-3'>{likes.count === 1 ? `${likes.usernames[0]} has liked this post` : `${likes.usernames[0]} & ${likes.count - 1} others liked this post`}</p>
				</div>
			)}
		</div>
		<div className='flex gap-3'>
			<p className='text-sm text-gray-600'>{dislikes.count} dislikes</p>
			<p className='text-[#485F7D]'>|</p>
			<p className='text-sm text-gray-600'>{post?.details?.comments_count || 0} Comments</p>
		</div>
	</div>
);

const PostActions: React.FC = () => (
	<div className='mt-1 flex items-center space-x-4'>
		<PostAction
			icon={
				<ImageIcon
					src='/assets/icons/like-pink.svg'
					alt='like icon'
					className='h-5 w-5'
				/>
			}
			label={LIKE_LABEL}
		/>
		<PostAction
			icon={
				<ImageIcon
					src='/assets/icons/dislike-pink.svg'
					alt='like icon'
					className='h-5 w-5'
				/>
			}
			label={DISLIKE_LABEL}
		/>
		<PostAction
			icon={
				<ImageIcon
					src='/assets/icons/share-pink.svg'
					alt='like icon'
					className='h-5 w-5'
				/>
			}
			label='Share'
		/>
		<PostAction
			icon={
				<ImageIcon
					src='/assets/icons/comment-pink.svg'
					alt='like icon'
					className='h-5 w-5'
				/>
			}
			label={COMMENT_LABEL}
		/>
	</div>
);

const PostAction: React.FC<{ icon: JSX.Element; label: string }> = ({ icon, label }) => (
	<div className='flex items-center gap-2'>
		{icon}
		<p className='cursor-pointer pt-4 text-[#E5007A]'>{label}</p>
	</div>
);

const PostCommentSection: React.FC<{ currentUserdata: any }> = ({ currentUserdata }) => (
	<div className='mt-3 flex'>
		<img
			src={`${currentUserdata?.image ? currentUserdata?.image : FIRST_VOTER_PROFILE_IMG_FALLBACK}`}
			alt=''
			className='h-10 w-10 rounded-full'
		/>
		<input
			type='text'
			placeholder={COMMENT_PLACEHOLDER}
			className='activityborder2 ml-7 h-10 w-full rounded-l-lg p-2 outline-none'
		/>
		<button className='activityborder2 w-28 cursor-pointer rounded-r-lg bg-[#485F7D] bg-opacity-[5%] p-2 text-[#243A57]'>{POST_LABEL}</button>
	</div>
);

export default PostItem;
