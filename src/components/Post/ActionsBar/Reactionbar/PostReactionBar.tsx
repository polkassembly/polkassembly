// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// TODO: Make a reusable reaction bar

import { IReactions } from 'pages/api/v1/posts/on-chain-post';
import React, { FC, useState } from 'react';

import ReactionButton from './ReactionButton';

interface IPostReactionBarProps {
	className?: string;
	post_reactions?: IReactions;
}

const PostReactionBar: FC<IPostReactionBarProps> = ({ className, post_reactions }) => {
	const [reactionsDisabled, setReactionsDisabled] = useState(false);
	const [reactions, setReactions] = useState<IReactions>(post_reactions!);
	if (!post_reactions) {
		return null;
	}
	return (
		<div className={`${className} flex items-center`}>
			{Object.keys(post_reactions).map((reaction) => {
				return (
					<ReactionButton
						key={reaction}
						reaction={reaction}
						reactions={reactions}
						reactionsDisabled={reactionsDisabled}
						setReactionsDisabled={setReactionsDisabled}
						setReactions={setReactions}
					/>
				);
			})}
		</div>
	);
};

export default PostReactionBar;
