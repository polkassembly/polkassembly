// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Dropdown, Form, MenuProps, Tooltip } from 'antd';
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
import { useApiContext, useCommentDataContext, usePostDataContext, useUserDetailsContext } from '~src/context';
import { ProposalType, getSubsquidLikeProposalType } from '~src/global/proposalType';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

import CommentReactionBar from '../ActionsBar/Reactionbar/CommentReactionBar';
import ReportButton from '../ActionsBar/ReportButton';
import { IComment } from './Comment';

import ThreeDotsIcon from '~assets/icons/three-dots.svg';
import DeleteIcon from '~assets/icons/delete.svg';
import EditIcon from '~assets/icons/edit-i.svg';
import CopyIcon from '~assets/icons/copy.svg';
import ReplyIcon from '~assets/icons/reply.svg';
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
	ForUnfilledIcon
} from '~src/ui-components/CustomIcons';

import { poppins } from 'pages/_app';
import { useNetworkSelector } from '~src/redux/selectors';
import getOnChainUsername from '~src/util/getOnChainUsername';
import getEncodedAddress from '~src/util/getEncodedAddress';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { checkIsProposer } from '../utils/checkIsProposer';

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

	const { id, username, picture, loginAddress, addresses, allowed_roles } = useUserDetailsContext();
	const { api, apiReady } = useApiContext();

	const [replyForm] = Form.useForm();
	const [form] = Form.useForm();

	const currentContent = useRef<string>(content);

	const {
		postData: { postType, postIndex, track_number }
	} = usePostDataContext();
	const { asPath } = useRouter();

	const [isEditing, setIsEditing] = useState(false);
	const toggleEdit = () => setIsEditing(!isEditing);
	const [errorReply, setErrorReply] = useState('');
	const [loadingReply, setLoadingReply] = useState(false);

	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [isReplying, setIsReplying] = useState(false);
	const [isEditable, setIsEditable] = useState(false);

	const [onChainUsername, setOnChainUsername] = useState<string>('');
	useEffect(() => {
		const localContent = global.window.localStorage.getItem(editCommentKey(commentId)) || '';
		form.setFieldValue('content', localContent || content || ''); //initialValues is not working
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		(async () => {
			if (!api || !apiReady || !proposer) return;
			const onChainUsername = await getOnChainUsername(api, proposer, network === 'kilt');
			setOnChainUsername(onChainUsername);
		})();
	}, [api, apiReady, network, proposer]);

	const toggleReply = async () => {
		let usernameContent = '';

		if (!is_custom_username && onChainUsername && proposer) {
			usernameContent = `[@${onChainUsername}](${global.window.location.origin}/address/${getEncodedAddress(proposer, network)})`;
		} else if (!is_custom_username && proposer && !onChainUsername) {
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
		}

		if (data) {
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
								(newComment.history = [
									{ content: newComment?.content, created_at: newComment?.created_at, sentiment: newComment?.sentiment || 0 },
									...(newComment?.history || [])
								]),
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
				return comments;
			});
			form.setFieldValue('content', currentContent.current);
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
		if (!replyContent) return;

		if (id) {
			setIsReplying(false);

			setLoadingReply(true);
			const { data, error: addCommentError } = await nextApiClientFetch<IAddCommentReplyResponse>('api/v1/auth/actions/addCommentReply', {
				commentId: commentId,
				content: replyContent,
				postId: props.postId,
				postType: props.proposalType,
				trackNumber: track_number,
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

			if (data) {
				setErrorReply('');
				global.window.localStorage.removeItem(replyKey(commentId));
				const keys = Object.keys(comments);
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
											id: data.id,
											proposer: loginAddress,
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
					comments[key] = prev[key].filter((comment) => comment.id !== commentId);
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
		const { data, error: deleteCommentError } = await nextApiClientFetch<MessageType>('api/v1/auth/actions/deleteComment', {
			commentId,
			postId: comment.post_index || comment.post_index === 0 ? comment.post_index : props.postId,
			postType: comment.post_type || props.proposalType
		});
		if (deleteCommentError || !data) {
			console.error('Error deleting comment: ', deleteCommentError);
			queueNotification({
				header: 'Error!',
				message: deleteCommentError || 'There was an error in deleting your comment.',
				status: NotificationStatus.ERROR
			});
		}
		if (data) {
			removeCommentContent();
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
							onClick={toggleEdit}
						>
							<span className='flex items-center'>
								<EditIcon className='mr-1' />
								Edit
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
					<CopyIcon className='mr-1' /> Copy link
				</div>
			)
		},
		id && !isEditing
			? {
					key: 3,
					label: (
						<ReportButton
							proposalType={(comment.post_type as any) || postType}
							className={`flex items-center rounded-none text-[10px] leading-4 text-slate-400 shadow-none hover:bg-transparent ${poppins.variable} ${poppins.className} `}
							type='comment'
							commentId={commentId}
							postId={(comment.post_index as any) || postIndex}
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
							className={`flex rounded-none text-[10px] leading-4 text-slate-400 shadow-none hover:bg-transparent ${poppins.variable} ${poppins.className} `}
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
						<div className='background mb-[10px] mt-[-25px] h-[70px] rounded-e-md bg-gray-100 p-2'>
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
										className='mr-2 flex h-[26px] items-center'
									>
										<CloseOutlined />
									</Button>
									<Button
										htmlType='submit'
										className='flex h-[26px] items-center border-white bg-pink_primary text-white hover:bg-pink_secondary'
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
							md={content}
							className='rounded-b-md bg-comment_bg px-2 py-2 text-sm md:px-4'
						/>

						<div className='flex flex-row flex-wrap items-center gap-[1px] bg-white'>
							<CommentReactionBar
								className='reactions mr-0'
								commentId={commentId}
								comment_reactions={comment.comment_reactions}
								importedReactions={props.isSubsquareUser}
							/>
							{id &&
								(props.isSubsquareUser ? (
									<Tooltip
										title='Reply are disabled for imported comments.'
										color='#E5007A'
									>
										<Button
											disabled={props.disableEdit}
											className={`mt-[-2px] flex items-center justify-start border-none pl-1 pr-1 text-xs text-pink_primary shadow-none ${
												props.isSubsquareUser ? 'disabled-reply' : ''
											}`}
											onClick={props.isSubsquareUser ? () => {} : toggleReply}
										>
											<ReplyIcon className='mr-1' /> Reply
										</Button>
									</Tooltip>
								) : (
									<Button
										disabled={props.disableEdit}
										className={`mt-[-2px] flex items-center justify-start border-none pl-1 pr-1 text-xs text-pink_primary shadow-none ${
											props.isSubsquareUser ? 'disabled-reply' : ''
										}`}
										onClick={props.isSubsquareUser ? () => {} : toggleReply}
									>
										<ReplyIcon className='mr-1' /> Reply
									</Button>
								))}
							<Dropdown
								className={`${poppins.variable} ${poppins.className} dropdown flex cursor-pointer`}
								overlayClassName='sentiment-dropdown'
								placement='bottomRight'
								menu={{ items }}
							>
								<ThreeDotsIcon className=' ml-[6px] mt-[-1px] rounded-xl hover:bg-pink-100' />
							</Dropdown>
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
											className='mr-2 flex items-center'
										>
											<CloseOutlined /> Cancel
										</Button>
										<Button
											htmlType='submit'
											disabled={loadingReply}
											className='flex items-center border-white bg-pink_primary text-white hover:bg-pink_secondary'
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
`;
