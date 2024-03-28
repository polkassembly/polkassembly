// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { trackEvent } from 'analytics';
import { IReactions } from 'pages/api/v1/posts/on-chain-post';
import React, { FC } from 'react';
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
import { useTheme } from 'next-themes';

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

	const getReactionIcon = (reaction: string, reacted: string | boolean | null | undefined) => {
		if (reaction == '👍') {
			return reacted ? (
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
				>
					{theme == 'dark' ? <LikeOutlinedDark /> : <LikeOutlined />}
				</div>
			);
		}

		if (reaction == '👎') {
			return reacted ? (
				<Dislikefilled />
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
					{theme == 'dark' ? <DislikeOutlinedDark /> : <DislikeOutlined />}
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
				className='m-0 mr-6 border-none p-0 disabled:bg-transparent disabled:opacity-[0.5]'
				disabled={reactionsDisabled}
			>
				<span className='flex items-center rounded-md bg-[#F4F6F8] px-2 py-[1.5px] hover:bg-[#ebecee] dark:bg-[#1F1F21] dark:hover:bg-[#313133]'>
					<span className='mt-1'>{getReactionIcon(reaction, reacted)}</span>
					<span className='ml-1 text-xs font-semibold text-lightBlue dark:text-icon-dark-inactive'>{reactions?.[reaction as IReaction].count}</span>
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
