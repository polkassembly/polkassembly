// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import EditableReplyContent from './EditableReplyContent';
import { IComment } from './Comment';
import CreationLabelForComments from './CommentsContainer/CreationLabelForComments';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IGetProfileWithAddressResponse } from 'pages/api/v1/auth/data/profileWithAddress';
import ImageIcon from '~src/ui-components/ImageIcon';
interface Props {
	className?: string;
	reply: any;
	commentId: string;
	userName?: string;
	isSubsquareUser: boolean;
	isReactionOnReply: boolean;
	comment: IComment;
}

export const Reply = ({ className, commentId, reply, userName, comment, isSubsquareUser, isReactionOnReply }: Props) => {
	const { user_id, username, content, created_at, id, proposer, is_custom_username } = reply;
	const { asPath } = useRouter();
	const replyRef = useRef<HTMLDivElement>(null);
	const [profileDetails, setProfileDetails] = useState({
		image: '',
		username: ''
	});

	const getData = async () => {
		try {
			const { data, error } = await nextApiClientFetch<IGetProfileWithAddressResponse>(`api/v1/auth/data/profileWithAddress?address=${proposer}`, undefined, 'GET');
			if (error || !data || !data.username || !data.user_id) {
				return;
			}
			setProfileDetails({
				image: data?.profile?.image || '',
				username: data?.username
			});
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		if (proposer) return;
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [proposer]);

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
		<div
			id={id}
			ref={replyRef}
			className={`${className} flex gap-x-4`}
		>
			<div className='comment-box'>
				<div className='flex items-center gap-2'>
					<ImageIcon
						alt='user'
						src={profileDetails?.image ? profileDetails.image : '/assets/icons/user-profile.png'}
						imgClassName='h-8 w-8 rounded-full'
						imgWrapperClassName='rounded-full h-8 w-8 mr-[2px]'
					/>
					<CreationLabelForComments
						className=' rounded-t-md'
						created_at={created_at}
						defaultAddress={proposer}
						username={username}
						spam_users_count={reply.spam_users_count}
						commentSource={reply.reply_source}
						isRow={true}
					></CreationLabelForComments>
				</div>
				<EditableReplyContent
					userId={user_id}
					className='ml-10 rounded-md'
					commentId={commentId}
					reply={reply}
					replyId={id}
					content={content}
					userName={userName}
					proposer={proposer}
					is_custom_username={is_custom_username}
					comment={comment}
					isSubsquareUser={isSubsquareUser}
					isReactionOnReply={isReactionOnReply}
				/>
			</div>
		</div>
	);
};

export default styled(Reply)`
	display: flex;
	margin-top: 1rem;

	.comment-box {
		border-radius: 3px;
		box-shadow: box_shadow_card;
		margin-bottom: 1rem;
		width: calc(100%);
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
