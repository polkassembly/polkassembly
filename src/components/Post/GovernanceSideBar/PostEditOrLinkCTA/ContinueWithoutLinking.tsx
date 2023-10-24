// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Form, Input, Modal } from 'antd';
import { IEditPostResponse } from 'pages/api/v1/auth/actions/editPost';
import React, { FC, useState } from 'react';
import styled from 'styled-components';
import ContentForm from '~src/components/ContentForm';
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

	const {
		postData: { postType: proposalType, postIndex, timeline, tags: oldTags },
		setPostData
	} = usePostDataContext();

	const [tags, setTags] = useState<string[]>(oldTags);

	const onFinish = async ({ title, content }: any) => {
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
				message: 'Your post was edited',
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
					<Button
						loading={formDisabled}
						disabled={formDisabled}
						onClick={() => form.submit()}
						className={`'border-none capitalize' rounded-[4px] bg-pink_primary px-4 py-1 text-sm font-medium leading-[21px] tracking-[0.0125em] text-white outline-none ${
							formDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
						}`}
					>
						Save
					</Button>
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
						label={<span className='text-lg font-semibold leading-[27px] tracking-[0.01em] text-[#475F7D]'>Title</span>}
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
							className='rounded-[4px] border border-solid border-[rgba(72,95,125,0.2)] p-2 text-sm font-medium leading-[21px] tracking-[0.01em] text-[#475F7D] placeholder:text-[#CED4DE] dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
						/>
					</Form.Item>
					<div className='mt-[30px]'>
						<label className='mb-2 flex items-center text-lg font-semibold leading-[27px] tracking-[0.01em] text-[#475F7D]'>Description</label>
						<ContentForm />
					</div>
					<div className='mt-[30px]'>
						<label className='mb-2 flex items-center text-lg font-semibold leading-[27px] tracking-[0.01em] text-[#475F7D]'>Tags</label>
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
