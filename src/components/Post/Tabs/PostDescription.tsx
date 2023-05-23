// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { FormOutlined } from '@ant-design/icons';
import { Button, Skeleton } from 'antd';
import dynamic from 'next/dynamic';
import React, { FC, useEffect, useState } from 'react';
import Markdown from 'src/ui-components/Markdown';

import { usePostDataContext } from '~src/context';

import CreateOptionPoll from '../ActionsBar/OptionPoll/CreateOptionPoll';
import PostReactionBar from '../ActionsBar/Reactionbar/PostReactionBar';
import ReportButton from '../ActionsBar/ReportButton';
import ShareButton from '../ActionsBar/ShareButton';
import SubscriptionButton from '../ActionsBar/SubscriptionButton/SubscriptionButton';
import styled from 'styled-components';

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
	const [showMore, setShowMore] = useState<boolean>(false);
	const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

	const [numOfLines, setNumOfLines] = useState<number | null>(null);

	useEffect(() => {
		const delay = 100; // Adjust the delay as needed

		// Get the element containing the content after a delay
		const timeoutId = setTimeout(() => {
			const contentElement = document.querySelector('.post-content') as HTMLElement;

			if (contentElement) {
				// Calculate the number of lines
				const lineHeight = parseInt(window.getComputedStyle(contentElement).lineHeight);
				const contentHeight = contentElement.offsetHeight;
				const numberOfLines = Math.ceil(contentHeight / lineHeight);
				setNumOfLines(numberOfLines);
			}
		}, delay);

		return () => clearTimeout(timeoutId);
	}, [content]);

	return (
		<div className={`${className} mt-4`}>
			{content && <Markdown className={`${numOfLines && !showMore && !isSafari && 'clamped'} post-content`} md={content} />}
			{numOfLines && numOfLines > 6 && !isSafari &&<p className='text-pink_primary py-2 cursor-pointer' onClick={() => setShowMore(!showMore)}>
				{showMore ? 'Show less' : 'Show more'}
			</p>}

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

export default styled(PostDescription)`
.clamped {
	overflow: hidden;
	display: -webkit-box;
	-webkit-line-clamp: 5;
	line-clamp: 5; 
	-webkit-box-orient: vertical;
}
`;