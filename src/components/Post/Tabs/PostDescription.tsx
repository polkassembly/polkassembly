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
import { useRouter } from 'next/router';
import { NotificationStatus } from '~src/types';
import queueNotification from '~src/ui-components/QueueNotification';
import { ProposalType } from '~src/global/proposalType';

const CommentsContainer = dynamic(() => import('../Comment/CommentsContainer'), {
	loading: () => <div>
		<Skeleton active />
		<Skeleton className='mt-12' active />
	</div>,
	ssr: false
});

interface IPostDescriptionProps {
	allowed_roles?: string[] | null;
	className?: string;
	canEdit: boolean | '' | undefined;
	id: number | null | undefined;
	isEditing: boolean;
	isOnchainPost: boolean;
	trackName?: string;
	toggleEdit: () => void
	TrackerButtonComp: JSX.Element
	Sidebar: ({ className }: {className?: string | undefined;}) => JSX.Element
}

const PostDescription: FC<IPostDescriptionProps> = (props) => {
	const { className, canEdit, id, isEditing, toggleEdit, Sidebar, TrackerButtonComp , allowed_roles, trackName } = props;
	const { postData: { content, postType, postIndex, title, post_reactions } } = usePostDataContext();
	const router = useRouter();
	//write a function which redirects to the proposalType page
	const deletePostFromUrl = (proposalType: ProposalType, trackName?: string) => {
		let path: string = '';
		if(trackName) {
			path = `${trackName.split(/(?=[A-Z])/).join('-').toLowerCase()}`;
		}
		if(proposalType){
			switch (proposalType){
			case ProposalType.DISCUSSIONS:
				path = 'discussions';
				break;
			case ProposalType.BOUNTIES:
				path = 'bounties';
				break;
			case ProposalType.CHILD_BOUNTIES:
				path = 'child_bounties';
				break;
			case ProposalType.TIPS:
				path = 'tips';
				break;
			case ProposalType.GRANTS:
				path = 'grants';
				break;
			case ProposalType.TREASURY_PROPOSALS:
				path = 'treasury-proposals';
				break;
			case ProposalType.TECH_COMMITTEE_PROPOSALS:
				path = 'tech-comm-proposals';
				break;
			case ProposalType.REFERENDUMS:
				path = 'referenda';
				break;
			case ProposalType.DEMOCRACY_PROPOSALS:
				path = 'proposals';
				break;
			case ProposalType.COUNCIL_MOTIONS:
				path = 'motions';
				break;
			}
		}
		const listingPageText = path.replace(/-|_/g, ' ');
		const url = trackName? trackName.split(/(?=[A-Z])/).join(' ') : listingPageText;
		router.push(`/${url}`);
	};
	const deletePost = () => {
		queueNotification({
			header: 'Success!',
			message: 'The post was deleted successfully',
			status: NotificationStatus.SUCCESS
		});
		deletePostFromUrl(postType, trackName);
	};
	return (
		<div className={`${className} mt-4`}>
			{content && <Markdown className='post-content' md={content} />}

			{/* Actions Bar */}
			<div id='actions-bar' className={`flex mt-2 ${canEdit && 'flex-col'} flex-wrap mb-8`}>
				<div className='flex items-center'>
					<PostReactionBar
						className='reactions'
						post_reactions={post_reactions}
					/>
					{!canEdit && id && !isEditing && <SubscriptionButton postId={postIndex} proposalType={postType} />}
					{canEdit && <Button className={'text-pink_primary flex items-center border-none shadow-none px-1.5'} onClick={toggleEdit}><FormOutlined />Edit</Button>}
				</div>
				<div className='flex items-center'>
					{id && !isEditing && <ReportButton proposalType={postType} type='post' postId={`${postIndex}`} />}
					{canEdit && !isEditing && <CreateOptionPoll proposalType={postType} postId={postIndex} />}
					{TrackerButtonComp}
					<ShareButton title={title} />
					{
						allowed_roles && allowed_roles.includes('moderator')?
							<ReportButton proposalType={postType} allowed_roles={allowed_roles} onDeletePost={deletePost} isDeleteModal={true} type='post' postId={`${postIndex}`} /> :
							null
					}
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
