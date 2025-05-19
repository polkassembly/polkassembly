// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckOutlined, CloseOutlined, DeleteOutlined, FormOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button, Form, MenuProps } from 'antd';
import { Dropdown } from '~src/ui-components/Dropdown';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { EReportType, NotificationStatus } from 'src/types';
import Markdown from 'src/ui-components/Markdown';
import queueNotification from 'src/ui-components/QueueNotification';
import styled from 'styled-components';
import ReplyIcon from '~assets/icons/reply.svg';
import ReplyIconDark from '~assets/icons/reply-dark.svg';
import { Caution } from '~src/ui-components/CustomIcons';

import { MessageType } from '~src/auth/types';
import { useApiContext, useCommentDataContext, usePeopleChainApiContext, usePostDataContext } from '~src/context';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useTheme } from 'next-themes';

import ReportButton from '../ActionsBar/ReportButton';
import { IAddCommentReplyResponse } from 'pages/api/v1/auth/actions/addCommentReply';
import getOnChainUsername from '~src/util/getOnChainUsername';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { IconRetry } from '~src/ui-components/CustomIcons';
import { v4 } from 'uuid';
import { checkIsProposer } from '../utils/checkIsProposer';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { dmSans } from 'pages/_app';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import MANUAL_USERNAME_25_CHAR from '~src/auth/utils/manualUsername25Char';
import { IComment } from './Comment';
import CommentReactionBar from '../ActionsBar/Reactionbar/CommentReactionBar';
import ThreeDotsIcon from '~assets/icons/three-dots.svg';
import Tooltip from '~src/basic-components/Tooltip';
import ThreeDotsIconDark from '~assets/icons/three-dots-dark.svg';
import getIsCommentAllowed from './utils/getIsCommentAllowed';
import { ProposalType } from '~src/global/proposalType';
import getMarkdownContent from '~src/api-utils/getMarkdownContent';
import MarkdownEditor from '~src/components/Editor/MarkdownEditor';
import { MDXEditorMethods } from '@mdxeditor/editor';
import { v2SupportedNetworks } from '~src/global/networkConstants';
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
	isSubsquareUser: boolean;
	isReactionOnReply?: boolean;
	comment: IComment;
	BountyPostIndex?: number;
	isUsedInBounty?: boolean;
}

const editReplyKey = (replyId: string) => `reply:${replyId}:${global.window.location.href}`;
const newReplyKey = (commentId: string) => `reply:${commentId}:${global.window.location.href}`;

