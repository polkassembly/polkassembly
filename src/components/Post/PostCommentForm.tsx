// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckOutlined } from '@ant-design/icons';
import { Button, Form } from 'antd';
import { IAddPostCommentResponse } from 'pages/api/v1/auth/actions/addPostComment';
import React, { FC, useEffect, useState } from 'react';
import ErrorAlert from 'src/ui-components/ErrorAlert';
import UserAvatar from 'src/ui-components/UserAvatar';
import styled from 'styled-components';

import { ChangeResponseType } from '~src/auth/types';
import { useCommentDataContext, usePostDataContext, useUserDetailsContext } from '~src/context';
import CommentSentimentModal from '~src/ui-components/CommentSentimentModal';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

import ContentForm from '../ContentForm';
import queueNotification from '~src/ui-components/QueueNotification';
import { NotificationStatus } from '~src/types';
import { IComment } from './Comment/Comment';
import { getSubsquidLikeProposalType } from '~src/global/proposalType';
import { v4 } from 'uuid';

interface IPostCommentFormProps {
	className?: string;
	setCurrentState?:(postId: string, type:string, comment: IComment) => void;
}

const commentKey = () => `comment:${global.window.location.href}`;

const PostCommentForm: FC<IPostCommentFormProps> = (props) => {
	const { className, setCurrentState } = props;
	const { id, username, picture } = useUserDetailsContext();
	const { comments, setComments, setTimelines } = useCommentDataContext();
	const { postData: { postIndex, postType, track_number } } = usePostDataContext();
	const [content, setContent] = useState(global.window.localStorage.getItem(commentKey()) || '');
	const [form] = Form.useForm();
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [openModal,setModalOpen]=useState(false);
	const [isComment,setIsComment]=useState(false);
	const [sentiment,setSentiment]=useState<number>(3);
	const [isSentimentPost,setIsSentimentPost]=useState(false);

	const onContentChange = (content: string) => {
		setContent(content);
		global.window.localStorage.setItem(commentKey(), content);
		return content.length ? content : null;
	};

	const createSubscription = async (postId: number | string) => {
		const { data , error } = await nextApiClientFetch<ChangeResponseType>( 'api/v1/auth/actions/postSubscribe', { post_id: postId, proposalType: postType });
		if(error) console.error('Error subscribing to post', error);
		if(data) console.log(data.message);
	};

	const handleModalOpen=async() => {
		await form.validateFields();
		const content = form.getFieldValue('content');
		if(!content) return;
		setModalOpen(true);
	};

	const handleSave = async () => {
		await form.validateFields();
		const content = form.getFieldValue('content');
		if (!content) return;
		setError('');
		setContent('');
		form.resetFields();
		form.setFieldValue('content', '');
		global.window.localStorage.removeItem(commentKey());
		postIndex && createSubscription(postIndex);
		const commentId = v4();
		const comment=  {
			comment_reactions: {
				'👍': {
					count: 0,
					usernames: []
				},
				'👎': {
					count: 0,
					usernames: []
				}
			},
			content,
			created_at: new Date(),
			history: [],
			id: commentId || '',
			isError: false,
			profile: picture || '',
			replies: [],
			sentiment:isSentimentPost? sentiment : 0,
			updated_at: new Date(),
			user_id: id as any,
			username: username || ''
		};
		setCurrentState && setCurrentState(postIndex.toString(), getSubsquidLikeProposalType(postType as any), comment);
		console.log(comments, setTimelines);
		try {
			const { data, error } = await nextApiClientFetch<IAddPostCommentResponse>('api/v1/auth/actions/addPostComment', {
				content,
				postId: postIndex,
				postType: postType,
				sentiment: isSentimentPost ? sentiment : 0,
				trackNumber: track_number,
				userId: id
			});
			if (error || !data) {
				console.error('API call failed:', error);
				setError(error || 'No data returned from the saving comment query');
				setComments((prev) => {
					const key = `${postIndex}_${ getSubsquidLikeProposalType(postType)}`;
					const payload = Object.assign(prev, {});
					payload[key] = prev[key].map( comment => comment.id === commentId ? { ...comment, isError: true } : comment);
					return payload;
				});
				queueNotification({
					header: 'Failed!',
					message: error,
					status: NotificationStatus.ERROR
				});
			} else {
				comment.id = data.id || '';
				queueNotification({
					header: 'Success!',
					message: 'Comment created successfully.',
					status: NotificationStatus.SUCCESS
				});
			}
		} catch (error) {
			console.error('Error while saving comment:', error);
			setError('An unexpected error occurred.');
		} finally {
			setLoading(false);
			setIsComment(false);
			setIsSentimentPost(false);
			setSentiment(3);
		}
	};

	useEffect(() => {
		isComment && handleSave();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[isComment]);

	if (!id) return <div>You must log in to comment.</div>;

	return (
		<div className={className}>
			<UserAvatar
				className='mt-4 hidden md:inline-block'
				username={username || ''}
				size={'large'}
				id={id}
			/>

			<div className='comment-box bg-white p-[1rem]'>
				{error && <ErrorAlert errorMsg={error} className='mb-2' />}
				<Form
					form={form}
					name="comment-content-form"
					layout="vertical"
					onFinish={handleModalOpen}
					initialValues={{
						content
					}}
					disabled={loading}

					validateMessages= {
						{ required: "Please add the  '${name}'" }
					}
				>
					<ContentForm  onChange = {(content : any) => onContentChange(content)} height={200} />
					<Form.Item>
						<div className='flex items-center justify-end mt-[-40px]'>
							<Button disabled={!content} loading={loading} htmlType="submit" className={`mt-4 bg-pink_primary text-white border-white hover:bg-pink_secondary flex items-center my-0 ${!content ? 'bg-gray-500 hover:bg-gray-500' : ''}`}>
								<CheckOutlined /> Comment
							</Button>
						</div>
					</Form.Item>
				</Form>
			</div>
			{openModal && <CommentSentimentModal
				setSentiment={setSentiment}
				openModal={openModal}
				setModalOpen={setModalOpen}
				setIsComment={setIsComment}
				setIsSentimentPost={setIsSentimentPost}
				sentiment={sentiment}
			/>}
		</div>
	);
};

export default styled(PostCommentForm)`
	display: flex;
	margin: 2rem 0;

	.comment-box {
		width: calc(100% - 60px);
		
		@media only screen and (max-width: 768px) {
			width: calc(100%);
			padding: 0.5rem;
		}
	}

	.button-container {
		width: 100%;
		display: flex;
		justify-content: flex-end;
	}
`;
