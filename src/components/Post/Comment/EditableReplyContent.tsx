// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckOutlined, CloseOutlined, DeleteOutlined, FormOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button, Form, Tooltip } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import ContentForm from 'src/components/ContentForm';
import { UserDetailsContext } from 'src/context/UserDetailsContext';
import { EReportType, NotificationStatus } from 'src/types';
import Markdown from 'src/ui-components/Markdown';
import queueNotification from 'src/ui-components/QueueNotification';
import styled from 'styled-components';
import ReplyIcon from '~assets/icons/reply.svg';

import { MessageType } from '~src/auth/types';
import { useApiContext, useCommentDataContext, useNetworkContext, usePostDataContext } from '~src/context';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

import ReportButton from '../ActionsBar/ReportButton';
import { IAddCommentReplyResponse } from 'pages/api/v1/auth/actions/addCommentReply';
import getOnChainUsername from '~src/util/getOnChainUsername';
import getEncodedAddress from '~src/util/getEncodedAddress';

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
	const { id, username, picture, loginAddress , allowed_roles } = useContext(UserDetailsContext);
	const { api, apiReady } = useApiContext();
	const { network } = useNetworkContext();
	const { comments, setComments } = useCommentDataContext();

	const [form] = Form.useForm();
	const [replyToreplyForm] = Form.useForm();

	const [isEditing, setIsEditing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [isReplying,setIsReplying] = useState(false);
	const [onChainUsername, setOnChainUsername] = useState<string>('');

	const toggleEdit = () => setIsEditing(!isEditing);

	const { postData: {
		postType, postIndex, track_number
	} } = usePostDataContext();

	useEffect(() => {
		const localContent = global.window.localStorage.getItem(editReplyKey(replyId)) || '';
		form.setFieldValue('content', localContent || content || '');
	}, [content, form, replyId]);

	useEffect(() => {
		(async () => {
			if(!api || !apiReady || !proposer) return;
			const onChainUsername = await getOnChainUsername(api, proposer, network === 'kilt');
			setOnChainUsername(onChainUsername);
		})();
	}, [api, apiReady, network, proposer]);

	useEffect(() => {
		let usernameContent = '';

		if(!is_custom_username && onChainUsername && proposer) {
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
		if(!newContent) return;

		setIsEditing(false);

		setLoading(true);
		const { data, error: editReplyError } = await nextApiClientFetch<MessageType>('api/v1/auth/actions/editCommentReply', {
			commentId,
			content: newContent,
			postId: ((reply.post_index || reply.post_index === 0)? reply.post_index: postIndex),
			postType: reply.post_type || postType,
			replyId,
			trackNumber: track_number,
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
			const keys = Object.keys(comments);
			setComments((prev:any) => {
				const comments:any = Object.assign({}, prev);
				for(const key of keys ){
					let flag = false;
					if (prev?.[key]) {
						comments[key] = prev[key].map((comment:any) => {
							if (comment.id === commentId) {
								if (comment?.replies && Array.isArray(comment.replies)) {
									comment.replies = comment.replies.map((reply:any) => {
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
					if(flag){
						break;
					}
				}
				return comments;
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
			if(data) {
				setError('');
				global.window.localStorage.removeItem(newReplyKey(commentId));
				const keys = Object.keys(comments);
				setComments((prev:any) => {
					const comments:any = Object.assign({}, prev);
					for(const key of keys ){
						let flag = false;
						if (prev?.[key]) {
							comments[key] = prev[key].map((comment:any) => {
								if (comment.id === commentId) {
									if (comment?.replies && Array.isArray(comment.replies)) {
										comment.replies = [...comment.replies,{
											content: replyContent,
											created_at: new Date(),
											id:data.id,
											proposer: loginAddress,
											updated_at: new Date(),
											user_id: id,
											user_profile_img: picture || '',
											username: username
										}];
									}
									flag = true;
								}
								return {
									...comment
								};
							});
						}
						if(flag){
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
			}
			setLoading(false);
		}
	};

	const removeReplyContent = () => {
		const keys = Object.keys(comments);
		setComments((prev:any) => {
			const comments:any = Object.assign({}, prev);
			for(const key of keys ){
				let flag = false;
				if (prev?.[key]) {
					comments[key] = prev[key].map((comment:any) => {
						if (comment.id === commentId) {
							comment.replies = comment?.replies?.filter((reply:any) => (reply.id !== replyId)) || [];
							flag = true;
						}
						return {
							...comment
						};
					});
				}
				if(flag){
					break;
				}
			}
			return comments;
		});
		queueNotification({
			header: 'Success!',
			message: 'The reply has been deleted.',
			status: NotificationStatus.SUCCESS
		});
	};

	const deleteReply = async () => {
		setLoading(true);
		const { data, error: deleteReplyError } = await nextApiClientFetch<MessageType>('api/v1/auth/actions/deleteCommentReply', {
			commentId,
			postId: ((reply.post_index || reply.post_index === 0)? reply.post_index: postIndex),
			postType: reply.post_type || postType,
			replyId,
			userId: id
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
			removeReplyContent();
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
							<ContentForm
								autofocus={true}
								onChange={(content: string) => {
									global.window.localStorage.setItem(editReplyKey(replyId), content);
									return content.length ? content : null;
								}}
							/>
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
								{
									id === userId ? <Button className={'text-pink_primary flex items-center border-none shadow-none text-xs'} onClick={deleteReply}><DeleteOutlined />Delete</Button>
										:
										allowed_roles?.includes('moderator') && ['polkadot', 'kusama'].includes(network) && <ReportButton isDeleteModal={true} proposalType={postType} className={'flex items-center shadow-none text-slate-400 text-[10px] leading-4 ml-[-7px] h-[17.5px] w-[100%] rounded-none hover:bg-transparent '} type={EReportType.REPLY} onSuccess={removeReplyContent} commentId={commentId} replyId={replyId} postId={postIndex}/>
								}
								{id && !isEditing && <ReportButton className='text-xs' proposalType={postType} postId={postIndex} commentId={commentId} type='reply' replyId={replyId} />}

								{id? (reply.reply_source === 'subsquare'?(<Tooltip title='Reply are disabled for imported comments.' color='#E5007A'>
									<Button className={`text-pink_primary flex items-center justify-start shadow-none text-xs border-none mt-[-2px] pl-1 pr-1 ${reply.reply_source ? 'disabled-reply' : ''}` }>
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
