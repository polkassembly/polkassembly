// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckOutlined, CloseOutlined, DeleteOutlined, FormOutlined, LinkOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button, Form } from 'antd';
import { useRouter } from 'next/router';
import { IAddCommentReplyResponse } from 'pages/api/v1/auth/actions/addCommentReply';
import React, { FC, useContext, useEffect, useState } from 'react';
import ContentForm from 'src/components/ContentForm';
import { NotificationStatus } from 'src/types';
import ErrorAlert from 'src/ui-components/ErrorAlert';
import Markdown from 'src/ui-components/Markdown';
import queueNotification from 'src/ui-components/QueueNotification';
import copyToClipboard from 'src/util/copyToClipboard';
import styled from 'styled-components';

import { MessageType } from '~src/auth/types';
import { usePostDataContext, useUserDetailsContext } from '~src/context';
import { NetworkContext } from '~src/context/NetworkContext';
import { ProposalType } from '~src/global/proposalType';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

import CommentReactionBar from '../ActionsBar/Reactionbar/CommentReactionBar';
import ReportButton from '../ActionsBar/ReportButton';
import { IComment } from './Comment';

interface IEditableCommentContentProps {
	userId: number,
	className?: string,
	comment: IComment,
	commentId: string,
	content: string,
	created_at: Date
	proposalType: ProposalType
	postId: number | string
	disableEdit?: boolean
}

