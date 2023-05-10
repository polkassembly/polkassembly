// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { FormOutlined } from '@ant-design/icons';
import { Button, Skeleton } from 'antd';
import dynamic from 'next/dynamic';
import React, { FC } from 'react';
import Markdown from 'src/ui-components/Markdown';

import { usePostDataContext } from '~src/context';

import CreateOptionPoll from '../ActionsBar/OptionPoll/CreateOptionPoll';
import PostReactionBar from '../ActionsBar/Reactionbar/PostReactionBar';
import ReportButton from '../ActionsBar/ReportButton';
import ShareButton from '../ActionsBar/ShareButton';
import SubscriptionButton from '../ActionsBar/SubscriptionButton/SubscriptionButton';

const CommentsContainer = dynamic(() => import('../Comment/CommentsContainer'), {
	loading: () => <div>
		<Skeleton active />
		<Skeleton className='mt-12' active />
	</div>,
	ssr: false
});

interface IPostDescriptionProps {
	className?: string;
	canEdit: boolean | '' | undefined;
	id: number | null | undefined;
	isEditing: boolean;
	isOnchainPost: boolean;
	toggleEdit: () => void
	TrackerButtonComp: JSX.Element
	Sidebar: ({ className }: {className?: string | undefined;}) => JSX.Element
}

const PostDescription: FC<IPostDescriptionProps> = (props) => {
	const { className, canEdit, id, isEditing, toggleEdit, Sidebar, TrackerButtonComp } = props;
	const { postData: { content, postType, postIndex, title, post_reactions } } = usePostDataContext();

	return (
		<div className={`${className} mt-4`}>
			{content && <Markdown md={content} />}

			{/* Actions Bar */}
			<div id='actions-bar' className={`flex flex-col md:items-center mt-9 ${canEdit && 'flex-col'} md:flex-row mb-8`}>
				<div className='flex items-center'>
					<PostReactionBar
						className='reactions'
						post_reactions={post_reactions}
					/>
					{id && !isEditing && <SubscriptionButton postId={postIndex} proposalType={postType} />}
					{canEdit && <Button className={'text-pink_primary flex items-center border-none shadow-none px-1.5'} onClick={toggleEdit}><FormOutlined />Edit</Button>}
				</div>
				<div className='flex items-center'>
					{id && !isEditing && <ReportButton proposalType={postType} type='post' contentId={`${postIndex}`} />}
					{canEdit && !isEditing && <CreateOptionPoll proposalType={postType} postId={postIndex} />}
					{TrackerButtonComp}
					<ShareButton title={title} />
				</div>
			</div>

			{!isEditing && <div className='flex xl:hidden mb-8 mx-2'><Sidebar /></div>}
			<CommentsContainer
				id={id}
			/>
		</div>
	);
};

export default PostDescription;