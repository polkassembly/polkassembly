// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Form, MenuProps } from 'antd';
import { Dropdown } from '~src/ui-components/Dropdown';
import { useRouter } from 'next/router';
import { IAddCommentReplyResponse } from 'pages/api/v1/auth/actions/addCommentReply';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import ContentForm from 'src/components/ContentForm';
import { EReportType, NotificationStatus } from 'src/types';
import ErrorAlert from 'src/ui-components/ErrorAlert';
import Markdown from 'src/ui-components/Markdown';
import queueNotification from 'src/ui-components/QueueNotification';
import copyToClipboard from 'src/util/copyToClipboard';
import styled from 'styled-components';

import { MessageType } from '~src/auth/types';
import { useApiContext, useCommentDataContext, usePeopleChainApiContext, usePostDataContext } from '~src/context';
import { ProposalType, getSubsquidLikeProposalType } from '~src/global/proposalType';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

import CommentReactionBar from '../ActionsBar/Reactionbar/CommentReactionBar';
import ReportButton from '../ActionsBar/ReportButton';
import { IComment } from './Comment';

import ThreeDotsIcon from '~assets/icons/three-dots.svg';
import ThreeDotsIconDark from '~assets/icons/three-dots-dark.svg';
import DeleteIcon from '~assets/icons/delete.svg';
import EditIcon from '~assets/icons/edit-i.svg';
import ReplyIcon from '~assets/icons/reply.svg';
import ReplyIconDark from '~assets/icons/reply-dark.svg';
import {
	AgainstIcon,
	SlightlyAgainstIcon,
	SlightlyForIcon,
	NeutralIcon,
	ForIcon,
	AgainstUnfilledIcon,
	SlightlyAgainstUnfilledIcon,
	NeutralUnfilledIcon,
	SlightlyForUnfilledIcon,
	ForUnfilledIcon,
	CopyIcon
} from '~src/ui-components/CustomIcons';

import { poppins } from 'pages/_app';
import getOnChainUsername from '~src/util/getOnChainUsername';
import getEncodedAddress from '~src/util/getEncodedAddress';

import { IconRetry } from '~src/ui-components/CustomIcons';
import { Caution } from '~src/ui-components/CustomIcons';
import { v4 } from 'uuid';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { checkIsProposer } from '../utils/checkIsProposer';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import MANUAL_USERNAME_25_CHAR from '~src/auth/utils/manualUsername25Char';
import { useTheme } from 'next-themes';
import { trackEvent } from 'analytics';
import getIsCommentAllowed from './utils/getIsCommentAllowed';
import classNames from 'classnames';

interface IEditableCommentContentProps {
	userId: number;
	className?: string;
	comment: IComment;
	commentId: string;
	content: string;
	created_at: Date;
	proposalType: ProposalType;
	postId: number | string;
	disableEdit?: boolean;
	sentiment: number;
	setSentiment: (pre: number) => void;
	prevSentiment: number;
	isSubsquareUser: boolean;
	userName?: string;
	is_custom_username?: boolean;
	proposer?: string;
}

const editCommentKey = (commentId: string) => `comment:${commentId}:${global.window.location.href}`;

const replyKey = (commentId: string) => `reply:${commentId}:${global.window.location.href}`;

