// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { FlagOutlined, DeleteOutlined } from '@ant-design/icons';
import { Form, Modal } from 'antd';
import { IReportContentResponse } from 'pages/api/v1/auth/actions/reportContent';
import React, { FC, useState } from 'react';
import { NotificationStatus } from 'src/types';
import ErrorAlert from 'src/ui-components/ErrorAlert';
import queueNotification from 'src/ui-components/QueueNotification';
import cleanError from 'src/util/cleanError';
import { usePostDataContext } from '~src/context';
import { ProposalType } from '~src/global/proposalType';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IComment } from '../../Comment/Comment';
import { deleteContentByMod } from '~src/util/deleteContentByMod';
import { useUserDetailsSelector } from '~src/redux/selectors';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import InputTextarea from '~src/basic-components/Input/InputTextarea';
import Select from '~src/basic-components/Select';
import ReportIcon from '~assets/icons/reactions/ReportIcon.svg';
import ReportIconDark from '~assets/icons/reactions/ReportIconDark.svg';
import DeleteIcon from '~assets/icons/reactions/DeleteIcon.svg';
import DeleteIconDark from '~assets/icons/reactions/DeleteIconDark.svg';
// import DeleteIcon from '~assets/icons/reactions/DeleteIcon.svg';
import { useTheme } from 'next-themes';

interface DeletePostResponse {
	data: {
		message: string;
		error: string;
	};
}
interface IReportButtonProps {
	type: string;
	postId?: number | string;
	commentId?: string;
	replyId?: string;
	className?: string;
	proposalType: ProposalType;
	isDeleteModal?: boolean;
	onSuccess?: () => void;
	isButtonOnComment?: boolean;
	isUsedInDescription?: boolean;
	canEdit?: boolean;
	proposerId?: number;
}

const reasons = ["It's suspicious or spam", "It's abusive or harmful", 'It expresses intentions of self-harm or suicide', 'other (please let us know in the field below)'];