const EditableReplyContent = ({
	isSubsquareUser,
	isReactionOnReply,
	userId,
	className,
	commentId,
	content,
	replyId,
	userName,
	reply,
	proposer,
	is_custom_username,
	BountyPostIndex,
	isUsedInBounty
}: Props) => {
	const { id, username, picture, loginAddress, addresses, allowed_roles, isUserOnchainVerified } = useUserDetailsSelector();
	const { api, apiReady } = useApiContext();
	const { peopleChainApi, peopleChainApiReady } = usePeopleChainApiContext();

	const { resolvedTheme: theme } = useTheme();
	const { network } = useNetworkSelector();
	const { comments, setComments } = useCommentDataContext();

	const [replyToreplyForm] = Form.useForm();

	const [isEditing, setIsEditing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [isReplying, setIsReplying] = useState(false);
	const [onChainUsername, setOnChainUsername] = useState<string>('');
	const [isEditable, setIsEditable] = useState(false);
	const [isCommentAllowed, setCommentAllowed] = useState<boolean>(false);
	const [editableReplyContent, setEditableReplyContent] = useState<string>(getMarkdownContent(content || ''));
	const [replyToReplyContent, setReplyToReplyContent] = useState<string>('');

	const toggleEdit = () => setIsEditing(!isEditing);
	const markdownEditorReplyRef = useRef<MDXEditorMethods | null>(null);
	const markdownEditorReplyToReplyRef = useRef<MDXEditorMethods | null>(null);

	const postDataContext = usePostDataContext();
	const postData = postDataContext?.postData || {};

	const postType = isUsedInBounty ? ProposalType.USER_CREATED_BOUNTIES : postData?.postType;
	const postIndex = isUsedInBounty ? BountyPostIndex : postData?.postIndex;
	const track_number = isUsedInBounty ? null : postData?.track_number;
	const allowedCommentors = isUsedInBounty ? null : postData?.allowedCommentors;
	const proposerId = isUsedInBounty ? null : postData?.userId;

	useEffect(() => {
		if (isUsedInBounty) {
			setCommentAllowed(true);
		} else {
			allowedCommentors && setCommentAllowed(id === proposerId ? true : getIsCommentAllowed(allowedCommentors, !!loginAddress && isUserOnchainVerified));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [allowedCommentors, loginAddress, isUserOnchainVerified]);

	useEffect(() => {
		const localContent = getMarkdownContent(global.window.localStorage.getItem(editReplyKey(replyId)) || '') || '';
		setEditableReplyContent(localContent || content || '');
	}, [content, replyId]);

	useEffect(() => {
		(async () => {
			if (!api || !proposer || !apiReady) return;
			const onChainUsername = await getOnChainUsername({ address: proposer, api: peopleChainApi ?? api, getWeb3Name: network === 'kilt' });
			setOnChainUsername(onChainUsername);
		})();
	}, [api, apiReady, network, proposer, peopleChainApi, peopleChainApiReady]);

	useEffect(() => {
		let usernameContent = '';
		if (!!onChainUsername && !!proposer) {
			usernameContent = `[@${onChainUsername}](${global.window.location.origin}/${getEncodedAddress(proposer, network)})`;
		} else if (!onChainUsername && !!proposer && !(is_custom_username || MANUAL_USERNAME_25_CHAR.includes(userName || '') || userName?.length !== 25)) {
			usernameContent = `[@${getEncodedAddress(proposer, network)}](${global.window.location.origin}/address/${getEncodedAddress(proposer, network)})`;
		} else {
			usernameContent = `[@${userName}](${global.window.location.origin}/user/${userName})`;
		}

		setReplyToReplyContent(`${usernameContent}&nbsp;`);
	}, [is_custom_username, network, onChainUsername, proposer, replyToreplyForm, userName, username]);

	const handleCancel = () => {
		toggleEdit();
		global.window.localStorage.removeItem(editReplyKey(replyId));
		setEditableReplyContent('');
		markdownEditorReplyRef.current?.setMarkdown('');
	};
	const handleReplyCancel = () => {
		global.window.localStorage.removeItem(newReplyKey(commentId));
		setIsReplying(!isReplying);
	};

	const canEditComment = useCallback(async () => {
		if (v2SupportedNetworks.includes(network)) return;
		if (id === userId) {
			return setIsEditable(true);
		}
		if (!proposer) {
			return setIsEditable(false);
		}
		let isProposer = proposer && addresses?.includes(getSubstrateAddress(proposer) || proposer);
		if (!isProposer) {
			isProposer = await checkIsProposer(getSubstrateAddress(proposer) || proposer, [...(addresses || loginAddress)]);
			if (isProposer) {
				return setIsEditable(true);
			}
		}
		return setIsEditable(false);
	}, [addresses, id, loginAddress, proposer, userId, network]);

	const handleSave = async () => {
		const newContent = editableReplyContent;
		if (!newContent) return;
		setError('');
		global.window.localStorage.removeItem(editReplyKey(replyId));
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
			trackNumber: track_number
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
		global.window.localStorage.setItem(editReplyKey(replyId), newContent);
	};

	const handleRetry = async () => {
		if (!replyToReplyContent) return;
		const { data, error } = await nextApiClientFetch<IAddCommentReplyResponse>('api/v1/auth/actions/addCommentReply', {
			commentId: commentId,
			content: replyToReplyContent,
			postId: reply.post_index || reply.post_index === 0 ? reply.post_index : postIndex,
			postType: reply.post_type || postType,
			trackNumber: track_number,
			userId: id
		});
		if (error || !data) {
			setError('There was an error in saving your reply.');
			console.error('Error saving reply: ', error);
			queueNotification({
				header: 'Error!',
				message: error || 'There was an error in saving your reply.',
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
											reply.content = editableReplyContent;
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
		if (!replyToReplyContent) return;
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
										content: replyToReplyContent,
										created_at: new Date(),
										id: replyId,
										proposer: loginAddress,
										reply_reactions: {
											'👍': {
												count: 0,
												usernames: []
											},
											'👎': {
												count: 0,
												usernames: []
											}
										},
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

		setIsReplying(false);
		queueNotification({
			header: 'Success!',
			message: 'Your reply was added.',
			status: NotificationStatus.SUCCESS
		});

		if (id) {
			const { data, error } = await nextApiClientFetch<IAddCommentReplyResponse>('api/v1/auth/actions/addCommentReply', {
				commentId: commentId,
				content: replyToReplyContent,
				postId: reply.post_index || reply.post_index === 0 ? reply.post_index : postIndex,
				postType: reply.post_type || postType,
				trackNumber: track_number,
				userId: id
			});
			if (error || !data) {
				setError('There was an error in saving your reply.');
				console.error('Error saving reply: ', error);
				queueNotification({
					header: 'Error!',
					message: error || 'There was an error in saving your reply.',
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

	const removeReplyContent = () => {
		const keys = Object.keys(comments);
		setComments((prev: any) => {
			const comments: any = Object.assign({}, prev);
			for (const key of keys) {
				let flag = false;
				if (prev?.[key]) {
					comments[key] = prev[key].map((comment: any) => {
						if (comment.id === commentId) {
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

	const items: MenuProps['items'] = [
		isEditable
			? {
					key: 1,
					label: (
						<button
							className={'flex cursor-pointer items-center border-none bg-transparent p-0 text-pink_primary shadow-none dark:text-blue-dark-helper'}
							disabled={loading}
							onClick={toggleEdit}
						>
							{loading ? (
								<span className='flex items-center text-xs'>
									<LoadingOutlined className='mr-1' /> Editing
								</span>
							) : (
								<span className='flex items-center text-xs'>
									<FormOutlined className='mr-1 dark:text-blue-dark-helper' /> Edit
								</span>
							)}
						</button>
					)
			  }
			: null,
		id === userId && !v2SupportedNetworks.includes(network)
			? {
					key: 2,
					label: (
						<button
							className={'flex cursor-pointer items-center border-none bg-transparent p-0 text-xs text-pink_primary shadow-none dark:text-blue-dark-helper'}
							onClick={deleteReply}
						>
							<DeleteOutlined />
							<span className='m-0 p-1'>Delete</span>
						</button>
					)
			  }
			: allowed_roles?.includes('moderator') && ['polkadot', 'kusama'].includes(network)
			? {
					key: 2,
					label: (
						<ReportButton
							isDeleteModal={true}
							proposalType={(reply.post_type as any) || postType}
							className={`flex w-[100%] items-center rounded-none text-xs leading-4 text-pink_primary shadow-none hover:bg-transparent dark:text-blue-dark-helper ${dmSans.variable} ${dmSans.className}`}
							type={EReportType.REPLY}
							onSuccess={removeReplyContent}
							commentId={commentId}
							replyId={replyId}
							postId={(reply.post_index as any) || postIndex}
						/>
					)
			  }
			: null,
		id && id !== userId && !isEditing
			? {
					key: 3,
					label: (
						<ReportButton
							className='text-xs text-pink_primary dark:text-blue-dark-helper'
							proposalType={postType}
							postId={postIndex}
							commentId={commentId}
							type='reply'
							replyId={replyId}
						/>
					)
			  }
			: null
	];

	useEffect(() => {
		canEditComment();
	}, [canEditComment]);

	return (
		<>
			<div className={className}>
				{error && <div>{error}</div>}
				{isEditing ? (
					<Form
						name='reply-content-form'
						onFinish={handleSave}
						layout='vertical'
						// disabled={formDisabled}
						validateMessages={{ required: "Please add the '${name}'" }}
					>
						<MarkdownEditor
							key={'edit-reply-content-editor'}
							editorRef={markdownEditorReplyRef}
							autofocus={true}
							height={200}
							onChange={(content: string) => {
								global.window.localStorage.setItem(editReplyKey(replyId), content);
								setEditableReplyContent(content);
							}}
							value={editableReplyContent}
						/>
						<Form.Item>
							<div className='mt-4 flex items-center justify-end'>
								<Button
									htmlType='button'
									onClick={handleCancel}
									className='mr-2 flex items-center dark:border-borderColorDark dark:bg-transparent dark:text-white'
								>
									<CloseOutlined /> Cancel
								</Button>
								<Button
									htmlType='submit'
									className='flex items-center border-white bg-pink_primary text-white hover:bg-pink_secondary dark:border-[#3B444F] dark:border-borderColorDark'
								>
									<CheckOutlined /> Reply
								</Button>
							</div>
						</Form.Item>
					</Form>
				) : (
					<>
						<Markdown
							theme={theme}
							className='rounded-b-md bg-[#ebf0f5] px-2 py-2 text-sm dark:bg-[#141416] md:px-4'
							md={content}
							isUsedInComments={true}
						/>
						<div className=' flex flex-wrap items-center gap-1'>
							<CommentReactionBar
								className='reactions mr-0'
								commentId={commentId}
								comment_reactions={reply.reply_reactions}
								importedReactions={isSubsquareUser}
								replyId={replyId}
								isReactionOnReply={isReactionOnReply}
							/>
							<div className='item-center flex flex-wrap gap-3'>
								{id && !v2SupportedNetworks.includes(network) ? (
									reply.reply_source === 'subsquare' ? (
										<Tooltip
											title='Reply are disabled for imported comments.'
											color='#E5007A'
										>
											<Button
												disabled={!isCommentAllowed}
												className={`mt-[-2px] flex items-center justify-start border-none bg-transparent pl-1 pr-1 text-xs text-pink_primary shadow-none dark:text-blue-dark-helper ${
													reply.reply_source ? 'disabled-reply' : ''
												} ${!isCommentAllowed ? 'opacity-50' : ''}`}
											>
												{theme === 'dark' ? <ReplyIconDark className='mr-1 ' /> : <ReplyIcon className='mr-1 text-pink_primary ' />} Reply
											</Button>
										</Tooltip>
									) : (
										!isReplying && (
											<Button
												disabled={!isCommentAllowed}
												className={`flex items-center border-none bg-transparent p-0 text-xs text-pink_primary shadow-none dark:text-blue-dark-helper ${
													!isCommentAllowed ? 'opacity-50' : ''
												}`}
												onClick={() => setIsReplying(!isReplying)}
											>
												{theme === 'dark' ? <ReplyIconDark className='mr-1 ' /> : <ReplyIcon className='mr-1 text-pink_primary ' />}
												Reply
											</Button>
										)
									)
								) : null}
							</div>
							<Dropdown
								theme={theme}
								className={`${dmSans.variable} ${dmSans.className} dropdown flex cursor-pointer`}
								overlayClassName='sentiment-dropdown z-[1056]'
								placement='bottomRight'
								menu={{ items }}
							>
								{theme === 'dark' ? (
									<ThreeDotsIconDark className='ml-[6px] mt-[-1px] rounded-xl hover:bg-pink-100' />
								) : (
									<ThreeDotsIcon className='ml-[6px] mt-[-1px] rounded-xl hover:bg-pink-100' />
								)}
							</Dropdown>
							{reply.isReplyError && (
								<div className='-mt-1 ml-auto flex text-xs text-lightBlue dark:text-blue-dark-medium'>
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
								<MarkdownEditor
									key={'add-reply-to-reply-content-editor'}
									editorRef={markdownEditorReplyToReplyRef}
									height={200}
									autofocus={true}
									onChange={(content: string) => {
										global.window.localStorage.setItem(newReplyKey(commentId), content);
										setReplyToReplyContent(content);
									}}
									value={replyToReplyContent}
								/>
								<Form.Item>
									<div className='mt-4 flex items-center justify-end'>
										<Button
											htmlType='button'
											onClick={() => handleReplyCancel()}
											className='mr-2 flex items-center dark:border-borderColorDark dark:bg-transparent dark:text-white'
										>
											<CloseOutlined /> Cancel
										</Button>
										<Button
											loading={loading}
											onClick={() => handleReplySave()}
											className='flex items-center bg-pink_primary text-white hover:bg-pink_secondary dark:border-none'
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
	@media (max-width: 442px) and (min-width: 319px) {
		.replies-buttons-container {
			gap: 0 4px !important;
			display: block !important;
		}
		.reply-buttons-container {
			gap: 0 4px !important;
			margin-left: 6px !important;
			margin-top: -12px !important;
		}
	}
`;