const EditableCommentContent: FC<IEditableCommentContentProps> = (props) => {
	const { userId, className, comment, content, commentId, sentiment, setSentiment, prevSentiment, userName, is_custom_username, proposer } = props;
	const { comments, setComments, setTimelines } = useCommentDataContext();
	const { network } = useNetworkSelector();
	const { id, username, picture, loginAddress, addresses, allowed_roles, isUserOnchainVerified } = useUserDetailsSelector();
	const { api, apiReady } = useApiContext();
	const { peopleChainApi, peopleChainApiReady } = usePeopleChainApiContext();
	const { resolvedTheme: theme } = useTheme();
	const [replyForm] = Form.useForm();
	const [form] = Form.useForm();

	const currentContent = useRef<string>(content);

	const {
		postData: { postType, postIndex, track_number, allowedCommentors, userId: proposerId }
	} = usePostDataContext();
	const { asPath } = useRouter();

	const [isEditing, setIsEditing] = useState(false);
	const toggleEdit = () => setIsEditing(!isEditing);
	const [errorReply, setErrorReply] = useState('');
	const [loadingReply, setLoadingReply] = useState(false);
	const [isEditable, setIsEditable] = useState(false);

	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [isReplying, setIsReplying] = useState(false);

	const [onChainUsername, setOnChainUsername] = useState<string>('');
	const [isCommentAllowed, setCommentAllowed] = useState<boolean>(false);

	useEffect(() => {
		const localContent = global.window.localStorage.getItem(editCommentKey(commentId)) || '';
		form.setFieldValue('content', localContent || content || ''); //initialValues is not working
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		(async () => {
			if ((!api && !peopleChainApi) || !proposer || !(apiReady && peopleChainApiReady)) return;
			const onChainUsername = await getOnChainUsername({ address: proposer, api: peopleChainApi ?? api, getWeb3Name: network === 'kilt' });
			setOnChainUsername(onChainUsername);
		})();
	}, [api, apiReady, network, proposer, peopleChainApi, peopleChainApiReady]);

	const toggleReply = async () => {
		let usernameContent = '';
		if (!!onChainUsername && !!proposer) {
			usernameContent = `[@${onChainUsername}](${global.window.location.origin}/address/${getEncodedAddress(proposer, network)})`;
		} else if (!onChainUsername && !!proposer && !(is_custom_username || MANUAL_USERNAME_25_CHAR.includes(userName || '') || userName?.length !== 25)) {
			usernameContent = `[@${getEncodedAddress(proposer, network)}](${global.window.location.origin}/address/${getEncodedAddress(proposer, network)})`;
		} else {
			usernameContent = `[@${userName}](${global.window.location.origin}/user/${userName})`;
		}
		replyForm.setFieldValue('content', `${usernameContent}&nbsp;`);
		global.window.localStorage.setItem(replyKey(commentId), usernameContent);
		setIsReplying(!isReplying);
	};

	const handleCancel = () => {
		setSentiment(prevSentiment);
		toggleEdit();
		global.window.localStorage.removeItem(editCommentKey(commentId));
		form.setFieldValue('content', currentContent.current);
	};

	const handleReplyCancel = () => {
		toggleReply();
		global.window.localStorage.removeItem(replyKey(commentId));
		replyForm.setFieldValue('content', '');
	};

	const handleSave = async () => {
		await form.validateFields();
		const newContent = form.getFieldValue('content');
		if (!newContent) return;
		setError('');
		global.window.localStorage.removeItem(editCommentKey(commentId));
		const keys = Object.keys(comments);
		setComments((prev) => {
			const comments: any = Object.assign({}, prev);
			for (const key of keys) {
				let flag = false;
				if (prev?.[key]) {
					comments[key] = prev?.[key]?.map((comment: IComment) => {
						const newComment = comment;
						if (comment.id === commentId) {
							(newComment.history = [{ content: newComment?.content, created_at: newComment?.created_at, sentiment: newComment?.sentiment || 0 }, ...(newComment?.history || [])]),
								(newComment.content = newContent);
							newComment.updated_at = new Date();
							newComment.sentiment = sentiment || 0;
							flag = true;
						}
						return {
							...newComment
						};
					});
				}
				if (flag) {
					break;
				}
			}
			queueNotification({
				header: 'Success!',
				message: 'Your comment was edited.',
				status: NotificationStatus.SUCCESS
			});
			return comments;
		});
		form.setFieldValue('content', currentContent.current);
		if (currentContent.current !== newContent) {
			currentContent.current = newContent;
		}
		setIsEditing(false);
		setLoading(true);
		const { data, error: editPostCommentError } = await nextApiClientFetch<MessageType>('api/v1/auth/actions/editPostComment', {
			commentId,
			content: newContent,
			postId: comment.post_index || comment.post_index === 0 ? comment.post_index : props.postId,
			postType: comment.post_type || props.proposalType,
			sentiment: sentiment,
			trackNumber: track_number,
			userId: id
		});

		if (editPostCommentError || !data) {
			setError(editPostCommentError || 'There was an error in editing your comment.');
			queueNotification({
				header: 'Error!',
				message: 'There was an error in editing your comment.',
				status: NotificationStatus.ERROR
			});
			console.error('Error saving comment ', editPostCommentError);
			setComments((prev) => {
				const key = `${postIndex}_${getSubsquidLikeProposalType(postType)}`;
				const payload = Object.assign(prev, {});
				payload[key] = prev[key].map((comment) => (comment.id === commentId ? { ...comment, isError: true } : comment));
				return payload;
			});
		}
		if (data) {
			setComments((prev) => {
				const key = `${postIndex}_${getSubsquidLikeProposalType(postType)}`;
				prev[key].map((comment) => (comment.id === commentId ? { ...comment, isError: false } : comment));
				return prev;
			});
		}

		setLoading(false);
	};

	const handleRetry = async () => {
		const { data, error: addCommentError } = await nextApiClientFetch<IAddCommentReplyResponse>('api/v1/auth/actions/addPostComment', {
			commentId: commentId,
			content: comment.content,
			postId: props.postId,
			postType: props.proposalType,
			trackNumber: track_number,
			userId: id
		});

		if (error || !data) {
			setErrorReply('There was an error in saving your reply.');
			console.error('Error saving reply: ', addCommentError);
			queueNotification({
				header: 'Error!',
				message: error || 'There was an error in saving your reply.',
				status: NotificationStatus.ERROR
			});
		} else {
			setComments((prev) => {
				const comments: any = Object.assign({}, prev);
				for (const key of Object.keys(comments)) {
					let flag = false;
					if (prev?.[key]) {
						comments[key] = prev?.[key]?.map((comment: IComment) => {
							const newComment = comment;
							if (comment.id === commentId) {
								newComment.isError = false;
								flag = true;
							}
							return {
								...newComment
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
		await replyForm.validateFields();
		const replyContent = replyForm.getFieldValue('content');
		if (!replyContent) return;
		setErrorReply('');
		global.window.localStorage.removeItem(replyKey(commentId));
		const keys = Object.keys(comments);
		const replyId = v4();
		const oldComment: any = Object.assign({}, comments);
		setComments((prev) => {
			const comments: any = Object.assign({}, prev);
			for (const key of keys) {
				let flag = false;
				if (prev?.[key]) {
					comments[key] = prev[key].map((comment) => {
						if (comment.id === commentId) {
							if (comment?.replies && Array.isArray(comment.replies)) {
								comment.replies.push({
									content: replyContent,
									created_at: new Date(),
									id: replyId,
									isReplyError: false,
									postIndex: postIndex,
									postType,
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
		replyForm.setFieldValue('content', '');
		queueNotification({
			header: 'Success!',
			message: 'Your reply was added.',
			status: NotificationStatus.SUCCESS
		});
		if (id) {
			setIsReplying(false);

			setLoadingReply(true);
			const { data, error: addCommentError } = await nextApiClientFetch<IAddCommentReplyResponse>('api/v1/auth/actions/addCommentReply', {
				commentId: commentId,
				content: replyContent,
				postId: comment.post_index || postIndex,
				postType: comment.post_type || postType,
				trackNumber: track_number,
				userId: id
			});

			if (addCommentError || !data) {
				setErrorReply('There was an error in saving your reply.');
				console.error('Error saving reply: ', addCommentError);
				setComments(oldComment);
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
										comment.replies = comment.replies.map((reply: any) => {
											if (reply.id === replyId) {
												reply.id = data.id;
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

	const removeCommentContent = () => {
		const keys = Object.keys(comments);
		setComments((prev) => {
			const comments: any = Object.assign({}, prev);
			for (const key of keys) {
				if (prev?.[key]) {
					comments[key] = prev[key].map((comment) => (comment.id !== commentId ? comment : { ...comment, content: '[Deleted]', isDeleted: true }));
				}
			}
			return comments;
		});
		setTimelines((prev) => {
			return [
				...prev.map((timeline) => {
					if (timeline.index === `${postIndex}` && timeline.type === getSubsquidLikeProposalType(postType)) {
						return {
							...timeline,
							commentsCount: timeline.commentsCount > 0 ? timeline.commentsCount - 1 : 0
						};
					}
					return {
						...timeline
					};
				})
			];
		});
		queueNotification({
			header: 'Success!',
			message: 'The comment was deleted.',
			status: NotificationStatus.SUCCESS
		});
	};

	const deleteComment = async () => {
		const oldComments = comments;
		const keys = Object.keys(comments);
		setComments((prev) => {
			const comments: any = Object.assign({}, prev);
			for (const key of keys) {
				if (prev?.[key]) {
					comments[key] = prev[key].map((comment) => (comment.id !== commentId ? comment : { ...comment, content: '[Deleted]', isDeleted: true }));
				}
			}
			return comments;
		});
		queueNotification({
			header: 'Success!',
			message: 'Your comment was deleted.',
			status: NotificationStatus.SUCCESS
		});
		const { data, error: deleteCommentError } = await nextApiClientFetch<MessageType>('api/v1/auth/actions/deleteComment', {
			commentId,
			postId: comment.post_index || comment.post_index === 0 ? comment.post_index : props.postId,
			postType: comment.post_type || props.proposalType,
			trackNumber: track_number
		});

		if (deleteCommentError || !data) {
			setComments(oldComments);
			console.error('Error deleting comment: ', deleteCommentError);
			queueNotification({
				header: 'Error!',
				message: deleteCommentError || 'There was an error in deleting your comment.',
				status: NotificationStatus.ERROR
			});
		}
	};

	const canEditComment = useCallback(async () => {
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
	}, [addresses, id, loginAddress, proposer, userId]);

	const items: MenuProps['items'] = [
		isEditable
			? {
					key: 1,
					label: (
						<div
							className={`items-center text-[10px] leading-4 text-slate-400 shadow-none  ${poppins.variable} ${poppins.className}`}
							onClick={() => {
								toggleEdit();
								trackEvent('comment_edit_button_clicked', 'clicked_edit_comment_cta', {
									commentId: commentId,
									userId: userId || '',
									userName: userName || ''
								});
							}}
						>
							<span className='flex items-center'>
								<EditIcon className='mr-1 text-bodyBlue dark:text-white' />
								<p className='m-0 -ml-[3px] p-0'>Edit</p>
							</span>
						</div>
					)
			  }
			: null,
		{
			key: 2,
			label: (
				<div
					className={`flex items-center text-[10px] leading-4 text-slate-400 shadow-none ${poppins.variable} ${poppins.className}`}
					onClick={() => {
						copyLink();
					}}
				>
					<CopyIcon
						className='-ml-2 text-2xl'
						style={{ transform: 'scale(0.6)' }}
					/>{' '}
					Copy link
				</div>
			)
		},
		id && id !== userId && !isEditing
			? {
					key: 3,
					label: (
						<ReportButton
							proposalType={postType}
							className={`flex h-[17.5px] w-[100%] items-center rounded-none text-[10px] leading-4 text-slate-400 shadow-none hover:bg-transparent ${poppins.variable} ${poppins.className} `}
							type='comment'
							commentId={commentId}
							postId={postIndex}
							isButtonOnComment={true}
						/>
					)
			  }
			: null,
		isEditable
			? {
					key: 4,
					label: (
						<div
							className={`ml-[-1.8px] flex items-center text-[10px] leading-4 text-slate-400 shadow-none ${poppins.variable} ${poppins.className} border-none`}
							onClick={() => {
								deleteComment();
								trackEvent('comment_delete_button_clicked', 'clicked_delete_comment_cta', {
									commentId: commentId,
									userId: userId || '',
									userName: userName || ''
								});
							}}
						>
							<DeleteIcon className='mr-1' />
							Delete
						</div>
					)
			  }
			: allowed_roles?.includes('moderator') && ['polkadot', 'kusama'].includes(network)
			? {
					key: 4,
					label: (
						<ReportButton
							isDeleteModal={true}
							proposalType={(comment.post_type as any) || postType}
							className={`flex rounded-none p-0 text-[10px] leading-4 text-slate-400 shadow-none hover:bg-transparent ${poppins.variable} ${poppins.className} `}
							type={EReportType.COMMENT}
							onSuccess={removeCommentContent}
							commentId={commentId}
							postId={(comment.post_index as any) || postIndex}
						/>
					)
			  }
			: null
	];

	const handleSentimentText = () => {
		switch (sentiment) {
			case 1:
				return 'Completely Against';
			case 2:
				return 'Slightly Against';
			case 3:
				return 'Neutral';
			case 4:
				return 'Slightly For';
			case 5:
				return 'Completely For';
			default:
				return 'Neutral';
		}
	};

	useEffect(() => {
		canEditComment();
	}, [canEditComment]);

	useEffect(() => {
		setCommentAllowed(id === proposerId ? true : getIsCommentAllowed(allowedCommentors, !!loginAddress && isUserOnchainVerified));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [allowedCommentors, loginAddress, isUserOnchainVerified]);

	return (
		<>
			<div className={className}>
				{error && (
					<div>
						<ErrorAlert
							errorMsg={error}
							className='mb-4'
						/>
					</div>
				)}
				{isEditing ? (
					<Form
						form={form}
						name='comment-content-form'
						onFinish={handleSave}
						layout='vertical'
						disabled={loading}
						validateMessages={{ required: "Please add the '${name}'" }}
					>
						<ContentForm
							autofocus={true}
							onChange={(content: string) => {
								global.window.localStorage.setItem(editCommentKey(commentId), content);
								return content.length ? content : null;
							}}
							className='mb-0'
						/>
						<div className='background mb-[10px] mt-[-25px] h-[70px] rounded-md rounded-e-md border-0 border-solid bg-gray-100 p-2 dark:border dark:border-[#3B444F] dark:bg-transparent'>
							<div className='flex gap-[2px] text-[12px] text-[#334D6E]'>
								Sentiment:<h5 className='text-[12px] text-pink_primary'> {handleSentimentText()}</h5>
							</div>
							<div className='flex items-center text-transparent'>
								<div className='flex items-center justify-between gap-[15px] border-solid'>
									<div
										className='flex cursor-pointer items-center justify-center text-lg'
										onClick={() => setSentiment(1)}
									>
										{sentiment === 1 ? <AgainstIcon /> : <AgainstUnfilledIcon />}
									</div>
									<div
										className='flex cursor-pointer items-center justify-center text-lg'
										onClick={() => setSentiment(2)}
									>
										{sentiment === 2 ? <SlightlyAgainstIcon /> : <SlightlyAgainstUnfilledIcon />}
									</div>
									<div
										className='flex cursor-pointer items-center justify-center text-lg'
										onClick={() => setSentiment(3)}
									>
										{sentiment === 3 ? <NeutralIcon /> : <NeutralUnfilledIcon />}
									</div>
									<div
										className='flex cursor-pointer  items-center justify-center text-lg'
										onClick={() => setSentiment(4)}
									>
										{sentiment === 4 ? <SlightlyForIcon /> : <SlightlyForUnfilledIcon />}
									</div>
									<div
										className='flex cursor-pointer items-center justify-center text-lg'
										onClick={() => setSentiment(5)}
									>
										{sentiment === 5 ? <ForIcon className='text-[20px]' /> : <ForUnfilledIcon />}{' '}
									</div>
								</div>
								<div className='flex w-[100%] items-center justify-end '>
									<Button
										htmlType='button'
										onClick={handleCancel}
										className='mr-2 flex h-[26px] items-center dark:border-borderColorDark dark:bg-transparent dark:text-white'
									>
										<CloseOutlined />
									</Button>
									<Button
										htmlType='submit'
										className='flex h-[26px] items-center border-white bg-pink_primary text-white hover:bg-pink_secondary dark:border-[#3B444F] dark:border-transparent'
									>
										<CheckOutlined />
									</Button>
								</div>
							</div>
						</div>
					</Form>
				) : (
					<>
						<Markdown
							theme={theme}
							md={content}
							className='rounded-b-md bg-comment_bg px-2 py-2 text-sm dark:bg-[#141416] md:px-4'
						/>

						<div className='flex flex-row flex-wrap items-center gap-[1px] bg-white dark:bg-section-dark-overlay'>
							<CommentReactionBar
								className='reactions mr-0'
								commentId={commentId}
								comment_reactions={comment.comment_reactions}
								importedReactions={props.isSubsquareUser}
							/>
							{id && (
								<Button
									disabled={props.disableEdit || !isCommentAllowed}
									className={classNames(
										props.disableEdit || !isCommentAllowed ? 'bg-transparent opacity-50' : '',
										'mt-[-2px] flex items-center justify-start border-none pl-1 pr-1 text-xs text-pink_primary shadow-none dark:bg-transparent dark:text-blue-dark-helper'
									)}
									onClick={props.isSubsquareUser ? toggleReply : toggleReply}
								>
									{theme === 'dark' ? <ReplyIconDark className='mr-1 ' /> : <ReplyIcon className='mr-1 text-pink_primary ' />} Reply
								</Button>
							)}
							<Dropdown
								theme={theme}
								className={`${poppins.variable} ${poppins.className} dropdown flex cursor-pointer`}
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
							{comment.isError && (
								<div className='ml-auto flex text-xs text-lightBlue dark:text-blue-dark-medium'>
									<Caution className='icon-container relative top-[4px] text-2xl' />
									<span className='msg-container relative top-[4px] m-0 mr-2 p-0'>Comment not posted</span>
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

						{/* Add Reply Form*/}
						{errorReply && <div>{errorReply}</div>}
						{!props.disableEdit && isReplying && (
							<Form
								form={replyForm}
								name='reply-content-form'
								onFinish={handleReplySave}
								layout='vertical'
								disabled={loadingReply}
								validateMessages={{ required: "Please add the '${name}'" }}
								className='mt-4'
							>
								<ContentForm
									autofocus={true}
									height={250}
									onChange={(content: string) => {
										global.window.localStorage.setItem(replyKey(commentId), content);
										return content.length ? content : null;
									}}
								/>
								<Form.Item>
									<div className='flex items-center justify-end'>
										<Button
											htmlType='button'
											disabled={loadingReply}
											onClick={handleReplyCancel}
											className='mr-2 flex items-center dark:border-[#3B444F] dark:bg-transparent dark:text-white'
										>
											<CloseOutlined /> Cancel
										</Button>
										<Button
											htmlType='submit'
											disabled={loadingReply}
											className='flex items-center border-none bg-pink_primary text-white hover:bg-pink_secondary'
										>
											<CheckOutlined /> Reply
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
	.background {
		background: rgba(72, 95, 125, 0.05);
		border: 1px solid rgba(72, 95, 125, 0.1);
		border-radius: 0px 0px 2px 2px;
	}

	.disabled-reply {
		cursor: not-allowed;
		opacity: 0.5;
	}

	code {
		display: initial;
	}

	@media (min-width: 320px) and (max-width: 468px) {
		.icon-container {
			display: none;
		}
		.msg-container {
			display: none;
		}
		.retry-container {
			position: relative !important;
			top: -2px !important;
			left: -2px !important;
		}
	}
`;
