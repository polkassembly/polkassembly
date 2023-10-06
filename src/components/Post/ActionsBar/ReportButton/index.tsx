// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { FlagOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Select } from 'antd';
import { IReportContentResponse } from 'pages/api/v1/auth/actions/reportContent';
import React, { FC, useState } from 'react';
import { NotificationStatus } from 'src/types';
import ErrorAlert from 'src/ui-components/ErrorAlert';
import queueNotification from 'src/ui-components/QueueNotification';
import cleanError from 'src/util/cleanError';
import { usePostDataContext, useUserDetailsContext } from '~src/context';
import { ProposalType } from '~src/global/proposalType';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IComment } from '../../Comment/Comment';
import { deleteContentByMod } from '~src/util/deleteContentByMod';

interface IReportButtonProps {
	type: string;
	postId?: number | string;
	commentId?: string;
	replyId?: string;
	className?: string;
	proposalType: ProposalType;
	isDeleteModal?: boolean;
	onSuccess?: () => void;
}

const reasons = ["It's suspicious or spam", "It's abusive or harmful", 'It expresses intentions of self-harm or suicide', 'other (please let us know in the field below)'];

const ReportButton: FC<IReportButtonProps> = (props) => {
	const { type, postId, commentId, replyId, className, proposalType, isDeleteModal, onSuccess } = props;
	const { allowed_roles } = useUserDetailsContext();
	const { setPostData } = usePostDataContext();
	const [showModal, setShowModal] = useState(false);
	const [formDisabled, setFormDisabled] = useState<boolean>(false);
	const [loading, setLoading] = useState(false);
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
			setError(reportError);
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
	const handleDelete = async () => {
		if (!allowed_roles?.includes('moderator') || isNaN(Number(postId))) return;
		setLoading(true);
		await form.validateFields();
		const validationErrors = form.getFieldError('reason');
		if (validationErrors.length > 0) return;
		setFormDisabled(true);
		const reason = form.getFieldValue('comments');
		if (allowed_roles?.includes('moderator')) {
			await deleteContentByMod(postId as string | number, proposalType, reason, commentId, replyId, onSuccess);
			setLoading(false);
		}
	};
	return (
		<>
			<button
				className={`${type === 'comment' ? 'm-0 ml-2 p-0' : ''} flex cursor-pointer items-center gap-x-[6px] border-none bg-transparent pr-1 shadow-none`}
				onClick={() => setShowModal(true)}
			>
				{isDeleteModal ? <DeleteOutlined className={`${className} -ml-2`} /> : <FlagOutlined className={`${className} ml-5`} />}
				{isDeleteModal ? <span className={`${className} break-keep`}>Delete</span> : <span className={`${className} break-keep`}>Report</span>}
			</button>
			<Modal
				title={isDeleteModal ? 'Delete' : 'Report'}
				open={showModal}
				onOk={isDeleteModal ? handleDelete : handleReport}
				confirmLoading={loading}
				onCancel={() => setShowModal(false)}
				zIndex={1067}
				footer={[
					<Button
						key='back'
						disabled={loading}
						onClick={() => setShowModal(false)}
					>
						Cancel
					</Button>,
					<Button
						htmlType='submit'
						key='submit'
						className='bg-pink_primary text-white hover:bg-pink_secondary'
						disabled={loading}
						onClick={() => {
							isDeleteModal ? handleDelete() : handleReport();
							setShowModal(false);
						}}
					>
						{isDeleteModal ? 'Delete' : 'Report'}
					</Button>
				]}
			>
				<Form
					form={form}
					name='report-post-form'
					onFinish={isDeleteModal ? handleDelete : handleReport}
					layout='vertical'
					disabled={formDisabled}
					validateMessages={{ required: "Please add the '${name}'" }}
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
					>
						<Input.TextArea
							name='comments'
							showCount
							rows={4}
							maxLength={300}
						/>
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
};

export default ReportButton;
