// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC } from 'react';
import { usePostDataContext } from '~src/context';
import CreateOptionPoll from '../ActionsBar/OptionPoll/CreateOptionPoll';
import PostReactionBar from '../ActionsBar/Reactionbar/PostReactionBar';
import ReportButton from '../ActionsBar/ReportButton';
import ShareButton from '../ActionsBar/ShareButton';
import SubscriptionButton from '../ActionsBar/SubscriptionButton/SubscriptionButton';
import { useRouter } from 'next/router';
import { EReportType, NotificationStatus } from '~src/types';
import queueNotification from '~src/ui-components/QueueNotification';
import { ProposalType } from '~src/global/proposalType';
import { dmSans } from 'pages/_app';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import { trackEvent } from 'analytics';
import EditIcon from '~assets/icons/reactions/EditIcon.svg';
import EditIconDark from '~assets/icons/reactions/EditIconDark.svg';
import ThreeDots from '~assets/icons/reactions/ThreeDots.svg';
import ThreeDotsDark from '~assets/icons/reactions/ThreeDotsdark.svg';
import { Dropdown } from '~src/ui-components/Dropdown';
import { MenuProps } from 'antd';
import ExpandableMarkdown from './ExpandableMarkdown';

interface IPostDescriptionProps {
	className?: string;
	canEdit: boolean | '' | undefined;
	id: number | null | undefined;
	isEditing: boolean;
	isOnchainPost: boolean;
	toggleEdit?: () => void;
	TrackerButtonComp?: JSX.Element;
	Sidebar: ({ className }: { className?: string | undefined }) => JSX.Element;
}

const PostDescription: FC<IPostDescriptionProps> = (props) => {
	const { className, canEdit, id, isEditing, toggleEdit, Sidebar } = props;
	const {
		postData: { content, postType, postIndex, title, post_reactions }
	} = usePostDataContext();
	const currentUser = useUserDetailsSelector();
	const { allowed_roles } = useUserDetailsSelector();
	const { network } = useNetworkSelector();
	const router = useRouter();
	const { resolvedTheme: theme } = useTheme();

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
	const items: MenuProps['items'] = [
		{
			key: 1,
			label: (
				<div>
					{canEdit && !isEditing && (
						<CreateOptionPoll
							proposalType={postType}
							postId={postIndex}
						/>
					)}
				</div>
			)
		},
		{
			key: 2,
			label: (
				<ShareButton
					title={title}
					postId={postIndex}
					proposalType={postType}
				/>
			)
		},
		{
			key: 3,
			label: (
				<div>
					{id && !isEditing && (
						<ReportButton
							className={'flex items-center border-none p-0 shadow-none dark:text-blue-dark-helper'}
							proposalType={postType}
							type='post'
							postId={`${postIndex}`}
							isUsedInDescription={true}
						/>
					)}
				</div>
			)
		},
		{
			key: 4,
			label: (
				<div>
					{allowed_roles && allowed_roles.includes('moderator') && isOffchainPost && ['polkadot', 'kusama', 'picasso', 'composable'].includes(network) && (
						<ReportButton
							className={`flex w-[100%] items-center rounded-none leading-4 text-pink_primary shadow-none hover:bg-transparent ${dmSans.variable} ${dmSans.className}`}
							proposalType={postType}
							onSuccess={deletePost}
							isDeleteModal={true}
							type={EReportType.POST}
							postId={`${postIndex}`}
							isUsedInDescription={true}
						/>
					)}
				</div>
			)
		}
	];

	return (
		<div className={`${className} mt-4`}>
			{content && (
				<ExpandableMarkdown
					md={content}
					theme={theme}
				/>
			)}

			{/* Actions Bar */}
			<div
				id='actions-bar'
				className={'mb-8 mt-2 flex flex-wrap gap-x-2'}
			>
				<div className='flex w-full items-center justify-between'>
					<PostReactionBar
						className='reactions'
						post_reactions={post_reactions}
					/>
					<div className='flex items-center gap-5'>
						{canEdit && (
							<button
								className='cursor-pointer rounded-md border-none bg-transparent shadow-none'
								onClick={() => {
									toggleEdit?.();
									trackEvent('post_edit_button_clicked', 'clicked_edit_post_button', {
										postIndex: postIndex,
										postType: postType,
										title: title,
										userId: currentUser?.id || '',
										userName: currentUser?.username || ''
									});
								}}
							>
								<span className='flex items-center gap-1 rounded-md bg-[#F4F6F8] px-2 py-[5px] hover:bg-[#ebecee] dark:bg-[#1F1F21] dark:hover:bg-[#313133]'>
									{theme == 'dark' ? <EditIconDark /> : <EditIcon />}
									<span className='ml-1 font-medium leading-[18px] text-lightBlue dark:text-icon-dark-inactive'>Edit</span>
								</span>
							</button>
						)}

						{!canEdit && id && !isEditing && (
							<SubscriptionButton
								postId={postIndex}
								proposalType={postType}
								title={title}
							/>
						)}
						<Dropdown
							theme={theme}
							placement='bottomLeft'
							menu={{ items }}
							className='z-[1056] my-auto flex h-min items-center justify-center'
						>
							<div className='cursor-pointer rounded-md bg-[#F4F6F8] p-[6px] hover:bg-[#ebecee] dark:bg-[#1F1F21] dark:hover:bg-[#313133]'>
								{theme == 'dark' ? <ThreeDotsDark /> : <ThreeDots />}
							</div>
						</Dropdown>
					</div>
				</div>
				{/* <div className='flex flex-wrap items-center gap-x-1'>{TrackerButtonComp}</div> */}
			</div>

			{!isEditing && (
				<div className='mx-2 mb-8 flex xl:hidden'>
					<Sidebar />
				</div>
			)}
			{/* <CommentsContainer id={id} /> */}
		</div>
	);
};

export default PostDescription;
