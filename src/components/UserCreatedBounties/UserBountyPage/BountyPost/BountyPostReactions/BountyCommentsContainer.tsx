// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Empty } from 'antd';
import React, { useState } from 'react';
import styled from 'styled-components';
import RefendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import classNames from 'classnames';
import { getSortedComments } from '~src/components/Post/Comment/CommentsContainer';
import PostCommentForm from '~src/components/Post/PostCommentForm';
import Comments from '~src/components/Post/Comment/Comments';
import { IComment } from '~src/components/Post/Comment/Comment';

const BountyCommentsContainer = ({
	className,
	id,
	comments,
	postIndex,
	setBountyPopoverVisible
}: {
	id: number | null | undefined;
	className: string;
	comments: { [index: string]: IComment[] };
	postIndex: number;
	setBountyPopoverVisible?: (pre: boolean) => void;
}) => {
	const [comment, setComments] = useState<{ [index: string]: IComment[] }>(comments);
	const [openLoginModal, setOpenLoginModal] = useState<boolean>(false);
	const router = useRouter();
	const allComments = comment ? Object.values(comments)?.flat() : [];
	const { resolvedTheme: theme } = useTheme();

	const handleCurrentCommentAndTimeline = (postId: string, type: string, comment: IComment) => {
		const key = `${postId}_${type}`;
		const existingComments = comments[key] || [];
		const commentsPayload = {
			...comments,
			[key]: [...existingComments, comment]
		};
		setComments(getSortedComments(commentsPayload));
		router.push(`#${comment.id}`);
	};

	return (
		<div className={className}>
			{id ? (
				<>
					<PostCommentForm
						className='mb-2'
						setCurrentState={handleCurrentCommentAndTimeline}
						BountyPostIndex={postIndex}
						isUsedInBounty={true}
						setBountyPopoverVisible={setBountyPopoverVisible}
					/>
				</>
			) : (
				<div
					id='comment-login-prompt'
					className={classNames('mb-8 mt-4 flex h-12 items-center justify-center gap-3 rounded-sm bg-[#E6F4FF] shadow-md dark:bg-alertColorDark')}
				>
					<Image
						src='/assets/icons/alert-login.svg'
						width={20}
						height={20}
						alt={''}
					/>
					<div className='text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>
						Please{' '}
						<span
							className='cursor-pointer text-pink_primary'
							onClick={() => {
								setOpenLoginModal(true);
							}}
						>
							Log In
						</span>{' '}
						to comment
					</div>
				</div>
			)}

			{Boolean(allComments?.length) && (
				<div
					id='comments-section'
					className={classNames('tooltip-design mb-5 flex items-center justify-between max-sm:flex-col max-sm:items-start max-sm:gap-1')}
				>
					<span className='text-lg font-medium text-bodyBlue dark:font-normal dark:text-blue-dark-high'>
						{allComments.length || 0}
						<span className='ml-1'>Comments</span>
					</span>
				</div>
			)}
			<div className={classNames('block grid-cols-12 xl:grid')}>
				<div className={'col-start-1 col-end-13 mt-0'}>
					{!!allComments?.length && (
						<>
							<Comments
								disableEdit={!id}
								comments={allComments}
								BountyPostIndex={postIndex}
								isUsedInBounty={true}
							/>
						</>
					)}
					{allComments.length === 0 && allComments.length > 0 && (
						<div className='mb-4 mt-4'>
							<Empty description='No comments available' />
						</div>
					)}
					{
						<RefendaLoginPrompts
							theme={theme}
							modalOpen={openLoginModal}
							setModalOpen={setOpenLoginModal}
							image='/assets/Gifs/login-discussion.gif'
							title='Join Polkassembly to Comment on this proposal.'
							subtitle='Discuss, contribute and get regular updates from Polkassembly.'
						/>
					}
				</div>
			</div>
		</div>
	);
};

// @ts-ignore
export default React.memo(styled(BountyCommentsContainer)`
	.ant-anchor-wrapper {
		.ant-anchor {
			display: flex;
			flex-direction: column;
			gap: 96px;
		}

		.ant-anchor-ink {
			margin-left: 5px;
		}

		.ant-anchor-link {
			margin-left: 5px;
		}

		.ant-anchor-ink-ball-visible {
			display: block !important;
			background: url('/assets/pa-small-circle.png') !important;
			background-repeat: no-repeat !important;
			background-position: center !important;
			height: 18px !important;
			width: 18px !important;
			border: none !important;
			border-radius: 50% !important;
			margin-left: -7px;
		}
		.my-alert .ant-alert-message span {
			color: red !important;
		}
	}
`);
