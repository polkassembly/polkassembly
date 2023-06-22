// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Dropdown, MenuProps, Tooltip } from 'antd';
import { useRouter } from 'next/router';
import { IAddCommentReplyResponse } from 'pages/api/v1/auth/actions/addCommentReply';
import React, { FC, useContext, useRef, useState } from 'react';
// import ContentForm from 'src/components/ContentForm';
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
import { AgainstIcon ,SlightlyAgainstIcon,SlightlyForIcon,NeutralIcon,ForIcon,AgainstUnfilledIcon,SlightlyAgainstUnfilledIcon,NeutralUnfilledIcon,SlightlyForUnfilledIcon,ForUnfilledIcon } from '~src/ui-components/CustomIcons';

import { poppins } from 'pages/_app';
import TextEditor from '~src/ui-components/TextEditor';

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
  sentiment: number,
	setSentiment: (pre:number)=>void;
	prevSentiment: number;
	isSubsquareUser: boolean;
	userName?:string;
}

const editCommentKey = (commentId: string) => `comment:${commentId}:${global.window.location.href}`;

const replyKey = (commentId: string) => `reply:${commentId}:${global.window.location.href}`;

const EditableCommentContent: FC<IEditableCommentContentProps> = (props) => {
	const { network } = useContext(NetworkContext);

	const { userId, className, comment, content, commentId, sentiment, setSentiment, prevSentiment ,userName } = props;
	const { setPostData, postData: { postType , postIndex } } = usePostDataContext();
	const { asPath } = useRouter();

	const [isEditing, setIsEditing] = useState(false);
	const { id, username, picture } = useUserDetailsContext();
	const [errorReply, setErrorReply] = useState('');
	const [loadingReply, setLoadingReply] = useState(false);

	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [newContent, setNewContent] = useState('');
	const [replyContent, setReplyContent] = useState('');
	const [isClean, setIsClean] = useState(false);

	const currentContent=useRef<string>(content);

	const [isReplying, setIsReplying] = useState(false);

	const toggleEdit = () => {
		setIsClean(false);
		localStorage.setItem(editCommentKey(commentId), currentContent.current || '');
		setIsEditing(!isEditing);
	};

	const toggleReply = () => {
		setIsClean(false);
		localStorage.setItem(replyKey(commentId),`<p><a title="${userName}" href="${global.window.location.origin}/user/${userName}" target="_blank" rel="noopener">@${userName}</a></p>`);
		setIsReplying(!isReplying);
	};

	const handleCancel = () => {
		setSentiment(prevSentiment);
		setIsEditing(false);
		global.window.localStorage.removeItem(editCommentKey(commentId));
		setIsClean(true);
		setTimeout(() => {
			setIsClean(false);
		}, 1000);
	};

	const handleReplyCancel = () => {
		setIsReplying(false);
		global.window.localStorage.removeItem(replyKey(commentId));
		setIsClean(true);
		setTimeout(() => {
			setIsClean(false);
		}, 1000);
	};

	const handleSave = async () => {
		if(!newContent)return;
		if(currentContent.current !== newContent){
			currentContent.current=newContent;
		}
		setLoading(true);
		const { data, error: editPostCommentError } = await nextApiClientFetch<MessageType>('api/v1/auth/actions/editPostComment', {
			commentId,
			content: newContent,
			postId: props.postId,
			postType: props.proposalType,
			sentiment:sentiment,
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
							newComment.history = [{ content: newComment?.content, created_at: newComment?.created_at, sentiment: newComment?.sentiment || 0 }, ...(newComment?.history || []) ],
							newComment.content = newContent;
							newComment.updated_at = new Date();
							newComment.sentiment = sentiment || 0;
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
			global.window.localStorage.removeItem(editCommentKey(commentId));
			queueNotification({
				header: 'Success!',
				message: 'Your comment was edited.',
				status: NotificationStatus.SUCCESS
			});
			setIsEditing(false);
		}

		setLoading(false);
	};

	const handleReplySave = async () => {
		if(!replyContent) return;

		if(id){
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
				global.window.localStorage.removeItem(replyKey(commentId));
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
				setIsClean(true);
				setTimeout(() => {
					setIsClean(false);
				}, 1000);
				setIsReplying(false);
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
			label:<div className={`items-center shadow-none text-[10px] text-slate-400 leading-4  ${poppins.variable} ${poppins.className}`} onClick={toggleEdit}>
				<span className='flex items-center' ><EditIcon className='mr-1' />Edit</span>
			</div>
		}:null,
		{
			key:2,
			label:<div className={`flex items-center text-slate-400 shadow-none text-[10px] leading-4 ${poppins.variable} ${poppins.className}` } onClick={() => {copyLink();}}><CopyIcon  className='mr-1'/> Copy link</div>
		},
		id && !isEditing ?{
			key:3,
			label: <ReportButton proposalType={postType} className={`flex items-center shadow-none text-slate-400 text-[10px] leading-4 ml-[-7px] h-[17.5px] w-[100%] rounded-none hover:bg-transparent ${poppins.variable} ${poppins.className} `}  type='comment' commentId={commentId} postId={postIndex}/>
		}:null,
		id===userId ? {
			key:4,
			label:<div className={`flex items-center shadow-none text-[10px] text-slate-400 leading-4 ml-[-1.8px] ${poppins.variable} ${poppins.className} border-none` } onClick={() => {deleteComment();}}><DeleteIcon className='mr-1' />Delete</div>
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
						<>
							<TextEditor
								isDisabled={loading}
								isClean={isClean}
								value={newContent}
								imageNamePrefix={editCommentKey(commentId)}
								localStorageKey={editCommentKey(commentId)}
								onChange={(v) => {
									setNewContent(v);
								}}
							/>
							<div className='bg-gray-100 mb-[10px] p-2 h-[70px] background'>
								<div className='flex text-[12px] gap-[2px] text-[#334D6E]'>Sentiment:{' '}<h5 className='text-[12px] text-pink_primary'> {handleSentimentText()}</h5></div>
								<div className='flex items-center text-transparent'>
									<div className='flex justify-between items-center gap-[15px] border-solid'>
										<button disabled={loading} className='outline-none border-none cursor-pointer text-lg flex justify-center items-center' onClick={() => setSentiment(1)}>{sentiment===1?<AgainstIcon />:<AgainstUnfilledIcon />}</button>
										<button disabled={loading} className='outline-none border-none cursor-pointer text-lg flex justify-center items-center' onClick={() => setSentiment(2)}>{sentiment===2?<SlightlyAgainstIcon/>:<SlightlyAgainstUnfilledIcon />}</button>
										<button disabled={loading} className='outline-none border-none cursor-pointer text-lg flex justify-center items-center' onClick={() => setSentiment(3)}>{sentiment===3?<NeutralIcon />:<NeutralUnfilledIcon />}</button>
										<button disabled={loading} className='outline-none border-none cursor-pointer text-lg  flex justify-center items-center' onClick={() => setSentiment(4)}>{sentiment===4?<SlightlyForIcon />:<SlightlyForUnfilledIcon  />}</button>
										<button disabled={loading} className='outline-none border-none cursor-pointer text-lg flex justify-center items-center' onClick={() => setSentiment(5)}>{sentiment===5?<ForIcon className='text-[20px]' />:<ForUnfilledIcon  />} </button>
									</div>
									<div className='flex w-[100%] items-center justify-end '>
										<Button disabled={loading} onClick={handleCancel}  className='mr-2 flex items-center h-[26px]'>
											<CloseOutlined />
										</Button>
										<Button loading={loading} onClick={handleSave}  className='bg-pink_primary text-white border-white hover:bg-pink_secondary flex items-center h-[26px]'>
											<CheckOutlined />
										</Button>
									</div>
								</div>
							</div>
						</>
						:
						<>
							<Markdown md={content} className='py-2 px-2 md:px-4 bg-comment_bg rounded-b-md text-sm' />

							<div className='flex items-center flex-row bg-white flex-wrap gap-[1px]'>
								<CommentReactionBar
									className='reactions mr-0'
									commentId={commentId}
									comment_reactions={comment.comment_reactions}
									importedReactions={props.isSubsquareUser}
								/>
								{
									id && ( props.isSubsquareUser ?
										(<Tooltip title='Reply are disabled for imported comments.' color='#E5007A'>
											<Button disabled={props.disableEdit} className={`text-pink_primary flex items-center justify-start shadow-none text-xs border-none mt-[-2px] pl-1 pr-1 ${props.isSubsquareUser ? 'disabled-reply' : ''}` } onClick={ props.isSubsquareUser ? () => {} : toggleReply }>
												<ReplyIcon className='mr-1'/> Reply
											</Button>
										</Tooltip>)
										:
										<Button disabled={props.disableEdit} className={`text-pink_primary flex items-center justify-start shadow-none text-xs border-none mt-[-2px] pl-1 pr-1 ${props.isSubsquareUser ? 'disabled-reply' : ''}` } onClick={ props.isSubsquareUser ? () => {} : toggleReply }>
											<ReplyIcon className='mr-1'/> Reply
										</Button>
									)
								}
								<Dropdown
									className={`${poppins.variable} ${poppins.className} flex cursor-pointer dropdown`}
									overlayClassName='sentiment-dropdown'
									placement='bottomRight'
									menu={{ items }}
								>
									<ThreeDotsIcon className=' mt-[-1px] ml-[6px] hover:bg-pink-100 rounded-xl'/>
								</Dropdown>
							</div>

							{/* Add Reply Form*/}
							{errorReply && <div>{errorReply}</div>}
							{
								!props.disableEdit && isReplying && <>
									<TextEditor
										isDisabled={loadingReply}
										isClean={isClean}
										value={replyContent}
										imageNamePrefix={replyKey(commentId)}
										localStorageKey={replyKey(commentId)}
										onChange={(v) => {
											setReplyContent(v);
										}}
									/>
									<div className='flex items-center justify-end mt-4'>
										<Button disabled={ loadingReply } onClick={handleReplyCancel} className='mr-2 flex items-center'>
											<CloseOutlined /> Cancel
										</Button>
										<Button onClick={handleReplySave} loading={loadingReply} disabled={ loadingReply } className='bg-pink_primary text-white border-white hover:bg-pink_secondary flex items-center'>
											<CheckOutlined /> Reply
										</Button>
									</div>
								</>
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

  .disabled-reply{
	cursor:not-allowed;
	opacity: 0.5;
  }

  code{
	display:initial;
  }
`;
