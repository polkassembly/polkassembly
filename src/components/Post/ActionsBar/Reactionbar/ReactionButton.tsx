// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LikeFilled, LikeOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { IReactions } from 'pages/api/v1/posts/on-chain-post';
import React, { FC, useContext } from 'react';
import { UserDetailsContext } from 'src/context/UserDetailsContext';

import { MessageType } from '~src/auth/types';
import { usePostDataContext } from '~src/context';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

export interface IReactionButtonProps {
	className?: string;
	reaction: IReaction | string;
	reactions:  IReactions;
	commentId?: string;
	reactionsDisabled: boolean;
	setReactionsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
	setReactions: React.Dispatch<React.SetStateAction<IReactions>>
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
	setReactionsDisabled
}) => {
	const { postData: { postIndex, postType } } = usePostDataContext();
	const { id, username } = useContext(UserDetailsContext);

	const usernames = reactions?.[reaction as IReaction].usernames;
	const reacted = username && usernames?.includes(username);

	const getReactionIcon = (reaction: string, reacted: string | boolean | null | undefined) => {
		if(reaction == '👍') {
			return reacted ? <LikeFilled /> : <LikeOutlined />;
		}

		if(reaction == '👎') {
			return reacted ? <LikeFilled rotate={180} /> : <LikeOutlined rotate={180} />;
		}

		return reaction;
	};

	const handleReact = async () => {
		if (!id || !username) {
			console.error('No user id found. Not logged in?');
			return;
		}

		setReactionsDisabled(true);

		const actionName  =`${reacted ? 'remove' : 'add'}${commentId ? 'Comment' : 'Post'}Reaction`;

		const { data , error } = await nextApiClientFetch<MessageType>(`api/v1/auth/actions/${actionName}`, {
			commentId: commentId || null,
			postId: postIndex,
			postType,
			reaction,
			userId: id
		});

		if (error || !data) {
			console.error('Error while reacting', error);
		}

		if(data) {
			const newReactions = { ...reactions };
			if(reacted) {
				newReactions[reaction as IReaction].count--;
				newReactions[reaction as IReaction].usernames = newReactions[reaction as IReaction].usernames?.filter(name => name !== username);
			}else {
				newReactions[reaction as IReaction].count++;
				newReactions[reaction as IReaction].usernames?.push(username || '');

				//remove username from other reactions
				Object.keys(newReactions).forEach(key => {
					if(key !== reaction && newReactions[key as IReaction].usernames?.includes(username)) {
						newReactions[key as IReaction].count--;
						newReactions[key as IReaction].usernames = newReactions[key as IReaction].usernames?.filter(name => name !== username);
					}
				});
			}
			setReactions(newReactions);
		}

		setReactionsDisabled(false);
	};

	const button =  <span className={className}>
		<Button
			className={'border-none px-2 shadow-none disabled:opacity-[0.5] disabled:bg-transparent'}
			onClick={handleReact}
			disabled={!id || reactionsDisabled}
		>
			<span className="flex items-center text-pink_primary">
				{getReactionIcon(reaction, reacted)}
				<span className="ml-2 text-xs">
					{reactions?.[reaction as IReaction].count}
				</span>
			</span>
		</Button>
	</span>;

	let popupContent = '';

	if (usernames?.length > 10) {
		popupContent = `${usernames.slice(0, 10).join(', ')} and ${usernames.length - 10} others`;
	} else {
		popupContent = usernames?.join(', ');
	}

	return usernames?.length > 0 ?
		<Tooltip color='#E5007A' title={popupContent}>
			{button}
		</Tooltip> : button;
};

export default ReactionButton;
