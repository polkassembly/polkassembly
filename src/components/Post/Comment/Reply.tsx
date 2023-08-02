// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useRouter } from 'next/router';
import React, { useEffect, useRef } from 'react';
import CreationLabel from 'src/ui-components/CreationLabel';
import UserAvatar from 'src/ui-components/UserAvatar';
import styled from 'styled-components';

import EditableReplyContent from './EditableReplyContent';
interface Props{
	className?: string,
	reply: any
	commentId: string
	userName?:string

}

export const Reply = ({ className, commentId, reply ,userName } : Props) => {
	const { user_id, username, content, created_at, id, proposer, is_custom_username } = reply;
	const { asPath } = useRouter();
	const replyRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (typeof window !== undefined) return;
		const hashArr = asPath.split('#');
		const hash = hashArr[hashArr.length - 1];

		if (hash === `${id}`) {
			window.scrollTo(0, replyRef.current?.offsetTop || 0);
		}
	}, [asPath, id]);

	if (!user_id || !username || !content) return <div>Reply not available</div>;

	return (
		<div id={id} ref={replyRef} className={`${className} flex gap-x-4`}>
			<UserAvatar
				className='mt-1 hidden md:inline-block'
				username={username}
				size='large'
				id={id}
			/>
			<div className='comment-box'>
				<CreationLabel
					className='py-2 pt-4 px-0 md:px-4 bg-[#EBF0F5] rounded-t-md'
					created_at={created_at}
					defaultAddress={proposer}
					text={'replied'}
					username={username}
					spam_users_count={reply.spam_users_count}
					commentSource={reply.reply_source}
				>
				</CreationLabel>
				<EditableReplyContent
					userId={user_id}
					className='rounded-md'
					commentId={commentId}
					reply={reply}
					replyId={id}
					content={content}
					userName={userName}
					proposer={proposer}
					is_custom_username={is_custom_username}
				/>
			</div>
		</div>
	);
};

export default styled(Reply)`
	display: flex;
	margin-top: 1rem;

	.comment-box {
		background-color: white;
		border-radius: 3px;
		box-shadow: box_shadow_card;
		margin-bottom: 1rem;
		width: calc(100% - 60px);
		word-break: break-word;

		@media only screen and (max-width: 576px) {
			width: 100%;
			border-radius: 0px;
		}
	}

	.creation-label {
		display: inline-flex;
		padding: 1rem 0 0.8rem 2rem;
		margin-bottom: 0;
	}

	.comment-content {
		padding: 0.8rem 0 0.8rem 2rem;
		width: 100%;
	}
`;
