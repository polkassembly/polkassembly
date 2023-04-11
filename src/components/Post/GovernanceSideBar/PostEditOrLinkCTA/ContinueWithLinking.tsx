// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Form, Input, Modal } from 'antd';
import { ILinkPostConfirmResponse } from 'pages/api/v1/auth/actions/linkPostConfirm';
import { ILinkPostStartResponse } from 'pages/api/v1/auth/actions/linkPostStart';
import React, { FC, useState } from 'react';
import { useNetworkContext, usePostDataContext } from '~src/context';
import { ProposalType, getProposalTypeFromSinglePostLink } from '~src/global/proposalType';
import { NotificationStatus } from '~src/types';
import ErrorAlert from '~src/ui-components/ErrorAlert';
import Markdown from '~src/ui-components/Markdown';
import queueNotification from '~src/ui-components/QueueNotification';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

interface IContinueWithLinking {
    setLinkingModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    linkingModalOpen: boolean;
}

export const getPostTypeAndId = (currNetwork: string,url: any) => {
	let post: {
        id: string | number;
        type: ProposalType;
    } | undefined;
	if (url && typeof url === 'string') {
		try {
			new URL(url);
			const arr = url.split('/');
			if (arr.length < 5) {
				return;
			}
			const host = arr[2];
			if (host !== `${currNetwork}.polkassembly.io`) {
				return;
			}
			const postType = getProposalTypeFromSinglePostLink(arr[3]);
			const postIndex = Number(arr[4]);
			if (postType && !isNaN(postIndex)) {
				post = {
					id: postIndex,
					type: postType
				};
			}
		} catch (error) {
			return;
		}
	}
	return post;
};

const ContinueWithLinking: FC<IContinueWithLinking> = (props) => {
	const { linkingModalOpen, setLinkingModalOpen } = props;
	const [form] = Form.useForm();
	const [post, setPost] = useState<{
		description: string,
		title: string
	}>();
	const [prevURL, setURL] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [formDisabled, setFormDisabled] = useState<boolean>(false);
	const { network } = useNetworkContext();
	const { postData: {
		postIndex, postType
	}, setPostData } = usePostDataContext();

	const onFinish = async ({ url }: any) => {
		setError('');
		setFormDisabled(true);
		setLoading(true);
		const postTypeAndId = getPostTypeAndId(network, url);
		if (!postTypeAndId) {
			setError('Invalid URL');
			setFormDisabled(false);
			setLoading(false);
			return;
		}
		if (prevURL !== url) {
			const { data , error } = await nextApiClientFetch<ILinkPostStartResponse>('api/v1/auth/actions/linkPostStart', {
				postId: postTypeAndId.id,
				postType: postTypeAndId.type
			});
			if (error || !data) {
				setError(error || 'Something went wrong');
				setFormDisabled(false);
				setLoading(false);
				return;
			}
			if (data) {
				queueNotification({
					header: 'Success!',
					message: 'Post data fetched successfully.',
					status: NotificationStatus.SUCCESS
				});
				setPost(data);
				setLoading(false);
				setFormDisabled(false);
			}
			setURL(url);
		} else {
			const { data , error } = await nextApiClientFetch<ILinkPostConfirmResponse>('api/v1/auth/actions/linkPostConfirm', {
				currPostId: postIndex,
				currPostType: postType,
				postId: postTypeAndId.id,
				postType: postTypeAndId.type
			});
			if (error || !data) {
				setError(error || 'Something went wrong');
				setFormDisabled(false);
				setLoading(false);
				return;
			}
			if (data) {
				queueNotification({
					header: 'Success!',
					message: 'Post linked successfully.',
					status: NotificationStatus.SUCCESS
				});
				setPostData((prev) => ({
					...prev,
					post_link: {
						description: post?.description,
						id: postTypeAndId.id,
						title: post?.title,
						type: postTypeAndId.type
					},
					timeline: data.timeline
				}));
				setLoading(false);
				setFormDisabled(false);
				setLinkingModalOpen(false);
			}
			setURL(url);
		}
	};
	return (
		<Modal
			open={linkingModalOpen}
			onCancel={() => setLinkingModalOpen(false)}
			footer={[
				<div
					key='save'
					className='flex items-center justify-end'
				>
					<Button loading={formDisabled} disabled={formDisabled} onClick={() => form.submit()} className={`'border-none outline-none bg-pink_primary text-white rounded-[4px] px-4 py-1 font-medium text-sm leading-[21px] tracking-[0.0125em] capitalize' ${formDisabled? 'cursor-not-allowed': 'cursor-pointer'}`}>{
						(post && prevURL)?
							'Save'
							: 'Fetch and Preview'
					}</Button>
				</div>
			]}
			className='md:min-w-[674px]'
		>
			<section className='flex flex-col'>
				<h2
					className='mt-3 text-sidebarBlue font-semibold text-xl leading-[24px]'
				>
                    Proposal Details
				</h2>
				<Form
					form={form}
					name="edit-post-form"
					onFinish={onFinish}
					layout="vertical"
					disabled={formDisabled || loading}
					validateMessages= {
						{ required: "Please add the '${name}'" }
					}
				>
					<Form.Item
						name="url"
						label={<span className='text-[#475F7D] text-lg leading-[27px] tracking-[0.01em] font-semibold'>Link Discussion Post</span>}
						rules={[
							{
								required: true
							}
						]}
						className='mt-5'
					>
						<Input
							name='url'
							autoFocus
							onChange={() => setURL('')}
							placeholder='Enter your post URL here'
							className='border border-solid border-[rgba(72,95,125,0.2)] rounded-[4px] placeholder:text-[#CED4DE] font-medium text-sm leading-[21px] tracking-[0.01em] p-2 text-[#475F7D]'
						/>
					</Form.Item>
					{
						post?
							<>
								<div
									className='mt-[30px]'
								>
									<label className='text-[#475F7D] font-semibold text-lg leading-[27px] tracking-[0.01em] flex items-center mb-2'>Title</label>
									<h3
										className='border border-solid border-[rgba(72,95,125,0.2)] rounded-[4px] font-medium text-sm leading-[21px] tracking-[0.01em] p-2 text-[#475F7D]'
									>
										{post.title}
									</h3>
								</div>
								<div
									className='mt-[30px]'
								>
									<label className='text-[#475F7D] font-semibold text-lg leading-[27px] tracking-[0.01em] flex items-center mb-2'>Description</label>
									<div className='border border-solid border-[rgba(72,95,125,0.2)] rounded-[4px] p-2 pb-0'>
										<Markdown md={post.description} />
									</div>
								</div>
							</>
							: null
					}
				</Form>
				{error && <ErrorAlert className='mt-3.5' errorMsg={error} />}
			</section>
		</Modal>
	);
};

export default ContinueWithLinking;