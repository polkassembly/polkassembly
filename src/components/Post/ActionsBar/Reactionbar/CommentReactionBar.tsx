// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IReactions } from 'pages/api/v1/posts/on-chain-post';
import React, { FC, useState } from 'react';

import ReactionButton from './ReactionButton';

interface ICommentReactionBarProps {
	className?: string;
	commentId: string;
	comment_reactions: IReactions;
}

const CommentReactionBar: FC<ICommentReactionBarProps> = ({ className, comment_reactions, commentId }) => {
	const [reactionsDisabled, setReactionsDisabled] = useState(false);
	const [reactions, setReactions] = useState<IReactions>(comment_reactions);

	return (
		<div className={className}>
			{Object.keys(comment_reactions).map((reaction) => {
				return (
					<ReactionButton
						key={reaction}
						reaction={reaction}
						reactions={reactions}
						commentId={commentId}
						reactionsDisabled={reactionsDisabled}
						setReactionsDisabled={setReactionsDisabled}
						setReactions={setReactions}
					/>
				);
			})}
		</div>
	);
};

export default CommentReactionBar;
