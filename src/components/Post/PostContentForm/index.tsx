// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Form } from 'antd';
import { IEditPostResponse } from 'pages/api/v1/auth/actions/editPost';
import React, { useRef, useState } from 'react';
import { EAllowedCommentor, NotificationStatus } from 'src/types';
import ErrorAlert from 'src/ui-components/ErrorAlert';
import queueNotification from 'src/ui-components/QueueNotification';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { EGovType } from 'src/types';
import { useNetworkSelector } from '~src/redux/selectors';
import { usePostDataContext } from '~src/context';
import { noTitle } from '~src/global/noTitle';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import TopicsRadio from '../CreatePost/TopicsRadio';
import AddTags from '~src/ui-components/AddTags';
import styled from 'styled-components';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { ProposalType } from '~src/global/proposalType';
import Input from '~src/basic-components/Input';
import AllowedCommentorsRadioButtons from '~src/components/AllowedCommentorsRadioButtons';
import MarkdownEditor from '~src/components/Editor/MarkdownEditor';
import getMarkdownContent from '~src/api-utils/getMarkdownContent';
import { MDXEditorMethods } from '@mdxeditor/editor';

interface Props {
	className?: string;
	toggleEdit: () => void;
}

const PostContentForm = ({ className, toggleEdit }: Props) => {
	const [formDisabled, setFormDisabled] = useState<boolean>(false);
	const [form] = Form.useForm();
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const {
		postData: { title, content, postType: proposalType, postIndex, cid, timeline, tags: oldTags, topic: currentTopic, proposalHashBlock, allowedCommentors },
		setPostData
	} = usePostDataContext();
	const [editableContent, setEditableContent] = useState<string>(getMarkdownContent(content) || '');

	const [modifiedAllowedCommentors, setAllowedCommentors] = useState<EAllowedCommentor>(allowedCommentors);

	const [topicId, setTopicId] = useState<number>(currentTopic?.id || 5);
	const { network } = useNetworkSelector();

	const [tags, setTags] = useState<string[]>(oldTags);
	const markdownEditorRef = useRef<MDXEditorMethods | null>(null);

	const onFinish = async ({ title }: any) => {
		await form.validateFields();
		if (!title || !editableContent) return;

		setFormDisabled(true);
		setLoading(true);
		const { data, error: editError } = await nextApiClientFetch<IEditPostResponse>('api/v1/auth/actions/editPost', {
			allowedCommentors: modifiedAllowedCommentors ? [modifiedAllowedCommentors] : [allowedCommentors || EAllowedCommentor.ALL],
			content: editableContent || '',
			postId: proposalType === ProposalType.ADVISORY_COMMITTEE ? proposalHashBlock : postIndex || postIndex === 0 ? postIndex : cid,
			proposalType,
			tags,
			timeline,
			title,
			topicId
		});

		if (editError || !data) {
			console.error('Error saving post', editError);
			queueNotification({
				header: 'Error!',
				message: 'Error in saving your post.',
				status: NotificationStatus.ERROR
			});
			setFormDisabled(false);
			setError(editError || 'Error in saving post');
		}

		if (data) {
			queueNotification({
				header: 'Success!',
				message: 'Your post is now edited',
				status: NotificationStatus.SUCCESS
			});

			const { content: editedContent, proposer, title: editedTitle, topic, last_edited_at, summary } = data;
			setPostData((prev) => ({
				...prev,
				allowedCommentors: modifiedAllowedCommentors,
				content: editedContent,
				history: [{ content: prev?.content, created_at: prev?.last_edited_at || '', title: prev?.title }, ...(prev?.history || [])],
				last_edited_at,
				proposer,
				summary: summary,
				tags,
				title: editedTitle,
				topic
			}));
			setFormDisabled(false);
			toggleEdit();
		}
		setLoading(false);
	};

	return (
		<div className={className}>
			{error && (
				<ErrorAlert
					errorMsg={error}
					className='mb-4'
				/>
			)}
			<Form
				form={form}
				name='post-content-form'
				onFinish={onFinish}
				layout='vertical'
				initialValues={{
					title: title || noTitle
				}}
				disabled={formDisabled || loading}
				validateMessages={{ required: "Please add the '${name}'" }}
			>
				<Form.Item
					name='title'
					label='Title'
					rules={[{ required: true }]}
				>
					<Input
						autoFocus
						placeholder='Your title...'
						className='text-black dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
					/>
				</Form.Item>
				<MarkdownEditor
					key={'edit-post-content-editor'}
					editorRef={markdownEditorRef}
					height={250}
					value={editableContent}
					autofocus
					onChange={(content: string) => {
						setEditableContent(content);
					}}
				/>
				{currentTopic && currentTopic.id && (
					<Form.Item
						className='mt-8'
						name='topic'
						rules={[
							{
								message: "Please select a 'topic'",
								validator(rule, value = currentTopic.id, callback) {
									if (callback && !value) {
										callback(rule?.message?.toString());
									} else {
										callback();
									}
								}
							}
						]}
					>
						<>
							<label className='mb-1 text-sm font-normal tracking-wide text-sidebarBlue dark:text-white'>
								Select Topic <span className='ml-1 text-red-500'>*</span>
							</label>
							<TopicsRadio
								govType={isOpenGovSupported(network) ? EGovType.OPEN_GOV : EGovType.GOV1}
								onTopicSelection={(id) => {
									setTopicId(id);
								}}
								topicId={topicId}
							/>
						</>
					</Form.Item>
				)}

				<h5 className='text-color mt-8 text-sm font-normal dark:text-separatorDark'>Tags</h5>
				<AddTags
					tags={tags}
					setTags={setTags}
					className='mb-8'
				/>
				{/* who can comment */}
				<AllowedCommentorsRadioButtons
					className='mb-6 mt-8 gap-2'
					onChange={(value: EAllowedCommentor) => setAllowedCommentors?.(value as EAllowedCommentor)}
					isLoading={loading}
					allowedCommentors={modifiedAllowedCommentors || allowedCommentors}
				/>
				<Form.Item>
					<div className='flex items-center justify-between'>
						<div className='flex items-center justify-end'>
							<CustomButton
								variant='solid'
								htmlType='button'
								onClick={toggleEdit}
								className='mr-2'
								buttonsize='xs'
							>
								<CloseOutlined /> Cancel
							</CustomButton>
							<CustomButton
								variant='solid'
								htmlType='submit'
								loading={loading}
								buttonsize='xs'
							>
								<CheckOutlined /> Submit
							</CustomButton>
						</div>
					</div>
				</Form.Item>
			</Form>
		</div>
	);
};

export default styled(PostContentForm)`
	.text-color {
		color: #334d6ee5;
	}
`;
