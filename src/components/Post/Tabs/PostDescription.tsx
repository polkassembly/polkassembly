// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { FormOutlined } from '@ant-design/icons';
import { Button, Skeleton } from 'antd';
import dynamic from 'next/dynamic';
import React, { FC } from 'react';
import Markdown from 'src/ui-components/Markdown';

import { usePostDataContext, useNetworkContext, useUserDetailsContext } from '~src/context';

import CreateOptionPoll from '../ActionsBar/OptionPoll/CreateOptionPoll';
import PostReactionBar from '../ActionsBar/Reactionbar/PostReactionBar';
import ReportButton from '../ActionsBar/ReportButton';
import ShareButton from '../ActionsBar/ShareButton';
import SubscriptionButton from '../ActionsBar/SubscriptionButton/SubscriptionButton';
import { useRouter } from 'next/router';
import { EReportType, NotificationStatus } from '~src/types';
import queueNotification from '~src/ui-components/QueueNotification';
import { ProposalType } from '~src/global/proposalType';
import { poppins } from 'pages/_app';

const CommentsContainer = dynamic(() => import('../Comment/CommentsContainer'), {
	loading: () => (
		<div>
			<Skeleton active />
			<Skeleton
				className='mt-12'
				active
			/>
		</div>
	),
	ssr: false
});

interface IPostDescriptionProps {
	className?: string;
	canEdit: boolean | '' | undefined;
	id: number | null | undefined;
	isEditing: boolean;
	isOnchainPost: boolean;
	toggleEdit: () => void;
	TrackerButtonComp: JSX.Element;
	Sidebar: ({ className }: { className?: string | undefined }) => JSX.Element;
}

const PostDescription: FC<IPostDescriptionProps> = (props) => {
	const { className, canEdit, id, isEditing, toggleEdit, Sidebar, TrackerButtonComp } = props;
	const {
		postData: { content, postType, postIndex, title, post_reactions }
	} = usePostDataContext();
	const { allowed_roles } = useUserDetailsContext();
	const { network } = useNetworkContext();
	const router = useRouter();
	const isOffchainPost: Boolean = postType == ProposalType.DISCUSSIONS || postType == ProposalType.GRANTS;
	//write a function which redirects to the proposalType page
	const goToListingViewPath = (proposalType: ProposalType) => {
		let path: string = '';
		if (proposalType) {
			switch (proposalType) {
				case ProposalType.DISCUSSIONS:
					path = 'discussions';
					break;
				case ProposalType.GRANTS:
					path = 'grants';
					break;
			}
		}
		router.push(`/${path}`);
	};
	const deletePost = () => {
		queueNotification({
			header: 'Success!',
			message: 'The post was deleted successfully',
			status: NotificationStatus.SUCCESS
		});
		goToListingViewPath(postType);
	};
	return (
		<div className={`${className} mt-4`}>
			{content && (
				<Markdown
					className='post-content'
					md={content}
				/>
			)}

			{/* Actions Bar */}
			<div
				id='actions-bar'
				className={`mt-2 flex ${canEdit && 'flex-col'} mb-8 flex-wrap`}
			>
				<div className='flex items-center'>
					<PostReactionBar
						className='reactions'
						post_reactions={post_reactions}
					/>
					{!canEdit && id && !isEditing && (
						<SubscriptionButton
							postId={postIndex}
							proposalType={postType}
						/>
					)}
					{canEdit && (
						<Button
							className={'flex items-center border-none px-1.5 text-pink_primary shadow-none'}
							onClick={toggleEdit}
						>
							<FormOutlined />
							Edit
						</Button>
					)}
				</div>
				<div className='flex items-center'>
					{id && !isEditing && (
						<ReportButton
							className={'flex items-center border-none p-0 text-pink_primary shadow-none'}
							proposalType={postType}
							type='post'
							postId={`${postIndex}`}
						/>
					)}
					{canEdit && !isEditing && (
						<CreateOptionPoll
							proposalType={postType}
							postId={postIndex}
						/>
					)}
					{TrackerButtonComp}
					<ShareButton title={title} />
					{allowed_roles && allowed_roles.includes('moderator') && isOffchainPost && ['polkadot', 'kusama'].includes(network) && (
						<ReportButton
							className={`flex w-[100%] items-center rounded-none leading-4 text-pink_primary shadow-none hover:bg-transparent ${poppins.variable} ${poppins.className}`}
							proposalType={postType}
							onSuccess={deletePost}
							isDeleteModal={true}
							type={EReportType.POST}
							postId={`${postIndex}`}
						/>
					)}
				</div>
			</div>

			{!isEditing && (
				<div className='mx-2 mb-8 flex xl:hidden'>
					<Sidebar />
				</div>
			)}
			<CommentsContainer id={id} />
		</div>
	);
};

export default PostDescription;
