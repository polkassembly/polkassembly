// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { UserOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import { useRouter } from 'next/router';
import { IReactions } from 'pages/api/v1/posts/on-chain-post';
import React, { FC, useEffect, useRef, useState } from 'react';
import CreationLabel from 'src/ui-components/CreationLabel';
import UpdateLabel from 'src/ui-components/UpdateLabel';
import UserAvatar from 'src/ui-components/UserAvatar';

import { usePostDataContext } from '~src/context';
import EditableCommentContent from './EditableCommentContent';
import Replies from './Replies';

export interface IComment {
	user_id: number;
	content: string;
	created_at: Date;
	id: string;
	updated_at: Date;
	replies: any[];
	comment_reactions: IReactions;
	username: string;
	proposer?: string;
    sentiment?:number;
    comment_source?:'polkassembly' | 'subsquare';
}

interface ICommentProps {
	className?: string;
	comment: IComment;
	disableEdit?: boolean;
}

export const Comment: FC<ICommentProps> = (props) => {
	const { className, comment } = props;
	const { user_id, content, created_at, id, replies, updated_at ,sentiment,comment_source='polkassembly' } = comment;
	const { asPath } = useRouter();
	const commentScrollRef = useRef<HTMLDivElement>(null);
	const [newSentiment,setNewSentiment]=useState<number>(sentiment||0);

	const { postData: { postIndex, postType } } = usePostDataContext();
	useEffect(() => {
		if (typeof window == 'undefined') return;
		const hashArr = asPath.split('#');
		const hash = hashArr[hashArr.length - 1];
		if (commentScrollRef && commentScrollRef.current && hash === `${id}`) {
			commentScrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}, [asPath, id]);

	if (!user_id || !content) return (<div className={`${className} mb-5`}>
		<Avatar className='bg-gray-300' size="large" icon={<UserOutlined />} />

		<div className='comment-content'>
			Comment not available
		</div>
	</div>);

	// TODO: author address
	// eslint-disable-next-line @typescript-eslint/no-unused-vars

	return (
		<div className={`${className} flex gap-x-4 mb-9 `}>
			{/* Offset div to scroll to because scrollIntoView doesn't support offset */}
			<div id={id} ref={commentScrollRef} className="invisible absolute mt-[-100px]"></div>
			<UserAvatar
				className='mt-1 hidden md:inline-block flex-none'
				username={comment.username}
				size='large'
				id={user_id}
			/>
			<div className='w-full overflow-hidden'>
				<CreationLabel
					className='creation-label py-2 pt-4 px-0 md:px-4 bg-comment_bg rounded-t-md mb'
					created_at={created_at}
					defaultAddress={comment.proposer}
					text={'commented'}
					username={comment.username}
					sentiment={newSentiment}
					commentSource={comment_source}
				>
					<UpdateLabel
						created_at={created_at}
						updated_at={updated_at}
					/>
				</CreationLabel>
				<EditableCommentContent
					userId={user_id}
					created_at={created_at}
					className={`rounded-md ${sentiment && sentiment !== 0 && 'mt-[-5px]  min-[320px]:mt-[-2px] ' }`}
					comment={comment}
					commentId={id}
					content={content}
					postId={postIndex}
					proposalType={postType}
					disableEdit={props.disableEdit}
					sentiment={newSentiment}
					setSentiment={setNewSentiment}
					prevSentiment={sentiment||0}
					isSubsquareUser={comment_source==='subsquare'}
				/>
				{replies && replies.length > 0 && <Replies className='comment-content' commentId={id} repliesArr={replies} />}
			</div>
		</div>
	);
};

export default Comment;
