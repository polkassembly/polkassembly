// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckOutlined, CloseOutlined, DeleteOutlined, FormOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button, Form, Tooltip } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import ContentForm from 'src/components/ContentForm';
import { UserDetailsContext } from 'src/context/UserDetailsContext';
import { NotificationStatus } from 'src/types';
import Markdown from 'src/ui-components/Markdown';
import queueNotification from 'src/ui-components/QueueNotification';
import styled from 'styled-components';
import ReplyIcon from '~assets/icons/reply.svg';

import { MessageType } from '~src/auth/types';
import { usePostDataContext } from '~src/context';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

import ReportButton from '../ActionsBar/ReportButton';
import { IComment } from './Comment';
import { IAddCommentReplyResponse } from 'pages/api/v1/auth/actions/addCommentReply';

interface Props {
	userId: number;
	className?: string;
	reply: any;
	commentId: string;
	content: string;
	replyId: string;
	userName?: string;
	is_custom_username?: boolean;
	proposer?: string;
}

const editReplyKey = (replyId: string) => `reply:${replyId}:${global.window.location.href}`;
const newReplyKey = (commentId: string) => `reply:${commentId}:${global.window.location.href}`;

const EditableReplyContent = ({ userId, className, commentId, content, replyId , userName, reply, proposer, is_custom_username }: Props) => {
	const [isEditing, setIsEditing] = useState(false);
	const { id , username ,picture } = useContext(UserDetailsContext);
	const toggleEdit = () => setIsEditing(!isEditing);
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [isReplying,setIsReplying] = useState(false);
	const [replyToreplyForm] = Form.useForm();

	const { setPostData, postData: {
		postType, postIndex
	} } = usePostDataContext();

	useEffect(() => {
		const localContent = global.window.localStorage.getItem(editReplyKey(replyId)) || '';
		form.setFieldValue('content', localContent || content || ''); //
	}, [content, form, replyId]);

	useEffect(() => {
		let usernameContent = '';
		if (!is_custom_username && proposer) {
			usernameContent = `[@${proposer}](${global.window.location.origin}/address/${proposer})`;
		} else {
			usernameContent = `[@${userName}](${global.window.location.origin}/user/${userName})`;
		}
		replyToreplyForm.setFieldValue('content', `${usernameContent}&nbsp;` || '');
	}, [is_custom_username, proposer, replyToreplyForm, userName]);

	const handleCancel = () => {
		toggleEdit();
		global.window.localStorage.removeItem(editReplyKey(replyId));
		form.setFieldValue('content', '');
	};
	const handleReplyCancel = () => {
		global.window.localStorage.removeItem(newReplyKey(commentId));
		setIsReplying(!isReplying);
	};

	const handleSave = async () => {
		await form.validateFields();
		const newContent = form.getFieldValue('content');
		if(!newContent) return;

		setIsEditing(false);

		setLoading(true);
		const { data, error: editReplyError } = await nextApiClientFetch<MessageType>('api/v1/auth/actions/editCommentReply', {
			commentId,
			content: newContent,
			postId: postIndex,
			postType: postType,
			replyId,
			userId: id
		});

		if (editReplyError || !data) {
			console.error('Error saving reply: ', editReplyError);
			queueNotification({
				header: 'Error!',
				message: 'Your reply was edited.',
				status: NotificationStatus.ERROR
			});
			setError(editReplyError || 'Error in saving reply');
		}

		if (data) {
			setError('');
			global.window.localStorage.removeItem(editReplyKey(replyId));
			form.setFieldValue('content', '');
			setPostData((prev) => {
				let comments: IComment[] = [];
				if (prev?.comments && Array.isArray(prev.comments)) {
					comments = prev.comments.map((comment) => {
						if (comment.id === commentId) {
							if (comment?.replies && Array.isArray(comment.replies)) {
								comment.replies = comment.replies.map((reply) => {
									if (reply.id === replyId) {
										reply.content = newContent;
										reply.updated_at = new Date();
									}
									return {
										...reply
									};
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
			queueNotification({
				header: 'Success!',
				message: 'Your reply was edited.',
				status: NotificationStatus.SUCCESS
			});
		}

		setLoading(false);
	};

	const handleReplySave = async () => {
		await replyToreplyForm.validateFields();
		const replyContent = replyToreplyForm.getFieldValue('content');
		if(!replyContent) return;
		setLoading(true);
		if(id){
			const { data, error } = await nextApiClientFetch<IAddCommentReplyResponse>('api/v1/auth/actions/addCommentReply', {
				commentId: commentId,
				content: replyContent,
				postId: postIndex,
				postType: postType,
				userId: id
			});
			if (error || !data) {
				setError('There was an error in saving your reply.');
				console.error('Error saving reply: ', error);
				queueNotification({
					header: 'Error!',
					message: 'There was an error in saving your reply.',
					status: NotificationStatus.ERROR
				});
			}
			if(data) {
				setError('');
				global.window.localStorage.removeItem(newReplyKey(commentId));
				setPostData((prev) => {
					let comments: IComment[] = [];
					if (prev?.comments && Array.isArray(prev.comments)) {
						comments = prev.comments.map((comment) => {
							if (comment.id === commentId) {
								if (comment?.replies && Array.isArray(comment.replies)) {
									comment.replies = [...comment.replies,{
										content: replyContent,
										created_at: new Date(),
										id:data.id,
										updated_at: new Date(),
										user_id: id,
										user_profile_img: picture || '',
										username: username
									}];
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
				replyToreplyForm.resetFields();
				setIsReplying(false);
				queueNotification({
					header: 'Success!',
					message: 'Your reply was added.',
					status: NotificationStatus.SUCCESS
				});
			}
			setLoading(false);
		}
	};

	const deleteReply = async () => {
		setLoading(true);
		const { data, error: deleteReplyError } = await nextApiClientFetch<MessageType>('api/v1/auth/actions/deleteCommentReply', {
			commentId,
			postId: postIndex,
			postType: postType,
			replyId
		});

		if (deleteReplyError || !data) {
			console.error('Error deleting reply: ', deleteReplyError);
			queueNotification({
				header: 'Error!',
				message: deleteReplyError || 'Error in deleting reply',
				status: NotificationStatus.ERROR
			});
		}

		if (data) {
			setPostData((prev) => {
				let comments: IComment[] = [];
				if (prev?.comments && Array.isArray(prev.comments)) {
					comments = prev.comments.map((comment) => {
						if (comment.id === commentId) {
							comment.replies = comment?.replies?.filter((reply) => (reply.id !== replyId)) || [];
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
			queueNotification({
				header: 'Success!',
				message: 'Your reply was deleted.',
				status: NotificationStatus.SUCCESS
			});
		}
		setLoading(false);
	};

	return (
		<>
			<div className={className}>
				{error && <div>{error}</div>}
				{
					isEditing
						?
						<Form
							form={form}
							name="reply-content-form"
							onFinish={handleSave}
							layout="vertical"
							// disabled={formDisabled}
							validateMessages= {
								{ required: "Please add the '${name}'" }
							}
						>
							<ContentForm onChange={(content: string) => {
								global.window.localStorage.setItem(editReplyKey(replyId), content);
								return content.length ? content : null;
							}} />
							<Form.Item>
								<div className='flex items-center justify-end'>
									<Button htmlType="button" onClick={handleCancel} className='mr-2 flex items-center'>
										<CloseOutlined /> Cancel
									</Button>
									<Button htmlType="submit" className='bg-pink_primary text-white border-white hover:bg-pink_secondary flex items-center'>
										<CheckOutlined /> Reply
									</Button>
								</div>
							</Form.Item>
						</Form>
						:
						<>
							<Markdown className='py-2 px-2 md:px-4 bg-blue-grey rounded-b-md text-sm' md={content} />
							<div className='flex items-center flex-wrap'>
								{id === userId &&
									<Button className={'text-pink_primary flex items-center border-none shadow-none'} disabled={loading} onClick={toggleEdit}>
										{
											loading
												? <span className='flex items-center text-xs'><LoadingOutlined className='mr-2' /> Editing</span>
												: <span className='flex items-center text-xs'><FormOutlined className='mr-2' /> Edit</span>
										}
									</Button>
								}
								{id === userId && <Button className={'text-pink_primary flex items-center border-none shadow-none text-xs'} onClick={deleteReply}><DeleteOutlined />Delete</Button>}
								{id && !isEditing && <ReportButton className='text-xs' proposalType={postType} postId={postIndex} commentId={commentId} type='reply' replyId={replyId} />}

								{id? (reply.reply_source === 'subsquare'? (
									<Tooltip title='Reply are disabled for imported comments.' color='#E5007A'>
										<Button disabled={true} className='text-pink_primary flex items-center border-none shadow-none text-xs disabled-reply'>
											<ReplyIcon className='mr-1'/> Reply
										</Button>
									</Tooltip>): !isReplying && <Button className={'text-pink_primary flex items-center border-none shadow-none text-xs'} onClick={() => setIsReplying(!isReplying)}><ReplyIcon className='mr-1'/>Reply</Button>)
									: null
								}
							</div>
							{
								isReplying
										&&
										<Form
											form={replyToreplyForm}
											name="reply-to-reply-form"
											layout="vertical"
											disabled={loading}
											validateMessages= {
												{ required: "Please add the '${name}'" }
											}
										>
											<ContentForm height={250} onChange={(content: string) => {
												global.window.localStorage.setItem(newReplyKey(commentId), content);
												return content.length ? content : null;
											}}  />
											<Form.Item>
												<div className='flex items-center justify-end '>
													<Button htmlType="button" onClick={() => handleReplyCancel()} className='mr-2 flex items-center'>
														<CloseOutlined /> Cancel
													</Button>
													<Button loading={loading} onClick={() => handleReplySave()} className='bg-pink_primary text-white border-white hover:bg-pink_secondary flex items-center'>
														<CheckOutlined />Reply
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

export default styled(EditableReplyContent)`

	.button-container {
		width: 100%;
		display: flex;
		justify-content: flex-end;
	}

	.reactions {
		display: inline-flex;
		border: none;
		padding: 0.4rem 0;
		margin: 0rem;
	}

	.vl {
		display: inline-flex;
		border-left-style: solid;
		border-left-width: 1px;
		border-left-color: grey_border;
		height: 2rem;
		margin: 0 1.2rem 0 0.8rem;
	}

	.replyForm {
		margin-top: 2rem;
	}

	.disabled-reply{
		cursor:not-allowed;
		opacity: 0.5;
	}

	.bg-blue-grey{
		background: #EBF0F5 !important;
	}
`;
