// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Dropdown, Form, MenuProps } from 'antd';
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
import ThreeDotsIcon from '~assets/icons/three-dots.svg';
import DeleteIcon from '~assets/icons/delete.svg';
import EditIcon from '~assets/icons/edit-i.svg';
import CopyIcon from '~assets/icons/copy.svg';
import ReplyIcon from '~assets/icons/reply.svg';
import AgainstIcon from '~assets/icons/against.svg';
import SlightlyAgainstIcon from '~assets/icons/slightly-against.svg';
import NeutralIcon from '~assets/icons/neutral.svg';
import SlightlyForIcon from '~assets/icons/slightly-for.svg';
import ForIcon from '~assets/icons/for.svg';
import AgainstUnfilledIcon from '~assets/icons/against-unfilled.svg';
import SlightlyAgainstUnfilledIcon from '~assets/icons/slightly-against-unfilled.svg';
import NeutralUnfilledIcon from '~assets/icons/neutral-unfilled.svg';
import SlightlyForUnfilledIcon from '~assets/icons/slightly-for-unfilled.svg';
import ForUnfilledIcon from '~assets/icons/for-unfilled.svg';
import { poppins } from 'pages/_app';

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
  sentiment:number,
	setSentiment:(pre:number)=>void;
	prevSentiment:number;
}

const EditableCommentContent: FC<IEditableCommentContentProps> = (props) => {
	const { network } = useContext(NetworkContext);

	const { userId, className, comment, content, commentId,sentiment,setSentiment,prevSentiment } = props;
	const { setPostData } = usePostDataContext();
	const { asPath } = useRouter();
	const [isSentimentUpdate,setIsSentimentUpdate]=useState(false);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [openSentiment,setOpenSentiment]=useState(true);

	const [isEditing, setIsEditing] = useState(false);
	const { id, username, picture } = useUserDetailsContext();
	const toggleEdit = () => setIsEditing(!isEditing);
	const [errorReply, setErrorReply] = useState('');
	const [loadingReply, setLoadingReply] = useState(false);

	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const [openDropdown,setOpenDropdown]=useState(false);

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
			sentiment:isSentimentUpdate?sentiment:prevSentiment,
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
	const items:MenuProps['items']=[
		id === userId ? {
			key:1,
			label:<div className={`items-center shadow-none w-full text-[10px] text-slate-400 leading-4 ${poppins.variable} ${poppins.className} `} onClick={() => {toggleEdit();setOpenDropdown(false);}}>
				<span className='flex items-center' ><EditIcon className='mr-1' /> Edit</span>
			</div>
		}:null,
		{
			key:2,
			label:<div className={`flex items-center text-slate-400 shadow-none text-[10px] leading-4 ${poppins.variable} ${poppins.className} ` } onClick={() => {copyLink();setOpenDropdown(false);}}><CopyIcon  className='mr-1'/> Copy link</div>
		},
		id && !isEditing ?{
			key:3,
			label:<ReportButton className={`flex items-center shadow-none text-slate-400 text-[10px] hover:bg-gray-100 leading-4 ml-[-7px] h-[17.2px] ${poppins.variable} ${poppins.className} `}   type='comment' contentId={commentId}/>
		}:null,
		id===userId ? {
			key:4,
			label:<div className={`flex items-center shadow-none text-[10px] text-slate-400 leading-4 ml-[-1.8px] ${poppins.variable} ${poppins.className} ` } onClick={() => {deleteComment();setOpenDropdown(false);}}><DeleteIcon className='mr-1' />Delete</div>
		}:null
	];

	const handleSentimentText=() => {
		switch (sentiment){
		case 1: return 'Completely Against';
		case 2: return 'Slightly Against';
		case 3: return 'Neutral';
		case 4: return 'Slightly For';
		case 5: return 'Completely For';
		default: return 'Neutral';
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
							<ContentForm value={content} className='mb-0' />
							{openSentiment && <div className='bg-gray-100 mb-[10px] p-2 rounded-e-md mt-[-25px] h-[82px] background'>
								<div className='flex text-[12px] gap-[2px]'>Sentiment:<h5 className='text-[12px] text-blue-500'> {handleSentimentText()}</h5></div>
								<div className='flex mt-[-8px]'>
									<div className='flex justify-between'>
										<div className='cursor-pointer' onClick={() => setSentiment(1)}>{sentiment===1?<AgainstIcon className='scale-50' />:<AgainstUnfilledIcon className='scale-50 ml-[-12px]'/>}</div>
										<div className='cursor-pointer' onClick={() => setSentiment(2)}>{sentiment===2?<SlightlyAgainstIcon className='scale-50 '/>:<SlightlyAgainstUnfilledIcon className='scale-50'/>}</div>
										<div className='cursor-pointer' onClick={() => setSentiment(3)}>{sentiment===3?<NeutralIcon className='scale-50'/>:<NeutralUnfilledIcon className='scale-50'/>}</div>
										<div className='cursor-pointer' onClick={() => setSentiment(4)}>{sentiment===4?<SlightlyForIcon className='scale-50'/>:<SlightlyForUnfilledIcon  className='scale-50'/>}</div>
										<div className='cursor-pointer' onClick={() => setSentiment(5)}>{sentiment===5?<ForIcon className='scale-50'/>:<ForUnfilledIcon  className='scale-50'/>} </div>
									</div>
									<div className='flex w-[100%] items-center justify-end mt-[-6px]'>
										<Button onClick={() => {setIsSentimentUpdate(false);}} className='mr-2 flex items-center'>
											<CloseOutlined />
										</Button>
										<Button onClick={() => {setIsSentimentUpdate(true);}}  className='bg-pink_primary text-white border-white hover:bg-pink_secondary flex items-center'>
											<CheckOutlined />
										</Button>
									</div>
								</div>
							</div>}
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

							<div className='flex items-center flex-row bg-white flex-wrap gap-[10px]'>
								<CommentReactionBar
									className='reactions'
									commentId={commentId}
									comment_reactions={comment.comment_reactions}
								/>
								{
									id &&
										<Button disabled={props.disableEdit} className={ isReplying ? 'text-white bg-pink_primary text-xs' : 'text-pink_primary flex items-center border-none shadow-none text-xs' } onClick={toggleReply}>
											<ReplyIcon className='mr-1'/> Reply
										</Button>
								}
								<Dropdown

									open={openDropdown}
									onOpenChange={() => setOpenDropdown(false)}
									className={`${poppins.variable} ${poppins.className} max-w-full shrink-0 w-[81px] flex `}
									placement='bottomRight'
									menu={{ items }}
								>
									<div onClick={() => setOpenDropdown(true)}><ThreeDotsIcon/></div>
								</Dropdown>
							</div>

							{/* Add Reply Form*/}
							{errorReply && <div>{errorReply}</div>}
							{
								!props.disableEdit && <Form
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
  .background{
    background: rgba(72, 95, 125, 0.05);
    border: 1px solid rgba(72, 95, 125, 0.1);
    border-radius: 0px 0px 2px 2px;
  }
`;
