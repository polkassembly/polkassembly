// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import Markdown from '~src/ui-components/Markdown';
import ImageIcon from '~src/ui-components/ImageIcon';
import Link from 'next/link';
import Image from 'next/image';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { MessageType } from '~src/auth/types';
import SignupPopup from '~src/ui-components/SignupPopup';
import LoginPopup from '~src/ui-components/loginPopup';

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
	return new Date(dateString).toLocaleDateString();
};

const PostItem: React.FC<any> = ({ post, currentUserdata }) => {
	const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
	const isExpanded = expandedPostId === post.post_id;

	const toggleExpandPost = (postId: number) => {
		setExpandedPostId(expandedPostId === postId ? null : postId);
	};

	const { bgColor, label: statusLabel } = getStatusStyle(post.status || 'Active');

	const { '👍': likes = { count: 0, userIds: [], usernames: [] }, '👎': dislikes = { count: 0, userIds: [], usernames: [] } } = post?.post_reactions || {};

	const fullContent = post?.content || NO_CONTENT_FALLBACK;
	const truncatedContent = fullContent.substring(0, 200);
	const shouldShowReadMore = fullContent.length > truncatedContent.length;
	const postContent = isExpanded ? fullContent : truncatedContent;

	return (
		<div className='activityborder rounded-2xl bg-white p-8 font-poppins shadow-md dark:border dark:border-solid dark:border-[#4B4B4B] dark:bg-[#0D0D0D]'>
			<PostHeader
				post_id={post.post_id}
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
			<div className='border-t-[0.01px]  border-solid border-[#D2D8E0]'></div>
			<PostActions
				post={post}
				currentUserdata={currentUserdata}
			/>
			<PostCommentSection currentUserdata={currentUserdata} />
		</div>
	);
};

const PostHeader: React.FC<{ bgColor: string; statusLabel: string; post_id: number }> = ({ bgColor, statusLabel, post_id }) => (
	<div className='flex justify-between'>
		<div className='flex gap-4'>
			<p className='text-2xl font-bold text-[#485F7D] dark:text-[#9E9E9E]'>{'2500DOT'}</p>
			<div>
				<p className='rounded-lg bg-[#F3F4F6] p-2 text-[#485F7D] dark:bg-[#3F3F40] dark:text-[#9E9E9E]'>~ {'$36k'}</p>
			</div>
			<div>
				<p className={`rounded-full px-3 py-2 text-white dark:text-black ${bgColor}`}>{statusLabel}</p>
			</div>
		</div>
		<div>
			<Link href={`/referenda/${post_id}`}>
				<div className='m-0 flex cursor-pointer items-center gap-1 rounded-lg border-solid border-[#E5007A] p-0 px-3 text-[#E5007A]'>
					<ImageIcon
						src='/assets/Vote.svg'
						alt=''
						className='m-0 h-6 w-6 p-0'
					/>
					<p className='cursor-pointer pt-3 font-medium'>Cast Vote</p>
				</div>
			</Link>
		</div>
	</div>
);

const PostDetails: React.FC<{ post: any; formatDate: (dateString: string) => string }> = ({ post, formatDate }) => (
	<div className='flex items-center gap-2 pt-2'>
		<Image
			src={post.proposerProfile?.profileimg || FIRST_VOTER_PROFILE_IMG_FALLBACK}
			alt='profile'
			className='h-6 w-6 rounded-full'
			width={24}
			height={24}
		/>
		<p className='pt-3 text-sm font-medium text-[#243A57] dark:text-white'>{post.proposerProfile?.username || ANONYMOUS_FALLBACK}</p>
		<span className='text-[#485F7D] dark:text-[#9E9E9E]'>in</span>
		<span className='rounded-lg bg-[#FCF1F4] p-2 text-sm text-[#EB5688] dark:bg-[#4D2631] dark:text-[##EB5688]'>{post?.topic?.name || GENERAL_TOPIC_FALLBACK}</span>
		<p className='pt-3 text-[#485F7D]'>|</p>
		<div className='flex '>
			<ImageIcon
				src='/assets/icons/timer.svg'
				alt='timer'
				className='mt-3 h-5 w-5 text-[#485F7D] dark:text-[#9E9E9E]'
			/>
			<p className='pt-3 text-sm text-gray-500 dark:text-[#9E9E9E]'>{formatDate(String(post.created_at))}</p>
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
		<p className='pt-2 font-medium text-[#243A57] dark:text-white'>
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
	dislikes: { count: number; usernames: string[] };
	post: any;
}> = ({ likes, dislikes, post }) => {
	const { firstVoterProfileImg, comments_count } = post;

	return (
		<div className='flex items-center justify-between text-sm text-gray-500 dark:text-[#9E9E9E]'>
			{/* Likes Section */}
			<div>
				{likes.count > 0 && likes?.usernames?.length > 0 && (
					<div className='flex items-center'>
						{/* Profile Image of the first user who liked */}
						<Image
							src={firstVoterProfileImg || FIRST_VOTER_PROFILE_IMG_FALLBACK}
							alt='Voter Profile'
							className='h-5 w-5 rounded-full'
							width={20}
							height={20}
						/>
						<p className='ml-2 pt-3'>
							{likes?.count === 1 ? `${likes?.usernames?.[0]} has liked this post` : `${likes?.usernames?.[0]} & ${likes?.count - 1} others liked this post`}
						</p>
					</div>
				)}
			</div>

			<div className='flex items-center gap-3'>
				<p className='text-sm text-gray-600 dark:text-[#9E9E9E]'>{dislikes.count} dislikes</p>
				<p className='text-[#485F7D] dark:text-[#9E9E9E]'>|</p>
				<p className='text-sm text-gray-600 dark:text-[#9E9E9E]'>{comments_count || 0} Comments</p>
			</div>
		</div>
	);
};

