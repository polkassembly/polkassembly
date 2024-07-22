// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Form, Switch } from 'antd';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import ContentForm from 'src/components/ContentForm';
import { PostCategory } from 'src/global/post_categories';
import { usePollEndBlock } from 'src/hooks';
import { EAllowedCommentor, EGovType, NotificationStatus } from 'src/types';
import BackToListingView from 'src/ui-components/BackToListingView';
import ErrorAlert from 'src/ui-components/ErrorAlert';
import queueNotification from 'src/ui-components/QueueNotification';
import styled from 'styled-components';

import { ChangeResponseType, CreatePostResponseType } from '~src/auth/types';
import POLL_TYPE from '~src/global/pollTypes';
import { ProposalType } from '~src/global/proposalType';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import TopicsRadio from './TopicsRadio';
import AddTags from '~src/ui-components/AddTags';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { trackEvent } from 'analytics';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Input from '~src/basic-components/Input';
import dayjs from 'dayjs';
import AllowedCommentorsRadioButtons from '~src/components/AllowedCommentorsRadioButtons';

interface Props {
	className?: string;
	proposalType: ProposalType;
}

const postFormKey = `form:post:${ProposalType.DISCUSSIONS}`;

const CreatePost = ({ className, proposalType }: Props) => {
	const router = useRouter();
	const currentUser = useUserDetailsSelector();
	const { network } = useNetworkSelector();

	const [form] = Form.useForm();
	const pollEndBlock = usePollEndBlock();
	const [topicId, setTopicId] = useState<number>(2);
	const [hasPoll, setHasPoll] = useState<boolean>(false);
	const [formDisabled, setFormDisabled] = useState<boolean>(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [govType, setGovType] = useState<EGovType>(isOpenGovSupported(network) ? EGovType.OPEN_GOV : EGovType.GOV1);
	const [tags, setTags] = useState<string[]>([]);
	const [allowedCommentors, setAllowedCommentors] = useState<EAllowedCommentor>(EAllowedCommentor.ALL);

	useEffect(() => {
		if (!currentUser?.id) {
			router.replace('/');
		}
	}, [currentUser?.id, router]);

	const createSubscription = async (postId: number) => {
		if (!currentUser.email_verified) return;

		const { data, error } = await nextApiClientFetch<ChangeResponseType>('api/v1/auth/actions/postSubscribe', { post_id: postId, proposalType });
		if (error) console.error('Error subscribing to post', error);
		if (data?.message) console.log(data.message);
	};

	const createPoll = async (postId: number) => {
		if (!hasPoll) return;

		if (!pollEndBlock) {
			queueNotification({
				header: 'Failed to get end block number. Poll creation failed!',
				message: 'Failed',
				status: NotificationStatus.ERROR
			});
			return;
		}

		const { error: apiError } = await nextApiClientFetch('api/v1/auth/actions/createPoll', {
			blockEnd: pollEndBlock,
			pollType: POLL_TYPE.NORMAL,
			postId,
			proposalType
		});

		if (apiError) {
			console.error('Error creating a poll', apiError);
			return;
		}
	};

	const handleSend = async () => {
		if (!currentUser.id || !topicId) return;
		try {
			await form.validateFields();
			// Validation is successful
			const content = form.getFieldValue('content');
			const title = form.getFieldValue('title');

			// GAEvent for create post
			trackEvent('create_post_clicked', 'discussion_post_creation', {
				content: content,
				title: title,
				userId: currentUser?.id || '',
				userName: currentUser?.username || ''
			});

			if (!title || !content) return;

			setFormDisabled(true);
			setLoading(true);
			const details = localStorage.getItem('discussionCreated');
			const lastCreationDetails = details ? JSON.parse(details || '') : null;

			if (lastCreationDetails && Number(lastCreationDetails.count) >= 3) {
				const lastTime = dayjs(JSON.parse(lastCreationDetails.createdAt));

				if (!lastTime.isBefore(dayjs().subtract(1, 'hour'))) {
					queueNotification({
						header: 'Max Limit Reached!',
						message: 'Discussion Creation Limit Execced!',
						status: NotificationStatus.INFO
					});
					setLoading(false);
					setFormDisabled(false);
					return;
				} else {
					localStorage.removeItem('discussionCreated');
				}
			}

			const { data, error: apiError } = await nextApiClientFetch<CreatePostResponseType>('api/v1/auth/actions/createPost', {
				allowedCommentors: [allowedCommentors],
				content,
				gov_type: govType,
				proposalType,
				tags,
				title,
				topicId,
				userId: currentUser.id
			});

			if (apiError || !data?.post_id) {
				setError(apiError || 'There was an error creating your post.');
				queueNotification({
					header: 'Error',
					message: 'There was an error creating your post.',
					status: NotificationStatus.ERROR
				});
				console.error(apiError);
			}

			if (data && data.post_id) {
				const details = localStorage.getItem('discussionCreated');
				const lastCreationDetails = details ? JSON.parse(details || '') : null;
				if (!lastCreationDetails) {
					localStorage.setItem('discussionCreated', JSON.stringify({ count: 1, createdAt: JSON.stringify(new Date()) }));
				} else {
					localStorage.setItem('discussionCreated', JSON.stringify({ count: Number(lastCreationDetails.count || 0) + 1, createdAt: lastCreationDetails?.createdAt || new Date() }));
				}

				const postId = data.post_id;
				router.push(`/${proposalType === ProposalType.GRANTS ? 'grant' : 'post'}/${postId}`);
				setAllowedCommentors(EAllowedCommentor.ALL);
				queueNotification({
					header: 'Thanks for sharing!',
					message: 'Post created successfully.',
					status: NotificationStatus.SUCCESS
				});
				createSubscription(postId);
				createPoll(postId);
			}
			setFormDisabled(false);
			setLoading(false);
		} catch {
			//do nothing, await form.validateFields(); will automatically highlight the error ridden fields
		} finally {
			setFormDisabled(false);
		}
		localStorage.removeItem(postFormKey);
	};

	const savePostFormCacheValue = (key: string, value: string) => {
		const cacheObj = JSON.parse(localStorage.getItem(postFormKey) || '{}');
		cacheObj[key] = value;
		localStorage.setItem(postFormKey, JSON.stringify(cacheObj));
	};

	useEffect(() => {
		const cacheObj = JSON.parse(localStorage.getItem(postFormKey) || '{}');

		form.setFieldsValue({
			content: cacheObj.content || '',
			title: cacheObj.title || ''
		});

		setHasPoll(cacheObj.hasPoll === 'true');
		setGovType(cacheObj.govType || 'gov_1');
		setTopicId(Number(cacheObj.topicId) || 2);
		setTags(JSON.parse(cacheObj.tags || '[]'));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className={className}>
			<BackToListingView postCategory={proposalType === ProposalType.DISCUSSIONS ? PostCategory.DISCUSSION : PostCategory.GRANT} />

			<div className='mb-4 mt-6 flex w-full flex-col rounded-md bg-white p-4 shadow-md dark:bg-section-dark-overlay md:p-8'>
				<h2 className='dashboard-heading mb-8 text-bodyBlue dark:text-blue-dark-high'>New Post</h2>
				{error && (
					<ErrorAlert
						errorMsg={error}
						className='mb-4'
					/>
				)}

				<Form
					form={form}
					name='create-post-form'
					onFinish={handleSend}
					layout='vertical'
					disabled={formDisabled || loading}
					validateMessages={{ required: "Please add the '${name}'" }}
				>
					<label className='mb-1 text-sm font-normal tracking-wide text-sidebarBlue dark:text-white'>
						Title<span className='ml-1 text-red-500'>*</span>
					</label>
					<Form.Item
						name='title'
						rules={[{ required: true }]}
					>
						<Input
							onChange={(e) => savePostFormCacheValue('title', e.target.value)}
							name='title'
							autoFocus
							placeholder='Enter Title'
							className='text-bodyBlue dark:border-[#4b4b4b] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
						/>
					</Form.Item>
					<ContentForm onChange={(v) => savePostFormCacheValue('content', v)} />
					<div className='flex items-center'>
						<Switch
							size='small'
							checked={hasPoll}
							onChange={(checked) => {
								savePostFormCacheValue('hasPoll', String(checked));
								setHasPoll(checked);
							}}
						/>
						<span className='ml-2 text-sm text-sidebarBlue dark:text-white'>Add poll to {proposalType === ProposalType.DISCUSSIONS ? 'discussion' : 'grant'}</span>
					</div>
					{proposalType === ProposalType.DISCUSSIONS && (
						<Form.Item
							className='mt-8'
							name='topic'
							rules={[
								{
									message: "Please select a 'topic'",
									validator(rule, value = topicId, callback) {
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
										savePostFormCacheValue('topicId', String(id));
									}}
									topicId={topicId}
								/>
							</>
						</Form.Item>
					)}
					<h5 className='text-color mt-8 text-sm font-normal dark:text-white'>Add Tags</h5>
					<AddTags
						tags={tags}
						setTags={setTags}
						onChange={(arr) => savePostFormCacheValue('tags', JSON.stringify(arr))}
					/>
					{/* who can comment */}
					<AllowedCommentorsRadioButtons
						className='mt-8 gap-2'
						onChange={(value: EAllowedCommentor) => setAllowedCommentors?.(value as EAllowedCommentor)}
						isLoading={loading}
						allowedCommentors={allowedCommentors}
					/>
					<Form.Item>
						<CustomButton
							text='Create Post'
							htmlType='submit'
							disabled={!currentUser.id || formDisabled || loading}
							className='mt-10'
							fontSize='md'
							width={150}
							height={40}
							variant='primary'
						/>
					</Form.Item>
				</Form>
			</div>
		</div>
	);
};

export default styled(CreatePost)`
	.text-color {
		color: #334d6ee5;
	}
`;
