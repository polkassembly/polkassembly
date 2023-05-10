// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import { IEditPostResponse } from 'pages/api/v1/auth/actions/editPost';
import React, { useState } from 'react';
import { NotificationStatus } from 'src/types';
import ErrorAlert from 'src/ui-components/ErrorAlert';
import queueNotification from 'src/ui-components/QueueNotification';

import { usePostDataContext } from '~src/context';
import { noTitle } from '~src/global/noTitle';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

import ContentForm from '../../ContentForm';
import AddTags from '~src/ui-components/AddTags';
import styled from 'styled-components';

interface Props {
	className?: string;
	toggleEdit: () => void;
}

const PostContentForm = ({ className, toggleEdit } : Props) => {
	const [formDisabled, setFormDisabled] = useState<boolean>(false);
	const [form] = Form.useForm();
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const { postData: {
		title,
		content,
		postType: proposalType,
		postIndex,
		cid,
		timeline,tags:oldTags
	}, setPostData } = usePostDataContext();

	const [tags,setTags]=useState<string[]>(oldTags);

	const onFinish = async ({ title, content }: any) => {
		await form.validateFields();
		if(!title || !content) return;

		setFormDisabled(true);
		setLoading(true);
		const { data , error: editError } = await nextApiClientFetch<IEditPostResponse>('api/v1/auth/actions/editPost', {
			content,
			postId: postIndex || cid,
			proposalType,
			tags,
			timeline,
			title
		});

		if(editError || !data) {
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

			const { content, proposer, title, topic, last_edited_at } = data;
			setPostData((prev) => ({
				...prev,
				content,
				history: [{ content: prev?.content, created_at: prev?.last_edited_at || '', title: prev?.title }, ...(prev?.history || [])] ,
				last_edited_at,
				proposer,
				tags,
				title,
				topic
			}));
			setFormDisabled(false);
			toggleEdit();
		}
		setLoading(false);
	};

	return (
		<div className={className}>
			{error && <ErrorAlert errorMsg={error} className='mb-4' />}
			<Form
				form={form}
				name="post-content-form"
				onFinish={onFinish}
				layout="vertical"
				initialValues={{
					content,
					title: title || noTitle
				}}
				disabled={formDisabled || loading}
				validateMessages= {
					{ required: "Please add the '${name}'" }
				}
			>
				<Form.Item name="title" label="Title" rules={[{ required: true }]}>
					<Input autoFocus placeholder='Your title...' className='text-black' />
				</Form.Item>
				<ContentForm />
				<h5 className='text-sm text-color mt-8 font-normal'>Tags</h5>
				<AddTags tags={tags} setTags={setTags} className='mb-8' />
				<Form.Item>
					<div className='flex items-center justify-between'>
						<div className='flex items-center justify-end'>
							<Button htmlType="button" loading={loading} onClick={toggleEdit} className='mr-2 flex items-center'>
								<CloseOutlined /> Cancel
							</Button>
							<Button htmlType="submit" loading={loading} className='bg-pink_primary text-white border-white hover:bg-pink_secondary flex items-center'>
								<CheckOutlined /> Submit
							</Button>
						</div>
					</div>
				</Form.Item>
			</Form>
		</div>
	);
};

export default styled(PostContentForm)`
.text-color{
  color:#334D6EE5;
}
`;
