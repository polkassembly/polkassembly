// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LikeFilled, LikeOutlined } from '@ant-design/icons';
import { trackEvent } from 'analytics';
import { IReactions } from 'pages/api/v1/posts/on-chain-post';
import React, { FC, useEffect, useState } from 'react';
import { MessageType } from '~src/auth/types';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { usePostDataContext } from '~src/context';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { dmSans } from 'pages/_app';
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
const ReactionButton: FC<IReactionButtonProps> = ({
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
	const { id, username } = useUserDetailsSelector();
	const userIds = reactions?.[reaction as IReaction].userIds;
	const usernames = reactions?.[reaction as IReaction].usernames;
	const reacted = username && usernames?.includes(username);
	const currentUser = useUserDetailsSelector();
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

	const getReactionIcon = (reaction: string, reacted: string | boolean | null | undefined) => {
		if (reaction == '👍') {
			return reacted ? (
				<LikeFilled className='-mt-[2px] ' />
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
				>
					<LikeOutlined className='text-[#485F7DCC] dark:text-[#9E9E9ECC]' />
				</div>
			);
		}

		if (reaction == '👎') {
			return reacted ? (
				<LikeFilled
					rotate={180}
					className='-mt-[2px]'
				/>
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
				>
					<LikeOutlined
						rotate={180}
						className='text-[#485F7DCC] dark:text-[#9E9E9ECC]'
					/>
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
				className='m-0 border-none px-2 hover:bg-[#0000000A] disabled:bg-transparent disabled:opacity-[0.5]'
				disabled={reactionsDisabled}
				height={40}
			>
				<span className='flex items-center text-pink_primary dark:text-blue-dark-helper'>
					{getReactionIcon(reaction, reacted)}
					<span
						className={`${dmSans.variable} ${dmSans.className} ml-[5px] text-xs font-medium ${
							!reacted ? 'text-[#485F7DCC] dark:text-[#9E9E9ECC]' : 'text-pink_primary dark:text-blue-dark-helper'
						} `}
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

export default ReactionButton;
