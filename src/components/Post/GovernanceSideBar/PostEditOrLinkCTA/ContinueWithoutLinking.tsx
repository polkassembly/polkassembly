// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Form, Modal } from 'antd';
import { IEditPostResponse } from 'pages/api/v1/auth/actions/editPost';
import React, { FC, useRef, useState } from 'react';
import { MDXEditorMethods } from '@mdxeditor/editor';
import styled from 'styled-components';
import Input from '~src/basic-components/Input';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import MarkdownEditor from '~src/components/Editor/MarkdownEditor';
import { usePostDataContext } from '~src/context';
import { NotificationStatus } from '~src/types';
import AddTags from '~src/ui-components/AddTags';
import ErrorAlert from '~src/ui-components/ErrorAlert';
import queueNotification from '~src/ui-components/QueueNotification';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

interface IContinueWithoutLinking {
	setEditModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
	editModalOpen: boolean;
}

const ContinueWithoutLinking: FC<IContinueWithoutLinking> = (props) => {
	const { editModalOpen, setEditModalOpen } = props;
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [formDisabled, setFormDisabled] = useState<boolean>(false);
	const [content, setContent] = useState<string>('');
	const editorRef = useRef<MDXEditorMethods | null>(null);

	const {
		postData: { postType: proposalType, postIndex, timeline, tags: oldTags },
		setPostData
	} = usePostDataContext();

	const [tags, setTags] = useState<string[]>(oldTags);

	const onFinish = async ({ title }: any) => {
		setError('');
		await form.validateFields();
		if (!title || !content) return;

		setFormDisabled(true);
		setLoading(true);
		const { data, error: editError } = await nextApiClientFetch<IEditPostResponse>('api/v1/auth/actions/editPost', {
			content,
			postId: postIndex,
			proposalType,
			tags: tags && Array.isArray(tags) ? tags : [],
			timeline,
			title
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

			const { content, proposer, title, topic, last_edited_at, summary } = data;
			setPostData((prev) => ({
				...prev,
				content,
				last_edited_at,
				proposer,
				summary,
				tags: tags && Array.isArray(tags) ? tags : [],
				title,
				topic
			}));
			setFormDisabled(false);
			setEditModalOpen(false);
			setContent('');
			editorRef.current?.setMarkdown('');
		}
		setLoading(false);
	};
	return (
		<Modal
			wrapClassName='dark:bg-modalOverlayDark'
			open={editModalOpen}
			onCancel={() => setEditModalOpen(false)}
			footer={[
				<div
					key='save'
					className='flex items-center justify-end'
				>
					<CustomButton
						type='primary'
						loading={formDisabled}
						disabled={formDisabled}
						onClick={() => form.submit()}
						className={`px-4 py-1 capitalize ${formDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
						text='Save'
					/>
				</div>
			]}
			className='md:min-w-[674px] dark:[&>.ant-modal-content]:bg-section-dark-overlay'
		>
			<section className='flex flex-col'>
				<h2 className='mt-3 text-xl font-semibold leading-[24px] text-sidebarBlue'>Proposal Details</h2>
				<Form
					form={form}
					name='edit-post-form'
					onFinish={onFinish}
					layout='vertical'
					disabled={formDisabled || loading}
					validateMessages={{ required: "Please add the '${name}'" }}
				>
					<Form.Item
						name='title'
						label={<span className='text-lg font-semibold leading-[27px] tracking-[0.01em] text-lightBlue dark:text-white'>Title</span>}
						rules={[
							{
								required: true
							}
						]}
						className='mt-5'
					>
						<Input
							name='title'
							autoFocus
							placeholder='Add your title here'
							className='rounded-[4px] border border-solid border-[rgba(72,95,125,0.2)] p-2 text-sm font-medium leading-[21px] tracking-[0.01em] text-[#475F7D] placeholder:text-[#CED4DE] dark:border-separatorDark dark:bg-transparent dark:font-normal dark:text-white dark:focus:border-[#91054F]'
						/>
					</Form.Item>
					<div className='mt-[30px]'>
						<label className='mb-2 flex items-center text-lg font-semibold leading-[27px] tracking-[0.01em] text-lightBlue dark:text-white'>Description</label>
						<MarkdownEditor
							editorRef={editorRef}
							height={200}
							value={content}
							onChange={(value) => {
								setContent(value);
							}}
						/>
					</div>
					<div className='mt-[30px]'>
						<label className='mb-2 flex items-center text-lg font-semibold leading-[27px] tracking-[0.01em] text-lightBlue dark:text-white'>Tags</label>
						<AddTags
							tags={tags}
							setTags={setTags}
							className='mb-8'
						/>
					</div>
				</Form>
				{error && <ErrorAlert errorMsg={error} />}
			</section>
		</Modal>
	);
};

export default styled(ContinueWithoutLinking)``;