const ReportButton: FC<IReportButtonProps> = (props) => {
	const { type, postId, commentId, replyId, className, proposalType, isDeleteModal, onSuccess, isButtonOnComment, isUsedInDescription, canEdit, proposerId } = props;
	const { allowed_roles } = useUserDetailsSelector();
	const { setPostData } = usePostDataContext();
	const [showModal, setShowModal] = useState(false);
	const [formDisabled, setFormDisabled] = useState<boolean>(false);
	const [loading, setLoading] = useState(false);
	const { resolvedTheme: theme } = useTheme();
	const [error, setError] = useState('');

	const [form] = Form.useForm();

	const handleReport = async () => {
		await form.validateFields();
		const validationErrors = form.getFieldError('reason');
		if (validationErrors.length > 0) return;
		setFormDisabled(true);
		const reason = form.getFieldValue('reason');
		const comments = form.getFieldValue('comments');

		setLoading(true);

		const { data: reportData, error: reportError } = await nextApiClientFetch<IReportContentResponse>('api/v1/auth/actions/reportContent', {
			comments,
			// eslint-disable-next-line sort-keys
			comment_id: commentId,
			post_id: postId,
			proposalType,
			reason,
			reply_id: replyId,
			type
		});

		if (reportError) {
			console.error('Error reporting content ', reportError);
			queueNotification({
				header: 'Error!',
				message: cleanError(reportError),
				status: NotificationStatus.ERROR
			});
			setFormDisabled(false);
			setError('Please add a reason to report this content');
		}

		if (reportData) {
			const handleSpamComments = (commentsWithTimeline: any, commentId: string) => {
				const commentsPayload = Object.assign({}, commentsWithTimeline);
				for (const key in commentsWithTimeline) {
					commentsPayload[key] = commentsWithTimeline[key].map((comment: IComment) => {
						if (comment.id === commentId) {
							return {
								...comment,
								spam_users_count: reportData.spam_users_count
							};
						} else {
							return {
								...comment
							};
						}
					});
				}
				return commentsPayload;
			};
			const handleSpamReply = (commentsWithTimeline: any, commentId: string) => {
				const commentsPayload = Object.assign({}, commentsWithTimeline);
				for (const key in commentsWithTimeline) {
					commentsPayload[key] = commentsWithTimeline[key].map((comment: IComment) => {
						if (comment?.id === commentId) {
							return {
								...comment,
								replies: (comment?.replies || []).map((reply: any) => {
									if (reply?.id === replyId) {
										return {
											...reply,
											spam_users_count: reportData.spam_users_count
										};
									} else {
										return {
											...reply
										};
									}
								})
							};
						} else {
							return {
								...comment
							};
						}
					});
				}
				return commentsPayload;
			};
			queueNotification({
				header: 'Success!',
				message: reportData.message,
				status: NotificationStatus.SUCCESS
			});
			setPostData &&
				setPostData((prev) => {
					if (type === 'post') {
						return {
							...prev,
							spam_reports_count: reportData.spam_users_count
						};
					} else if (type === 'comment') {
						return {
							...prev,
							comments: handleSpamComments(prev.comments, commentId || '')
						};
					} else {
						return {
							...prev,
							comments: handleSpamReply(prev.comments, commentId || '')
						};
					}
				});
			setShowModal(false);
			setFormDisabled(false);
			form.setFieldValue('comments', '');
		}

		setLoading(false);
	};

	const deletePost = async (postId: number | string | undefined, proposalType?: ProposalType) => {
		try {
			const { data, error } = await nextApiClientFetch<{ data: DeletePostResponse | null; error: string | null }>('/api/v1/auth/actions/deletePost', {
				proposerId,
				postId,
				postType: proposalType
			});

			if (error) {
				queueNotification({
					header: 'Error!',
					message: 'Error deleting post',
					status: NotificationStatus.ERROR
				});
			}

			if (data && data?.message) {
				queueNotification({
					header: 'Success!',
					message: 'Post successfully deleted.',
					status: NotificationStatus.SUCCESS
				});
				setShowModal(false);
			}
		} catch (err) {
			console.error('Error while deleting post: ', err);
			queueNotification({
				header: 'Error!',
				message: `An error occurred while deleting post: ${err instanceof Error ? err.message : 'Unknown error'}`,
				status: NotificationStatus.ERROR
			});
		}
	};

	const handleDelete = async () => {
		if ((!allowed_roles?.includes('moderator') && !canEdit) || isNaN(Number(postId))) return;
		await form.validateFields();
		const validationErrors = form.getFieldError('reason');
		if (!canEdit && validationErrors.length > 0) return;
		setFormDisabled(true);
		const reason = form.getFieldValue('comments');
		setLoading(true);

		if (canEdit) {
			await deletePost(postId, proposalType);
		} else {
			if (allowed_roles?.includes('moderator') && reason) {
				await deleteContentByMod(postId as string | number, proposalType, reason, commentId, replyId, onSuccess);
				setLoading(false);
				setShowModal(false);
			}
		}
		setLoading(false);
	};
	return (
		<>
			<div>
				{isUsedInDescription ? (
					<button
						className='flex cursor-pointer items-center justify-between gap-[6px] border-none bg-transparent shadow-none'
						onClick={() => setShowModal(true)}
					>
						{isDeleteModal ? theme == 'dark' ? <DeleteIconDark /> : <DeleteIcon /> : theme == 'dark' ? <ReportIconDark /> : <ReportIcon />}
						<span className='font-medium text-lightBlue dark:text-icon-dark-inactive'>{isDeleteModal ? 'Delete' : 'Report'}</span>
					</button>
				) : (
					<button
						className={`${type === 'comment' ? 'm-0 p-0' : 'm-0 px-1'} flex cursor-pointer items-center gap-x-[6px] border-none bg-transparent shadow-none`}
						onClick={() => setShowModal(true)}
					>
						{isDeleteModal ? (
							<DeleteOutlined className={`${className} text-pink_primary dark:text-icon-dark-inactive`} />
						) : (
							<FlagOutlined className={`${className} p-0 text-pink_primary ${isButtonOnComment ? 'dark:text-icon-dark-inactive' : 'dark:text-blue-dark-helper'}`} />
						)}
						{isDeleteModal ? (
							<span className={`${className} break-keep text-pink_primary dark:text-icon-dark-inactive`}>Delete</span>
						) : (
							<span
								className={`${className} ${type === 'comment' ? 'p-0' : ''} break-keep text-pink_primary ${
									isButtonOnComment ? 'dark:text-icon-dark-inactive' : 'dark:text-blue-dark-helper'
								}`}
							>
								Report
							</span>
						)}
					</button>
				)}
			</div>

			<Modal
				className='dark:[&>.ant-modal-content>.ant-modal-header>.ant-modal-title]:bg-section-dark-overlay dark:[&>.ant-modal-content]:bg-section-dark-overlay'
				wrapClassName='dark:bg-modalOverlayDark'
				title={isDeleteModal ? <span className='dark:text-white'>Delete</span> : <span className='dark:text-white'>Report</span>}
				open={showModal}
				onOk={isDeleteModal ? handleDelete : handleReport}
				confirmLoading={loading}
				onCancel={() => setShowModal(false)}
				destroyOnClose={true}
				zIndex={1067}
				footer={[
					<div
						key='buttons'
						className='mt-4 flex justify-end gap-x-1'
					>
						<CustomButton
							key='back'
							disabled={loading}
							onClick={() => setShowModal(false)}
							text='Cancel'
							variant='default'
							buttonsize='xs'
						/>
						<CustomButton
							htmlType='submit'
							key='submit'
							disabled={loading}
							onClick={() => {
								isDeleteModal ? handleDelete() : handleReport();
							}}
							variant='primary'
							buttonsize='xs'
						>
							{isDeleteModal ? 'Delete' : 'Report'}
						</CustomButton>
					</div>
				]}
			>
				<Form
					form={form}
					name='report-post-form'
					onFinish={isDeleteModal ? handleDelete : handleReport}
					layout='vertical'
					disabled={formDisabled}
					validateMessages={{ required: `Please add reason for ${isDeleteModal ? 'deleting' : 'reporting'}` }}
					initialValues={{
						comments: '',
						reason: reasons[0]
					}}
				>
					{error && (
						<ErrorAlert
							errorMsg={error}
							className='mb-4'
						/>
					)}

					<Form.Item
						name='reason'
						label='Reason'
						rules={[{ required: true }]}
						className='dark:'
					>
						<Select
							popupClassName='z-[9999]'
							defaultValue={"It's suspicious or spam"}
							options={reasons.map((reason) => {
								return {
									label: reason,
									value: reason
								};
							})}
						/>
					</Form.Item>
					<Form.Item
						name='comments'
						label='Comments (300 char max)'
						rules={[{ required: true }]}
					>
						<InputTextarea
							name='comments'
							showCount
							rows={4}
							maxLength={300}
							className='dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
						/>
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
};

export default ReportButton;
