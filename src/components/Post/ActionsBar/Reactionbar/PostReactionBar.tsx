// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// TODO: Make a reusable reaction bar

import { IReactions } from 'pages/api/v1/posts/on-chain-post';
import React, { FC, useState } from 'react';
import ReferendaLoginPrompts from '~src/ui-components/RefendaLoginPrompts';

import ReactionButton from './ReactionButton';

interface IPostReactionBarProps {
	className?: string;
	post_reactions?: IReactions;
}

const PostReactionBar: FC<IPostReactionBarProps> = ({
	className,
	post_reactions
}) => {
	const [reactionsDisabled, setReactionsDisabled] = useState<boolean>(false);
	const [openLikeModal, setLikeModalOpen] = useState<boolean>(false);
	const [openDislikeModal, setDislikeModalOpen] = useState<boolean>(false);
	const [reactions, setReactions] = useState<IReactions>(post_reactions!);
	if (!post_reactions) {
		return null;
	}
	return (
		<div className={`${className} flex items-center`}>
			{Object.keys(post_reactions).map((reaction) => {
				return (
					<div key={reaction}>
						<ReactionButton
							reaction={reaction}
							reactions={reactions}
							reactionsDisabled={reactionsDisabled}
							setReactionsDisabled={setReactionsDisabled}
							setLikeModalOpen={setLikeModalOpen}
							setDislikeModalOpen={setDislikeModalOpen}
							setReactions={setReactions}
						/>
					</div>
				);
			})}
			<ReferendaLoginPrompts
				modalOpen={openLikeModal}
				setModalOpen={setLikeModalOpen}
				image="/assets/referenda-like-dislike.png"
				title="Join Polkassembly to Like this proposal."
				subtitle="Discuss, contribute and get regular updates from Polkassembly."
			/>

			<ReferendaLoginPrompts
				modalOpen={openDislikeModal}
				setModalOpen={setDislikeModalOpen}
				image="/assets/referenda-like-dislike.png"
				title="Join Polkassembly to Dislike this proposal."
				subtitle="Discuss, contribute and get regular updates from Polkassembly."
			/>
		</div>
	);
};

export default PostReactionBar;
