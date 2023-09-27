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
import { Caution } from '~src/ui-components/CustomIcons';

import { MessageType } from '~src/auth/types';
import { useApiContext, useCommentDataContext, useNetworkContext, usePostDataContext } from '~src/context';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

import ReportButton from '../ActionsBar/ReportButton';
import { IAddCommentReplyResponse } from 'pages/api/v1/auth/actions/addCommentReply';
import getOnChainUsername from '~src/util/getOnChainUsername';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { IconRetry } from '~src/ui-components/CustomIcons';
import { v4 } from 'uuid';
// import { v4 } from 'uuid';

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

const EditableReplyContent = ({ userId, className, commentId, content, replyId, userName, reply, proposer, is_custom_username }: Props) => {
	const { id, username, picture, loginAddress } = useContext(UserDetailsContext);
	const { api, apiReady } = useApiContext();
	const { network } = useNetworkContext();
	const { comments, setComments } = useCommentDataContext();

	const [form] = Form.useForm();
	const [replyToreplyForm] = Form.useForm();

	const [isEditing, setIsEditing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [isReplying, setIsReplying] = useState(false);
	const [onChainUsername, setOnChainUsername] = useState<string>('');

	const toggleEdit = () => setIsEditing(!isEditing);

	const {
		postData: { postType, postIndex, track_number }
	} = usePostDataContext();

	useEffect(() => {
		const localContent = global.window.localStorage.getItem(editReplyKey(replyId)) || '';
		form.setFieldValue('content', localContent || content || '');
	}, [content, form, replyId]);

	useEffect(() => {
		(async () => {
			if (!api || !apiReady || !proposer) return;
			const onChainUsername = await getOnChainUsername(api, proposer, network === 'kilt');
			setOnChainUsername(onChainUsername);
		})();
	}, [api, apiReady, network, proposer]);

	useEffect(() => {
		let usernameContent = '';

		if (!is_custom_username && onChainUsername && proposer) {
			usernameContent = `[@${onChainUsername}](${global.window.location.origin}/address/${getEncodedAddress(proposer, network)})`;
		} else if (!is_custom_username && !onChainUsername && proposer) {
			usernameContent = `[@${getEncodedAddress(proposer, network)}](${global.window.location.origin}/address/${getEncodedAddress(proposer, network)})`;
		} else {
			usernameContent = `[@${userName}](${global.window.location.origin}/user/${userName})`;
		}

		replyToreplyForm.setFieldValue('content', `${usernameContent}&nbsp;` || '');
	}, [is_custom_username, network, onChainUsername, proposer, replyToreplyForm, userName]);

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
		if (!newContent) return;
		setError('');
		global.window.localStorage.removeItem(editReplyKey(replyId));
		form.setFieldValue('content', '');
		let oldContent: any;
		const keys = Object.keys(comments);

		const getUpdatedComment = (prev: any) => {
			const comments: any = Object.assign({}, prev);
			for (const key of keys) {
				let flag = false;
				if (prev?.[key]) {
					comments[key] = prev[key].map((comment: any) => {
						if (comment.id === commentId) {
							if (comment?.replies && Array.isArray(comment.replies)) {
								comment.replies = comment.replies.map((reply: any) => {
									if (reply.id === replyId) {
										oldContent = reply.content;
										reply.content = newContent;
										reply.updated_at = new Date();
									}
									return {
										...reply
									};
								});
							}
							flag = true;
						}
						return {
							...comment
						};
					});
				}
				if (flag) {
					break;
				}
			}
			return comments;
		};
		setComments(getUpdatedComment(comments));
		setIsEditing(false);

		const { data, error: editReplyError } = await nextApiClientFetch<MessageType>('api/v1/auth/actions/editCommentReply', {
			commentId,
			content: newContent,
			postId: reply.post_index || reply.post_index === 0 ? reply.post_index : postIndex,
			postType: reply.post_type || postType,
			replyId,
			trackNumber: track_number,
			userId: id
		});

		if (editReplyError || !data) {
			console.error('Error saving reply: ', editReplyError);
			setComments((prev: any) => {
				const comments: any = Object.assign({}, prev);
				for (const key of keys) {
					let flag = false;
					if (prev?.[key]) {
						comments[key] = prev[key].map((comment: any) => {
							if (comment.id === commentId) {
								if (comment?.replies && Array.isArray(comment.replies)) {
									comment.replies = comment.replies.map((reply: any) => {
										if (reply.id === replyId) {
											reply.content = oldContent;
										}
										return {
											...reply
										};
									});
								}
								flag = true;
							}
							return {
								...comment
							};
						});
					}
					if (flag) {
						break;
					}
				}
				return comments;
			});
			queueNotification({
				header: 'Error!',
				message: 'Failed to save reply',
				status: NotificationStatus.ERROR
			});
			setError(editReplyError || 'Error in saving reply');
		} else {
			queueNotification({
				header: 'Success!',
				message: 'Your reply was edited.',
				status: NotificationStatus.SUCCESS
			});
		}
		setLoading(false);
	};

	const handleRetry = async () => {
		await replyToreplyForm.validateFields();
		const newContent = form.getFieldValue('content');
		const replyContent = replyToreplyForm.getFieldValue('content');
		if (!replyContent) return;
		const { data, error } = await nextApiClientFetch<IAddCommentReplyResponse>('api/v1/auth/actions/addCommentReply', {
			commentId: commentId,
			content: replyContent,
			postId: postIndex,
			postType: postType,
			trackNumber: track_number,
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
		if (data) {
			setError('');
			setComments((prev: any) => {
				const comments: any = Object.assign({}, prev);
				for (const key of Object.keys(comments)) {
					let flag = false;
					if (prev?.[key]) {
						comments[key] = prev[key].map((comment: any) => {
							if (comment.id === commentId) {
								if (comment?.replies && Array.isArray(comment.replies)) {
									comment.replies = comment.replies.map((reply: any) => {
										if (reply.id === replyId) {
											reply.content = newContent;
											reply.updated_at = new Date();
										}
										return {
											...reply
										};
									});
								}
								flag = true;
							}
							return {
								...comment
							};
						});
					}
					if (flag) {
						break;
					}
				}
				return comments;
			});
		}
	};

	const handleReplySave = async () => {
		await replyToreplyForm.validateFields();
		const replyContent = replyToreplyForm.getFieldValue('content');
		if (!replyContent) return;
		global.window.localStorage.removeItem(newReplyKey(commentId));
		const keys = Object.keys(comments);
		const replyId = v4();
		setComments((prev: any) => {
			const comments: any = Object.assign({}, prev);
			for (const key of keys) {
				let flag = false;
				if (prev?.[key]) {
					comments[key] = prev[key].map((comment: any) => {
						if (comment.id === commentId) {
							if (comment?.replies && Array.isArray(comment.replies)) {
								comment.replies = [
									...comment.replies,
									{
										content: replyContent,
										created_at: new Date(),
										id: replyId,
										proposer: loginAddress,
										updated_at: new Date(),
										user_id: id,
										user_profile_img: picture || '',
										username: username
									}
								];
							}
							flag = true;
						}
						return {
							...comment
						};
					});
				}
				if (flag) {
					break;
				}
			}
			return comments;
		});

		replyToreplyForm.resetFields();
		setIsReplying(false);
		queueNotification({
			header: 'Success!',
			message: 'Your reply was added.',
			status: NotificationStatus.SUCCESS
		});
		if (id) {
			const { data, error } = await nextApiClientFetch<IAddCommentReplyResponse>('api/v1/auth/actions/addCommentReply', {
				commentId: commentId,
				content: replyContent,
				postId: postIndex,
				postType: postType,
				trackNumber: track_number,
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
				setComments((prev) => {
					const comments: any = Object.assign({}, prev);
					for (const key of keys) {
						let flag = false;
						if (prev?.[key]) {
							comments[key] = prev[key].map((comment) => {
								if (comment.id === commentId) {
									if (comment?.replies && Array.isArray(comment.replies)) {
										comment.replies = comment.replies.map((reply) => (reply.id === replyId ? { ...reply, isReplyError: true } : reply));
									}
									flag = true;
								}
								return {
									...comment
								};
							});
						}
						if (flag) {
							break;
						}
					}
					return comments;
				});
			} else {
				setComments((prev) => {
					const comments: any = Object.assign({}, prev);
					for (const key of keys) {
						let flag = false;
						if (prev?.[key]) {
							comments[key] = prev[key].map((comment) => {
								if (comment.id === commentId) {
									if (comment?.replies && Array.isArray(comment.replies)) {
										comment.replies = comment.replies.map((reply) => (reply.id === replyId ? { ...reply, id: data.id } : reply));
									}
									flag = true;
								}
								return {
									...comment
								};
							});
						}
						if (flag) {
							break;
						}
					}
					return comments;
				});
			}
			setLoading(false);
		}
	};

	const deleteReply = async () => {
		let oldReplies: any;
		const keys = Object.keys(comments);
		setComments((prev: any) => {
			const comments: any = Object.assign({}, prev);
			for (const key of keys) {
				let flag = false;
				if (prev?.[key]) {
					comments[key] = prev[key].map((comment: any) => {
						if (comment.id === commentId) {
							oldReplies = comment.replies;
							comment.replies =
								comment?.replies?.map((reply: any) => {
									return reply.id !== replyId ? reply : { ...reply, content: '[Deleted]', isDeleted: true };
								}) || [];
							flag = true;
						}
						return {
							...comment
						};
					});
				}
				if (flag) {
					break;
				}
			}
			return comments;
		});
		queueNotification({
			header: 'Success!',
			message: 'Your reply was deleted.',
			status: NotificationStatus.SUCCESS
		});
		const { data, error: deleteReplyError } = await nextApiClientFetch<MessageType>('api/v1/auth/actions/deleteCommentReply', {
			commentId,
			postId: reply.post_index || reply.post_index === 0 ? reply.post_index : postIndex,
			postType: reply.post_type || postType,
			replyId,
			trackNumber: track_number
		});

		if (deleteReplyError || !data) {
			setComments((prev: any) => {
				const comments: any = Object.assign({}, prev);
				for (const key of keys) {
					let flag = false;
					if (prev?.[key]) {
						comments[key] = prev[key].map((comment: any) => {
							if (comment.id === commentId) {
								comment.replies = oldReplies;
								flag = true;
							}
							return {
								...comment
							};
						});
					}
					if (flag) {
						break;
					}
				}
				return comments;
			});
			console.error('Error deleting reply: ', deleteReplyError);
			queueNotification({
				header: 'Error!',
				message: deleteReplyError || 'Error in deleting reply',
				status: NotificationStatus.ERROR
			});
		}
		setLoading(false);
	};

	return (
		<>
			<div className={className}>
				{error && <div>{error}</div>}
				{isEditing ? (
					<Form
						form={form}
						name='reply-content-form'
						onFinish={handleSave}
						layout='vertical'
						// disabled={formDisabled}
						validateMessages={{ required: "Please add the '${name}'" }}
					>
						<ContentForm
							autofocus={true}
							onChange={(content: string) => {
								global.window.localStorage.setItem(editReplyKey(replyId), content);
								return content.length ? content : null;
							}}
						/>
						<Form.Item>
							<div className='flex items-center justify-end'>
								<Button
									htmlType='button'
									onClick={handleCancel}
									className='mr-2 flex items-center'
								>
									<CloseOutlined /> Cancel
								</Button>
								<Button
									htmlType='submit'
									className='flex items-center border-white bg-pink_primary text-white hover:bg-pink_secondary'
								>
									<CheckOutlined /> Reply
								</Button>
							</div>
						</Form.Item>
					</Form>
				) : (
					<>
						<Markdown
							className='bg-blue-grey rounded-b-md px-2 py-2 text-sm md:px-4'
							md={content}
						/>
						<div className='flex flex-wrap items-center'>
							{id === userId && (
								<Button
									className={'flex items-center border-none text-pink_primary shadow-none'}
									disabled={loading}
									onClick={toggleEdit}
								>
									{loading ? (
										<span className='flex items-center text-xs'>
											<LoadingOutlined className='mr-2' /> Editing
										</span>
									) : (
										<span className='flex items-center text-xs'>
											<FormOutlined className='mr-2' /> Edit
										</span>
									)}
								</Button>
							)}
							{id === userId && (
								<Button
									className={'-ml-[25px] -mr-4 flex items-center border-none text-xs text-pink_primary shadow-none'}
									onClick={deleteReply}
								>
									<DeleteOutlined />
									Delete
								</Button>
							)}
							{id && !isEditing && (
								<ReportButton
									className='text-xs'
									proposalType={postType}
									postId={postIndex}
									commentId={commentId}
									type='reply'
									replyId={replyId}
								/>
							)}

							{id ? (
								reply.reply_source === 'subsquare' ? (
									<Tooltip
										title='Reply are disabled for imported comments.'
										color='#E5007A'
									>
										<Button
											className={`ml-2 mt-[-2px] flex items-center justify-start border-none pl-1 pr-1 text-xs text-pink_primary shadow-none ${
												reply.reply_source ? 'disabled-reply' : ''
											}`}
										>
											<ReplyIcon className='mr-1' /> Reply
										</Button>
									</Tooltip>
								) : (
									!isReplying && (
										<Button
											className={'flex items-center border-none text-xs text-pink_primary shadow-none'}
											onClick={() => setIsReplying(!isReplying)}
										>
											<ReplyIcon className='mr-1' />
											Reply
										</Button>
									)
								)
							) : null}
							{reply.isReplyError && (
								<div className='ml-auto flex text-xs text-lightBlue'>
									<Caution className='icon-container relative top-[4px] text-2xl' />
									<span className='msg-container relative top-[4px] m-0 mr-2 p-0'>Reply not posted</span>
									<div
										onClick={handleRetry}
										className='retry-container relative flex w-[66px] cursor-pointer px-1'
										style={{ backgroundColor: '#FFF1F4', borderRadius: '13px' }}
									>
										<IconRetry className='relative top-[3px] text-2xl' />
										<span className='relative top-[3px] m-0 p-0'>Retry</span>
									</div>
								</div>
							)}
						</div>
						{isReplying && (
							<Form
								form={replyToreplyForm}
								name='reply-to-reply-form'
								layout='vertical'
								disabled={loading}
								validateMessages={{ required: "Please add the '${name}'" }}
							>
								<ContentForm
									height={250}
									autofocus={true}
									onChange={(content: string) => {
										global.window.localStorage.setItem(newReplyKey(commentId), content);
										return content.length ? content : null;
									}}
								/>
								<Form.Item>
									<div className='flex items-center justify-end '>
										<Button
											htmlType='button'
											onClick={() => handleReplyCancel()}
											className='mr-2 flex items-center'
										>
											<CloseOutlined /> Cancel
										</Button>
										<Button
											loading={loading}
											onClick={() => handleReplySave()}
											className='flex items-center border-white bg-pink_primary text-white hover:bg-pink_secondary'
										>
											<CheckOutlined />
											Reply
										</Button>
									</div>
								</Form.Item>
							</Form>
						)}
					</>
				)}
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

	.disabled-reply {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.bg-blue-grey {
		background: #ebf0f5 !important;
	}
`;
