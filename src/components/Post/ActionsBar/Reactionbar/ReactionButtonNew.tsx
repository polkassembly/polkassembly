// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { trackEvent } from 'analytics';
import { IReactions } from 'pages/api/v1/posts/on-chain-post';
import React, { FC, useState } from 'react';
import { MessageType } from '~src/auth/types';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { usePostDataContext } from '~src/context';
import { useUserDetailsSelector } from '~src/redux/selectors';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import Tooltip from '~src/basic-components/Tooltip';
import LikeOutlined from '~assets/icons/reactions/LikeOutlined.svg';
import LikeIconfilled from '~assets/icons/reactions/LikeIconfilled.svg';
import LikeOutlinedDark from '~assets/icons/reactions/LikeOutlinedDark.svg';
import DislikeOutlined from '~assets/icons/reactions/DislikeOutlined.svg';
import DislikeOutlinedDark from '~assets/icons/reactions/DislikeOutlinedDark.svg';
import Dislikefilled from '~assets/icons/reactions/Dislikefilled.svg';
import LikedGif from '~assets/icons/reactions/Liked-Colored.gif';
import LikedGifDark from '~assets/icons/reactions/Liked-Colored-Dark.gif';
import { useTheme } from 'next-themes';
import Image from 'next/image';

export interface IReactionButtonProps {
	className?: string;
	reaction: IReaction | string;
	reactions: IReactions;
	commentId?: string;
	reactionsDisabled: boolean;
	setReactionsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
	setReactions: React.Dispatch<React.SetStateAction<IReactions>>;
	setLikeModalOpen?: (pre: boolean) => void;
	setDislikeModalOpen?: (pre: boolean) => void;
	importedReactions?: boolean;
	isReactionButtonInPost?: boolean;
	replyId?: string;
	isReactionOnReply?: boolean;
}

type IReaction = '👍' | '👎';