const PostActions: React.FC<{
	post: any;
	currentUserdata: any;
}> = ({ post, currentUserdata }) => {
	const { post_id, type, track_no } = post;
	const userid = currentUserdata?.user_id;
	const [reactionState, setReactionState] = useState({
		dislikesCount: post?.dislikes?.count || 0,
		likesCount: post?.likes?.count || 0,
		userDisliked: post?.dislikes?.usernames?.includes(currentUserdata?.username) || false,
		userLiked: post?.likes?.usernames?.includes(currentUserdata?.username) || false
	});
	const [openLogin, setLoginOpen] = useState<boolean>(false);
	const [openSignup, setSignupOpen] = useState<boolean>(false);

	const handleReactionClick = async (reaction: '👍' | '👎') => {
		if (!currentUserdata && !userid) {
			setLoginOpen(true);
			return;
		}

		const isLiked = reaction === '👍' && reactionState.userLiked;
		const isDisliked = reaction === '👎' && reactionState.userDisliked;
		const actionName = `${isLiked || isDisliked ? 'remove' : 'add'}PostReaction`;
		const { data, error } = await nextApiClientFetch<MessageType>(`api/v1/auth/actions/${actionName}`, {
			postId: post_id,
			postType: type,
			reaction,
			replyId: null,
			setReplyReaction: false,
			trackNumber: track_no,
			userId: userid
		});

		if (error || !data) {
			console.error('Error updating reaction', error);
			return;
		}
		setReactionState((prevState) => {
			if (reaction === '👍') {
				return {
					...prevState,
					dislikesCount: isLiked ? prevState.dislikesCount : prevState.dislikesCount - (prevState.userDisliked ? 1 : 0),
					likesCount: isLiked ? prevState.likesCount - 1 : prevState.likesCount + 1,
					userDisliked: isLiked ? prevState.userDisliked : false,
					userLiked: !isLiked
				};
			} else if (reaction === '👎') {
				return {
					...prevState,
					dislikesCount: isDisliked ? prevState.dislikesCount - 1 : prevState.dislikesCount + 1,
					likesCount: isDisliked ? prevState.likesCount : prevState.likesCount - (prevState.userLiked ? 1 : 0),
					userDisliked: !isDisliked,
					userLiked: isDisliked ? prevState.userLiked : false
				};
			}
			return prevState;
		});
	};

	return (
		<div className='mt-1 flex items-center space-x-4'>
			<div
				className={`flex cursor-pointer items-center rounded-lg px-2 ${reactionState.userLiked && 'bg-pink-50'} gap-2`}
				onClick={() => handleReactionClick('👍')}
			>
				<PostAction
					icon={
						<ImageIcon
							src='/assets/icons/like-pink.svg'
							alt='like icon'
							className='h-5 w-5'
						/>
					}
					label={reactionState.userLiked ? 'Liked' : LIKE_LABEL}
				/>
			</div>

			<div
				className={`flex cursor-pointer items-center rounded-lg px-2 ${reactionState.userDisliked && 'bg-pink-50'} gap-2`}
				onClick={() => handleReactionClick('👎')}
			>
				<PostAction
					icon={
						<ImageIcon
							src='/assets/icons/dislike-pink.svg'
							alt='dislike icon'
							className={'h-5 w-5'}
						/>
					}
					label={reactionState.userDisliked ? 'Disliked' : DISLIKE_LABEL}
				/>
			</div>

			<Link
				target='_blank'
				href={'https://twitter.com/'}
			>
				<PostAction
					icon={
						<ImageIcon
							src='/assets/icons/share-pink.svg'
							alt='share icon'
							className='h-5 w-5'
						/>
					}
					label='Share'
				/>
			</Link>

			<PostAction
				icon={
					<ImageIcon
						src='/assets/icons/comment-pink.svg'
						alt='comment icon'
						className='h-5 w-5'
					/>
				}
				label={COMMENT_LABEL}
			/>
			<SignupPopup
				setLoginOpen={setLoginOpen}
				modalOpen={openSignup}
				setModalOpen={setSignupOpen}
				isModal={true}
			/>
			<LoginPopup
				setSignupOpen={setSignupOpen}
				modalOpen={openLogin}
				setModalOpen={setLoginOpen}
				isModal={true}
			/>
		</div>
	);
};

const PostAction: React.FC<{ icon: JSX.Element; label: string }> = ({ icon, label }) => (
	<div className='flex items-center gap-2'>
		{icon}
		<p className='cursor-pointer pt-4 text-[#E5007A]'>{label}</p>
	</div>
);

const PostCommentSection: React.FC<{ currentUserdata: any }> = ({ currentUserdata }) => (
	<div className='mt-3 flex'>
		<Image
			src={`${currentUserdata?.image ? currentUserdata?.image : FIRST_VOTER_PROFILE_IMG_FALLBACK}`}
			alt=''
			className='h-10 w-10 rounded-full'
			width={40}
			height={40}
		/>
		<input
			type='text'
			placeholder={COMMENT_PLACEHOLDER}
			className='activityborder2 ml-7 h-10 w-full rounded-l-lg border border-solid border-[#D2D8E0] p-2 outline-none dark:border dark:border-solid dark:border-[#4B4B4B]'
		/>
		<button className='w-28 cursor-pointer rounded-r-lg border border-solid border-[#D2D8E0] bg-[#485F7D] bg-opacity-[5%] p-2 text-[#243A57] dark:border dark:border-solid dark:border-[#4B4B4B] dark:bg-[#262627] dark:text-white'>
			{POST_LABEL}
		</button>
	</div>
);

export default PostItem;