const EditableCommentContent: FC<IEditableCommentContentProps> = (props) => {
	const { network } = useContext(NetworkContext);

	const { userId, className, comment, content, commentId } = props;
	const { setPostData } = usePostDataContext();
	const { asPath } = useRouter();

	const [isEditing, setIsEditing] = useState(false);
	const { id, username, picture } = useUserDetailsContext();
	const toggleEdit = () => setIsEditing(!isEditing);
	const [errorReply, setErrorReply] = useState('');
	const [loadingReply, setLoadingReply] = useState(false);

	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const [form] = Form.useForm();
	useEffect(() => {
		form.setFieldValue('content', content || ''); //initialValues is not working
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const [replyForm] = Form.useForm();

	const [isReplying, setIsReplying] = useState(false);
	const toggleReply = () => setIsReplying(!isReplying);

	const handleCancel = () => {
		toggleEdit();
		form.setFieldValue('content', '');
	};

	const handleReplyCancel = () => {
		toggleReply();
		replyForm.setFieldValue('content', '');
	};

	const handleSave = async () => {
		await form.validateFields();
		const newContent = form.getFieldValue('content');
		if(!newContent) return;

		setIsEditing(false);
		setLoading(true);
		const { data, error: editPostCommentError } = await nextApiClientFetch<MessageType>('api/v1/auth/actions/editPostComment', {
			commentId,
			content: newContent,
			postId: props.postId,
			postType: props.proposalType,
			userId: id
		});

		if (editPostCommentError || !data) {
			setError( editPostCommentError || 'There was an error in editing your comment.');
			queueNotification({
				header: 'Error!',
				message: 'There was an error in editing your comment.',
				status: NotificationStatus.ERROR
			});
			console.error('Error saving comment ', editPostCommentError);
		}

		if (data) {
			setError('');
			setPostData((prev) => {
				let comments: IComment[] = [];
				if (prev?.comments && Array.isArray(prev.comments)) {
					comments = prev.comments.map((comment) => {
						const newComment = comment;
						if (comment.id === commentId) {
							newComment.content = newContent;
							newComment.updated_at = new Date();
						}
						return {
							...newComment
						};
					});
				}
				return {
					...prev,
					comments: comments
				};
			});
			form.setFieldValue('content', '');
			queueNotification({
				header: 'Success!',
				message: 'Your comment was edited.',
				status: NotificationStatus.SUCCESS
			});
		}

		setLoading(false);
	};

	const handleReplySave = async () => {
		await replyForm.validateFields();
		const replyContent = replyForm.getFieldValue('content');
		if(!replyContent) return;

		if(id){
			setIsReplying(false);

			setLoadingReply(true);
			const { data, error: addCommentError } = await nextApiClientFetch<IAddCommentReplyResponse>('api/v1/auth/actions/addCommentReply', {
				commentId: commentId,
				content: replyContent,
				postId: props.postId,
				postType: props.proposalType,
				userId: id
			});

			if (addCommentError || !data) {
				setErrorReply('There was an error in saving your reply.');
				console.error('Error saving reply: ', addCommentError);
				queueNotification({
					header: 'Error!',
					message: 'There was an error in saving your reply.',
					status: NotificationStatus.ERROR
				});
			}

			if(data) {
				setErrorReply('');
				setPostData((prev) => {
					let comments: IComment[] = [];
					if (prev?.comments && Array.isArray(prev.comments)) {
						comments = prev.comments.map((comment) => {
							if (comment.id === commentId) {
								if (comment?.replies && Array.isArray(comment.replies)) {
									comment.replies.push({
										content: replyContent,
										created_at: new Date(),
										id: data.id,
										updated_at: new Date(),
										user_id: id,
										user_profile_img: picture || '',
										username: username
									});
								}
							}
							return {
								...comment
							};
						});
					}
					return {
						...prev,
						comments: comments
					};
				});
				replyForm.setFieldValue('content', '');
				queueNotification({
					header: 'Success!',
					message: 'Your reply was added.',
					status: NotificationStatus.SUCCESS
				});
			}

			setLoadingReply(false);
		}
	};

	const copyLink = () => {
		const url = `https://${network}.polkassembly.io${asPath.split('#')[0]}#${commentId}`;

		copyToClipboard(url);

		queueNotification({
			header: 'Copied!',
			message: 'Comment link copied to clipboard.',
			status: NotificationStatus.INFO
		});
	};

	const deleteComment = async () => {
		const { data, error: deleteCommentError } = await nextApiClientFetch<MessageType>('api/v1/auth/actions/deleteComment', {
			commentId,
			postId: props.postId,
			postType: props.proposalType
		});

		if (deleteCommentError || !data) {
			console.error('Error deleting comment: ', deleteCommentError);

			queueNotification({
				header: 'Error!',
				message: deleteCommentError || 'There was an error in deleting your comment.',
				status: NotificationStatus.ERROR
			});
		}

		if(data) {
			setPostData((prev) => {
				let comments: IComment[] = [];
				if (prev?.comments && Array.isArray(prev.comments)) {
					comments = prev.comments.filter((comment) => comment.id !== commentId);
				}
				return {
					...prev,
					comments: comments
				};
			});
			queueNotification({
				header: 'Success!',
				message: 'Your comment was deleted.',
				status: NotificationStatus.SUCCESS
			});
		}
	};

	return (
		<>
			<div className={className}>
				{error && <div><ErrorAlert errorMsg={error} className='mb-4' /></div>}
				{
					isEditing
						?
						<Form
							form={form}
							name="comment-content-form"
							onFinish={handleSave}
							layout="vertical"
							disabled={loading}
							validateMessages= {
								{ required: "Please add the '${name}'" }
							}
						>
							<ContentForm />
							<Form.Item>
								<div className='flex items-center justify-end'>
									<Button htmlType="button" onClick={handleCancel} className='mr-2 flex items-center'>
										<CloseOutlined /> Cancel
									</Button>
									<Button htmlType="submit" className='bg-pink_primary text-white border-white hover:bg-pink_secondary flex items-center'>
										<CheckOutlined /> Submit
									</Button>
								</div>
							</Form.Item>
						</Form>
						:
						<>
							<Markdown md={content} className='py-2 px-2 md:px-4 bg-comment_bg rounded-b-md text-sm' />

							<div className='flex items-center flex-row bg-white flex-wrap'>
								<CommentReactionBar
									className='reactions'
									commentId={commentId}
									comment_reactions={comment.comment_reactions}
								/>
								{
									id &&
										<Button disabled={props.disableEdit} className={ isReplying ? 'text-white bg-pink_primary text-xs' : 'text-pink_primary flex items-center border-none shadow-none text-xs' } onClick={toggleReply}>
											Reply
										</Button>
								}
								{id === userId &&
										<Button className={'text-pink_primary flex items-center border-none shadow-none text-xs'} disabled={props.disableEdit || loading} onClick={toggleEdit}>
											{
												loading
													? <span className='flex items-center'><LoadingOutlined className='mr-2' /> Editing</span>
													: <span className='flex items-center'><FormOutlined className='mr-2' /> Edit</span>
											}
										</Button>
								}
								{id === userId && <Button disabled={props.disableEdit} className={'text-pink_primary flex items-center border-none shadow-none text-xs'} onClick={deleteComment}><DeleteOutlined />Delete</Button>}
								{id && !isEditing && <ReportButton className='text-xs' type='comment' contentId={commentId} />}
								{<Button className={'text-pink_primary flex items-center border-none shadow-none text-xs'} onClick={copyLink}><LinkOutlined /> Copy link</Button>}
							</div>

							{/* Add Reply Form*/}
							{errorReply && <div>{errorReply}</div>}
							{
								isReplying && !props.disableEdit && <Form
									form={replyForm}
									name="reply-content-form"
									onFinish={handleReplySave}
									layout="vertical"
									disabled={loadingReply}
									validateMessages= {
										{ required: "Please add the '${name}'" }
									}
									className='mt-4'
								>
									<ContentForm />
									<Form.Item>
										<div className='flex items-center justify-end'>
											<Button htmlType="button" disabled={ loadingReply } onClick={handleReplyCancel} className='mr-2 flex items-center'>
												<CloseOutlined /> Cancel
											</Button>
											<Button htmlType="submit" disabled={ loadingReply } className='bg-pink_primary text-white border-white hover:bg-pink_secondary flex items-center'>
												<CheckOutlined /> Reply
											</Button>
										</div>
									</Form.Item>
								</Form>
							}
						</>
				}
			</div>
		</>
	);
};

export default styled(EditableCommentContent)`
	.reactions {
		display: inline-flex;
		border: none;
		padding: 0.4rem 0;
		margin: 0rem;
	}

	.replyForm {
		margin-top: 2rem;
	}
`;
