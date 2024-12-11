// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// TODO: Make a reusable reaction bar

import { IReactions } from 'pages/api/v1/posts/on-chain-post';
import React, { FC, useState } from 'react';
import ReferendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';
import PostReactionButtons from './PostReactionButtons';
import { useTranslation } from 'next-i18next';

interface IPostReactionBarProps {
	className?: string;
	post_reactions?: IReactions;
}

const PostReactionBar: FC<IPostReactionBarProps> = ({ className, post_reactions }) => {
	const [reactionsDisabled, setReactionsDisabled] = useState<boolean>(false);
	const [openLikeModal, setLikeModalOpen] = useState<boolean>(false);
	const [openDislikeModal, setDislikeModalOpen] = useState<boolean>(false);
	const [reactions, setReactions] = useState<IReactions>(post_reactions!);
	const { t } = useTranslation('common');
	if (!post_reactions) {
		return null;
	}
	return (
		<div className={`${className} flex items-center`}>
			{Object.keys(post_reactions).map((reaction) => {
				return (
					<div key={reaction}>
						<PostReactionButtons
							reaction={reaction}
							reactions={reactions}
							reactionsDisabled={reactionsDisabled}
							setReactionsDisabled={setReactionsDisabled}
							setLikeModalOpen={setLikeModalOpen}
							setDislikeModalOpen={setDislikeModalOpen}
							setReactions={setReactions}
							isReactionButtonInPost={true}
						/>
					</div>
				);
			})}
			<ReferendaLoginPrompts
				modalOpen={openLikeModal}
				setModalOpen={setLikeModalOpen}
				image='/assets/Gifs/login-like.gif'
				title={t('join_polkassembly_to_like_this_proposal')}
				subtitle={t('discuss_contribute_and_get_regular_updates_from_polkassembly')}
			/>

			<ReferendaLoginPrompts
				modalOpen={openDislikeModal}
				setModalOpen={setDislikeModalOpen}
				image='/assets/Gifs/login-dislike.gif'
				title={t('join_polkassembly_to_dislike_this_proposal')}
				subtitle={t('discuss_contribute_and_get_regular_updates_from_polkassembly')}
			/>
		</div>
	);
};

export default PostReactionBar;
