// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { trackEvent } from 'analytics';
import { IReactions } from 'pages/api/v1/posts/on-chain-post';
import React, { FC, useState, useRef, useEffect } from 'react';
import { MessageType } from '~src/auth/types';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { usePostDataContext } from '~src/context';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import LikeOutlined from '~assets/icons/reactions/LikeOutlined.svg';
import LikeIconfilled from '~assets/icons/reactions/LikeIconfilled.svg';
import LikeIconfilledDark from '~assets/icons/reactions/LikeFilledDark.svg';
import LikeOutlinedDark from '~assets/icons/reactions/LikeOutlinedDark.svg';
import DislikeOutlined from '~assets/icons/reactions/DislikeOutlined.svg';
import DislikeOutlinedDark from '~assets/icons/reactions/DislikeOutlinedDark.svg';
import Dislikefilled from '~assets/icons/reactions/Dislikefilled.svg';
import DislikefilledDark from '~assets/icons/reactions/DislikeFilledDark.svg';
import LikedGif from '~assets/icons/reactions/Liked-Colored.gif';
import LikedGifDark from '~assets/icons/reactions/Liked-Colored-Dark.gif';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { UserProfileImage } from 'pages/api/v1/auth/data/getUsersProfileImages';
import TooltipContent from './TooltipContent';
import Popover from '~src/basic-components/Popover';

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
const PostReactionButtons: FC<IReactionButtonProps> = ({
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
	const { network } = useNetworkSelector();
	const { id, username, picture: image = '' } = useUserDetailsSelector();
	const { resolvedTheme: theme } = useTheme();
	const usernames = reactions?.[reaction as IReaction].usernames;
	const userIds = reactions?.[reaction as IReaction].userIds;
	const reacted = username && usernames?.includes(username);
	const [showLikedGif, setShowLikedGif] = useState(false);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const [clickQueue, setClickQueue] = useState(0);
	const [userImageData, setUserImageData] = useState<UserProfileImage[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const getUserProfile = async (userIds: string[]) => {
		if (userIds?.length) {
			setIsLoading(true);
			const { data } = await nextApiClientFetch<UserProfileImage[]>('api/v1/auth/data/getUsersProfileImages', { userIds });
			if (data) {
				setUserImageData(data);
				setIsLoading(false);
			} else {
				console.log('There is error in fetching data');
				setIsLoading(false);
			}
		} else {
			setUserImageData([]);
		}
	};

	useEffect(() => {
		if (userIds && userIds.length > 0) {
			getUserProfile([...userIds].map(String));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	useEffect(() => {
		if (clickQueue > 0 && !showLikedGif) {
			setShowLikedGif(true);
			timeoutRef.current = setTimeout(() => {
				setShowLikedGif(false);
				setClickQueue((prev) => prev - 1);
			}, 1400);
		}
	}, [clickQueue, showLikedGif]);

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
						<div>{theme == 'dark' ? <LikeIconfilledDark /> : <LikeIconfilled />}</div>
					) : (
						<div
							onClick={() => {
								!id && setLikeModalOpen && setLikeModalOpen(true);
								const likedItem = isReactionOnReply ? 'replyLiked' : 'postLiked';
								trackEvent('like_icon_clicked', 'liked_icon_clicked', {
									contentType: isReactionButtonInPost ? likedItem : 'commentLiked',
									userId: id || '',
									userName: username || ''
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
						<div className='mt-[2px]'>{theme == 'dark' ? <DislikefilledDark /> : <Dislikefilled />}</div>
					) : (
						<div
							onClick={() => {
								!id && setDislikeModalOpen && setDislikeModalOpen(true);
								const dislikedItem = isReactionOnReply ? 'replyDisliked' : 'postDisliked';
								trackEvent('dislike_icon_clicked', 'disliked_icon_clicked', {
									contentType: isReactionButtonInPost ? dislikedItem : 'commentDisliked',
									userId: id || '',
									userName: username || ''
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
				newReactions[reaction as IReaction].userIds = newReactions[reaction as IReaction].userIds?.filter((userId) => userId !== id);
				id && setUserImageData((prev) => prev.filter((user) => user.id !== id));
			} else {
				newReactions[reaction as IReaction].count++;
				newReactions[reaction as IReaction].usernames?.push(username || '');
				newReactions[reaction as IReaction].userIds?.push(id);
				id && setUserImageData((prev) => [...prev, { id, image, username }]);
				setClickQueue((prev) => prev + 1);
				Object.keys(newReactions).forEach((key) => {
					if (key !== reaction && newReactions[key as IReaction].usernames?.includes(username)) {
						newReactions[key as IReaction].count--;
						newReactions[key as IReaction].usernames = newReactions[key as IReaction].usernames?.filter((name) => name !== username);
						newReactions[key as IReaction].userIds = newReactions[key as IReaction].userIds?.filter((userId) => userId !== id);
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
				<span className='flex min-w-[48px] items-center rounded-md bg-[#F4F6F8] px-1 py-[1.5px] hover:bg-[#ebecee] dark:bg-[#1F1F21] dark:hover:bg-[#313133]'>
					<span className='mt-1'>{getReactionIcon(reaction, reacted)}</span>
					<span
						className={`${reactions?.[reaction as IReaction].count < 12 ? 'ml-1 ' : ''} text-xs font-semibold ${
							reacted ? 'text-pink_primary dark:text-blue-dark-helper' : 'text-lightBlue dark:text-icon-dark-inactive'
						}`}
					>
						{reactions?.[reaction as IReaction].count}
					</span>
				</span>
			</CustomButton>
		</span>
	);

	return usernames?.length > 0 ? (
		<Popover
			placement='bottomLeft'
			content={
				importedReactions ? (
					'Likes are disabled for imported comments.'
				) : (
					<TooltipContent
						usernames={usernames}
						users={userImageData}
						isLoading={isLoading}
					/>
				)
			}
		>
			{button}
		</Popover>
	) : (
		button
	);
};

export default PostReactionButtons;
