// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Form, Input, Modal } from 'antd';
import { ILinkPostConfirmResponse } from 'pages/api/v1/auth/actions/linkPostConfirm';
import React, { FC, useEffect, useState } from 'react';
import ContentForm from '~src/components/ContentForm';
import { useNetworkContext, usePostDataContext } from '~src/context';
import { NotificationStatus } from '~src/types';
import ErrorAlert from '~src/ui-components/ErrorAlert';
import queueNotification from '~src/ui-components/QueueNotification';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { getPostTypeAndId } from './ContinueWithLinking';
import { ILinkPostStartResponse } from 'pages/api/v1/auth/actions/linkPostStart';
import LinkPostPreview from './LinkPostPreview';
import { IEditPostResponse } from 'pages/api/v1/auth/actions/editPost';
import AddTags from '~src/ui-components/AddTags';

interface ILinkingAndEditingProps {
	setLinkingAndEditingOpen: React.Dispatch<React.SetStateAction<boolean>>;
	linkingAndEditingOpen: boolean;
	isOnchainPost: boolean;
}

const LinkingAndEditing: FC<ILinkingAndEditingProps> = (props) => {
	const { linkingAndEditingOpen, setLinkingAndEditingOpen, isOnchainPost } =
		props;
	const [form] = Form.useForm();
	const [post, setPost] = useState<ILinkPostStartResponse>();
	const [url, setUrl] = useState('');
	const [prevUrl, setPrevUrl] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [formDisabled, setFormDisabled] = useState<boolean>(false);
	const [editPostValue, setEditPostValue] = useState({
		content: '',
		title: ''
	});

	const {
		postData: {
			content,
			postIndex,
			postType,
			title,
			post_link,
			timeline,
			tags: oldTags
		},
		setPostData
	} = usePostDataContext();
	const { network } = useNetworkContext();

	const [tags, setTags] = useState<string[]>(oldTags);

	useEffect(() => {
		setEditPostValue({
			content,
			title
		});
	}, [content, title]);

	useEffect(() => {
		if (post_link && post_link.description && post_link.title) {
			setPost({
				created_at: post_link.created_at || '',
				description: post_link.description,
				last_edited_at: post_link.last_edited_at || '',
				proposer: post_link.proposer,
				tags: post_link.tags,
				title: post_link.title,
				topic: post_link.topic,
				username: post_link.username
			});
		}
	}, [post_link]);

	const onFinish = async ({
		url,
		content: updatedContent,
		title: updatedTitle
	}: any) => {
		setError('');
		setFormDisabled(true);
		setLoading(true);
		try {
			if (!url || !url.trim()) {
				if (!updatedContent) {
					setError('Please enter a valid content');
					setFormDisabled(false);
					setLoading(false);
					return;
				}
				if (!updatedTitle) {
					setError('Please enter a valid title');
					setFormDisabled(false);
					setLoading(false);
					return;
				}
				const { data, error: editError } =
					await nextApiClientFetch<IEditPostResponse>(
						'api/v1/auth/actions/editPost',
						{
							content: updatedContent,
							postId: postIndex,
							proposalType: postType,
							tags: tags && Array.isArray(tags) ? tags : [],
							timeline,
							title: updatedTitle
						}
					);
				if (editError || !data) {
					setError(editError || 'Error in editing the post.');
					setFormDisabled(false);
					setLoading(false);
					return;
				}

				if (data) {
					queueNotification({
						header: 'Success!',
						message: 'Your post was edited',
						status: NotificationStatus.SUCCESS
					});
					const { content, proposer, title, topic, last_edited_at } =
						data;
					setPostData((prev) => ({
						...prev,
						content,
						last_edited_at,
						proposer,
						tags: tags && Array.isArray(tags) ? tags : [],
						title,
						topic
					}));
					setLoading(false);
					setFormDisabled(false);
					setPost(undefined);
					setError('');
					setPrevUrl('');
					form.setFieldValue('url', '');
					setLinkingAndEditingOpen(false);
					return;
				}
			} else {
				if (prevUrl !== url) {
					const postTypeAndId = getPostTypeAndId(network, url);
					if (!postTypeAndId) {
						setError('Invalid URL');
						setFormDisabled(false);
						setLoading(false);
						return;
					}
					const { data, error } =
						await nextApiClientFetch<ILinkPostStartResponse>(
							'api/v1/auth/actions/linkPostStart',
							{
								postId: postTypeAndId.id,
								postType: postTypeAndId.type
							}
						);
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
					}
				} else {
					const postTypeAndId = getPostTypeAndId(network, url);
					if (!postTypeAndId) {
						setError('Invalid URL');
						setFormDisabled(false);
						setLoading(false);
						return;
					}
					const { data, error } =
						await nextApiClientFetch<ILinkPostConfirmResponse>(
							'api/v1/auth/actions/linkPostConfirm',
							{
								currPostId: postIndex,
								currPostType: postType,
								postId: postTypeAndId.id,
								postType: postTypeAndId.type
							}
						);
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
							content: isOnchainPost
								? post?.description || ''
								: prev.content,
							last_edited_at: post?.last_edited_at,
							post_link: {
								created_at: post?.created_at,
								description: post?.description,
								id: postTypeAndId.id,
								last_edited_at: post?.last_edited_at,
								tags:
									post?.tags && Array.isArray(post?.tags)
										? post?.tags
										: prev.tags,
								title: post?.title,
								type: postTypeAndId.type
							},
							tags:
								post?.tags && Array.isArray(post?.tags)
									? post?.tags
									: prev.tags,
							timeline: data.timeline,
							title: isOnchainPost
								? post?.title || ''
								: prev.title
						}));
					}
				}
			}
		} catch (error) {
			if (error) {
				if (typeof error === 'string') {
					setError(error);
				} else if (
					typeof error === 'object' &&
					typeof error.message === 'string'
				) {
					setError(error.message);
				} else {
					setError('Something went wrong');
				}
			} else {
				setError('Something went wrong');
			}
			setFormDisabled(false);
			setLoading(false);
			return;
		}

		setPrevUrl(url);
		setFormDisabled(false);
		setLoading(false);
	};
	return (
		<Modal
			open={linkingAndEditingOpen}
			onCancel={() => setLinkingAndEditingOpen(false)}
			footer={[
				<div key="save" className="flex items-center justify-end">
					<Button
						loading={loading}
						disabled={formDisabled}
						onClick={() => {
							if (
								content !== editPostValue.content ||
								title !== editPostValue.title
							) {
								form.submit();
							} else if (prevUrl === url) {
								onFinish({
									updatedContent: content,
									updatedTitle: title,
									url
								});
							} else {
								onFinish({
									updatedContent: editPostValue.content,
									updatedTitle: editPostValue.title,
									url
								});
							}
						}}
						className={`'border-none outline-none bg-pink_primary text-white rounded-[4px] px-4 py-1 font-medium text-sm leading-[21px] tracking-[0.0125em] capitalize' ${
							formDisabled
								? 'cursor-not-allowed'
								: 'cursor-pointer'
						}`}
					>
						{prevUrl === url ||
						content !== editPostValue.content ||
						title !== editPostValue.title
							? 'Save'
							: 'Preview'}
					</Button>
				</div>
			]}
			className="md:min-w-[674px]"
		>
			<section className="flex flex-col">
				<h2 className="mt-3 text-sidebarBlue font-semibold text-xl leading-[24px]">
					Edit Proposal Details
				</h2>
				<Form
					form={form}
					name="edit-post-form"
					onFinish={onFinish}
					layout="vertical"
					disabled={formDisabled || loading}
					initialValues={{
						content,
						title: title
					}}
					validateMessages={{ required: "Please add the '${name}'" }}
				>
					<Form.Item
						name="title"
						label={
							<span className="text-[#475F7D] text-lg leading-[27px] tracking-[0.01em] font-semibold">
								Title
							</span>
						}
						rules={[
							{
								required: true
							}
						]}
						className="mt-5"
					>
						<Input
							name="title"
							autoFocus
							onChange={(e) =>
								setEditPostValue((prev) => ({
									...prev,
									title: e.target.value
								}))
							}
							placeholder="Add your title here"
							className="border border-solid border-[rgba(72,95,125,0.2)] rounded-[4px] placeholder:text-[#CED4DE] font-medium text-sm leading-[21px] tracking-[0.01em] p-2 text-[#475F7D]"
						/>
					</Form.Item>
					<div className="mt-[30px]">
						<label className="text-[#475F7D] font-semibold text-lg leading-[27px] tracking-[0.01em] flex items-center mb-2">
							Description
						</label>
						<ContentForm
							onChange={(content) => {
								setEditPostValue((prev) => ({
									...prev,
									content: content
								}));
								return content.length ? content : null;
							}}
						/>
					</div>
					<div className="mt-[30px]">
						<label className="text-[#475F7D] font-semibold text-lg leading-[27px] tracking-[0.01em] flex items-center mb-2">
							Tags
						</label>
						<AddTags
							tags={tags}
							setTags={setTags}
							className="mb-1"
						/>
					</div>
					{post_link ? (
						<article>
							<h3 className="text-[#475F7D] text-lg leading-[27px] tracking-[0.01em] font-semibold mb-2">
								Linked Discussion
							</h3>
							<LinkPostPreview post={post} />
							<div className="flex items-center justify-end my-2">
								<Button
									loading={loading}
									disabled={formDisabled}
									onClick={() => {
										form.submit();
									}}
									className={`'border-none outline-none bg-pink_primary text-white rounded-[4px] px-4 py-1 font-medium text-sm leading-[21px] tracking-[0.0125em] capitalize' ${
										formDisabled
											? 'cursor-not-allowed'
											: 'cursor-pointer'
									}`}
								>
									Unlink
								</Button>
							</div>
						</article>
					) : (
						<article className="flex flex-col gap-y-3">
							<Form.Item
								name="url"
								label={
									<span className="text-[#475F7D] text-lg leading-[27px] tracking-[0.01em] font-semibold">
										Link{' '}
										{!isOnchainPost
											? 'Onchain'
											: 'Discussion'}{' '}
										Post
									</span>
								}
								className="mt-5 mb-0"
							>
								<Input
									name="url"
									onChange={(e) => {
										setPrevUrl('');
										setUrl(e.target.value);
										setPost(undefined);
									}}
									autoFocus
									placeholder="Enter your post URL here"
									className="border border-solid border-[rgba(72,95,125,0.2)] rounded-[4px] placeholder:text-[#CED4DE] font-medium text-sm leading-[21px] tracking-[0.01em] p-2 text-[#475F7D]"
								/>
							</Form.Item>
							<LinkPostPreview post={post} />
						</article>
					)}
				</Form>
				{error && <ErrorAlert className="mt-3" errorMsg={error} />}
			</section>
		</Modal>
	);
};

export default LinkingAndEditing;
