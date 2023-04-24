// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IReactions } from 'pages/api/v1/posts/on-chain-post';
import React, { FC, useState } from 'react';
import ReferendaLoginPrompts from '~src/ui-components/RefendaLoginPrompts';

import ReactionButton from './ReactionButton';

interface ICommentReactionBarProps {
	className?: string;
	commentId: string;
	comment_reactions: IReactions;
	importedReactions?:boolean
}

const CommentReactionBar: FC<ICommentReactionBarProps> = ({ className, comment_reactions, commentId, importedReactions=false }) => {
	const [reactionsDisabled, setReactionsDisabled] = useState(false);
	const [reactions, setReactions] = useState<IReactions>(comment_reactions);
	const [openLikeModal,setLikeModalOpen]=useState<boolean>(false);
	const [openDislikeModal,setDislikeModalOpen]=useState<boolean>(false);
	return (
		<div className={className}>
			{Object.keys(comment_reactions).map((reaction) => {
				return (
					<ReactionButton
						key={reaction}
						reaction={reaction}
						reactions={reactions}
						commentId={commentId}
						reactionsDisabled={reactionsDisabled || importedReactions}
						setReactionsDisabled={setReactionsDisabled}
						setReactions={setReactions}
						setLikeModalOpen={setLikeModalOpen}
						setDislikeModalOpen={setDislikeModalOpen}
					/>
				);
			})}
			<ReferendaLoginPrompts
				modalOpen={openLikeModal}
				setModalOpen={setLikeModalOpen}
				image="/assets/referenda-like-dislike.png"
				title="Join Polkassembly to Like this proposal."
				subtitle="Discuss, contribute and get regular updates from Polkassembly."/>

			<ReferendaLoginPrompts
				modalOpen={openDislikeModal}
				setModalOpen={setDislikeModalOpen}
				image="/assets/referenda-like-dislike.png"
				title="Join Polkassembly to Dislike this proposal."
				subtitle="Discuss, contribute and get regular updates from Polkassembly."/>
		</div>
	);
};

export default CommentReactionBar;
