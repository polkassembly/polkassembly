// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// TODO: Make a reusable reaction bar

import { IReactions } from 'pages/api/v1/posts/on-chain-post';
import React, { FC, useState } from 'react';
import ReferendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';
import BountyPostReactionButtons from './BountyPostReactions';

interface IPostReactionBarProps {
	className?: string;
	postIndex?: number;
	post_reactions?: IReactions;
}

const BountyPostReactionBar: FC<IPostReactionBarProps> = ({ className, post_reactions, postIndex }) => {
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
						<BountyPostReactionButtons
							reaction={reaction}
							reactions={reactions}
							reactionsDisabled={reactionsDisabled}
							setReactionsDisabled={setReactionsDisabled}
							setLikeModalOpen={setLikeModalOpen}
							setDislikeModalOpen={setDislikeModalOpen}
							setReactions={setReactions}
							isReactionButtonInPost={true}
							postIndex={postIndex}
						/>
					</div>
				);
			})}
			<ReferendaLoginPrompts
				modalOpen={openLikeModal}
				setModalOpen={setLikeModalOpen}
				image='/assets/Gifs/login-like.gif'
				title='Join Polkassembly to Like this proposal.'
				subtitle='Discuss, contribute and get regular updates from Polkassembly.'
			/>

			<ReferendaLoginPrompts
				modalOpen={openDislikeModal}
				setModalOpen={setDislikeModalOpen}
				image='/assets/Gifs/login-dislike.gif'
				title='Join Polkassembly to Dislike this proposal.'
				subtitle='Discuss, contribute and get regular updates from Polkassembly.'
			/>
		</div>
	);
};

export default BountyPostReactionBar;
