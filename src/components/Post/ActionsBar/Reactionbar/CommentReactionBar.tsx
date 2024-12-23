// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IReactions } from 'pages/api/v1/posts/on-chain-post';
import React, { FC, useState } from 'react';
import ReferendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';

import ReactionButton from './ReactionButton';

interface ICommentReactionBarProps {
	className?: string;
	commentId: string;
	comment_reactions: IReactions;
	importedReactions?: boolean;
	replyId?: string;
	isReactionOnReply?: boolean;
}

const CommentReactionBar: FC<ICommentReactionBarProps> = ({ isReactionOnReply, className, replyId, comment_reactions, commentId, importedReactions = false }) => {
	const [reactionsDisabled, setReactionsDisabled] = useState(false);
	const [reactions, setReactions] = useState<IReactions>(comment_reactions);
	const [openLikeModal, setLikeModalOpen] = useState<boolean>(false);
	const [openDislikeModal, setDislikeModalOpen] = useState<boolean>(false);
	return (
		<div className={className}>
			<div className='flex'>
				{Object?.keys(comment_reactions || {}).map((reaction) => {
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
							importedReactions={importedReactions}
							replyId={replyId}
							isReactionOnReply={isReactionOnReply}
						/>
					);
				})}
			</div>
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

export default CommentReactionBar;