// TODO: Refactor handleReact
const ReactionButtonNew: FC<IReactionButtonProps> = ({
	className,
	reaction,
	commentId,
	reactions,
	setReactions,
	reactionsDisabled,
	setLikeModalOpen,
	setDislikeModalOpen,
	importedReactions = false,
	isReactionButtonInPost,
	replyId,
	isReactionOnReply
}) => {
	const {
		postData: { postIndex, postType, track_number }
	} = usePostDataContext();
	const { id, username } = useUserDetailsSelector();
	const { resolvedTheme: theme } = useTheme();
	const usernames = reactions?.[reaction as IReaction].usernames;
	const reacted = username && usernames?.includes(username);
	const currentUser = useUserDetailsSelector();
	const [showLikedGif, setShowLikedGif] = useState(false);

	const getReactionIcon = (reaction: string, reacted: string | boolean | null | undefined) => {
		if (reaction == '👍') {
			return (
				<div
					className='relative'
					style={{ height: 24, width: 24 }}
				>
					{showLikedGif ? (
						<div
							className='absolute -left-[13px] -top-[15px] z-10'
							style={{ height: '24px', width: '24px' }}
						>
							<Image
								src={theme == 'dark' ? LikedGifDark : LikedGif}
								alt='Liked'
								width={50}
								height={50}
							/>
						</div>
					) : reacted ? (
						<LikeIconfilled />
					) : (
						<div
							onClick={() => {
								!id && setLikeModalOpen && setLikeModalOpen(true);
								const likedItem = isReactionOnReply ? 'replyLiked' : 'postLiked';
								trackEvent('like_icon_clicked', 'liked_icon_clicked', {
									contentType: isReactionButtonInPost ? likedItem : 'commentLiked',
									userId: currentUser?.id || '',
									userName: currentUser?.username || ''
								});
							}}
							className='cursor-pointer'
						>
							{theme === 'dark' ? <LikeOutlinedDark /> : <LikeOutlined />}
						</div>
					)}
				</div>
			);
		}

		if (reaction == '👎') {
			return (
				<div
					className='relative'
					style={{ height: 24, width: 24 }}
				>
					{showLikedGif ? (
						<div
							className='absolute -left-[13px] top-[8px] z-10'
							style={{ height: '24px', transform: 'scaleX(-1) rotate(180deg)', width: '24px' }}
						>
							<Image
								src={theme == 'dark' ? LikedGifDark : LikedGif}
								alt='Disliked'
								width={50}
								height={50}
							/>
						</div>
					) : reacted ? (
						<div className='mt-[1.5px]'>
							<Dislikefilled />
						</div>
					) : (
						<div
							onClick={() => {
								!id && setDislikeModalOpen && setDislikeModalOpen(true);
								const dislikedItem = isReactionOnReply ? 'replyDisliked' : 'postDisliked';
								trackEvent('dislike_icon_clicked', 'disliked_icon_clicked', {
									contentType: isReactionButtonInPost ? dislikedItem : 'commenDistLiked',
									userId: currentUser?.id || '',
									userName: currentUser?.username || ''
								});
							}}
							className='mt-[1.5px] cursor-pointer'
						>
							{theme === 'dark' ? <DislikeOutlinedDark /> : <DislikeOutlined />}
						</div>
					)}
				</div>
			);
		}

		return reaction;
	};

	const handleReact = async () => {
		if (!id || !username) {
			if (reaction == '👍') {
				setLikeModalOpen && setLikeModalOpen(true);
			} else {
				setDislikeModalOpen && setDislikeModalOpen(true);
			}
			return;
		} else {
			const newReactions = { ...reactions };
			if (reacted) {
				newReactions[reaction as IReaction].count--;
				newReactions[reaction as IReaction].usernames = newReactions[reaction as IReaction].usernames?.filter((name) => name !== username);
			} else {
				newReactions[reaction as IReaction].count++;
				newReactions[reaction as IReaction].usernames?.push(username || '');
				setShowLikedGif(true);
				setTimeout(() => setShowLikedGif(false), 1400);
				Object.keys(newReactions).forEach((key) => {
					if (key !== reaction && newReactions[key as IReaction].usernames?.includes(username)) {
						newReactions[key as IReaction].count--;
						newReactions[key as IReaction].usernames = newReactions[key as IReaction].usernames?.filter((name) => name !== username);
					}
				});
			}
			setReactions(newReactions);
			const actionName = `${reacted ? 'remove' : 'add'}${commentId ? 'CommentOrReply' : 'Post'}Reaction`;
			const { data, error } = await nextApiClientFetch<MessageType>(`api/v1/auth/actions/${actionName}`, {
				commentId: commentId,
				postId: postIndex,
				postType,
				reaction,
				replyId: replyId || null,
				setReplyReaction: isReactionOnReply ? true : false,
				trackNumber: track_number,
				userId: id
			});

			if (error || !data) {
				console.error('Error while reacting', error);
			}
		}
	};

	const button = (
		<span className={className}>
			<CustomButton
				variant='default'
				onClick={handleReact}
				className='m-0 mr-6 border-none p-0 disabled:bg-transparent disabled:opacity-[0.5]'
				disabled={reactionsDisabled}
			>
				<span className='flex items-center rounded-md bg-[#F4F6F8] px-2 py-[1.5px] hover:bg-[#ebecee] dark:bg-[#1F1F21] dark:hover:bg-[#313133]'>
					<span className='mt-1'>{getReactionIcon(reaction, reacted)}</span>
					<span className={`ml-1 text-xs font-semibold ${reacted ? 'text-pink_primary dark:text-blue-dark-helper' : 'text-lightBlue dark:text-icon-dark-inactive'}`}>
						{reactions?.[reaction as IReaction].count}
					</span>
				</span>
			</CustomButton>
		</span>
	);

	let popupContent = '';
	if (importedReactions) {
		popupContent = 'Likes are disabled for imported comments.';
	} else if (usernames?.length > 10) {
		popupContent = `${usernames.slice(0, 10).join(', ')} and ${usernames.length - 10} others`;
	} else {
		popupContent = usernames?.join(', ');
	}

	return usernames?.length > 0 ? (
		<Tooltip
			color='#E5007A'
			title={popupContent}
		>
			{button}
		</Tooltip>
	) : (
		button
	);
};

export default ReactionButtonNew;
