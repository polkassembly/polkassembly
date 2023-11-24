// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Form, FormInstance, Input, Radio, Spin } from 'antd';
import AddTags from '~src/ui-components/AddTags';
import Markdown from '~src/ui-components/Markdown';
import { ISteps } from '.';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IPostResponse } from 'pages/api/v1/posts/on-chain-post';
import { LoadingOutlined } from '@ant-design/icons';
import queueNotification from '~src/ui-components/QueueNotification';
import { NotificationStatus } from '~src/types';
import _ from 'lodash';
import styled from 'styled-components';
import ContentForm from '../ContentForm';
import { useNetworkSelector } from '~src/redux/selectors';

interface Props {
	isDiscussionLinked: boolean | null;
	setIsDiscussionLinked: (pre: boolean) => void;
	discussionLink: string;
	setDiscussionLink: (pre: string) => void;
	title: string;
	content: string;
	tags: string[];
	setTitle: (pre: string) => void;
	setContent: (pre: string) => void;
	setTags: (pre: string[]) => void;
	setSteps: (pre: ISteps) => void;
	form: FormInstance;
}

const WriteProposal = ({
	setSteps,
	setIsDiscussionLinked,
	isDiscussionLinked,
	discussionLink,
	setDiscussionLink,
	title,
	setTitle,
	content,
	setContent,
	tags,
	setTags,
	form
}: Props) => {
	const { network } = useNetworkSelector();
	const [loading, setLoading] = useState<boolean>(false);
	const [isDiscussionFound, setIsDiscussionFound] = useState<boolean>(true);

	const handleSubmit = async () => {
		await form.validateFields();
		setSteps({ percent: 0, step: 1 });
	};
	const isDiscussionLinkedValid = (value: string) => {
		const regex = /^https:\/\/\w+\.polkassembly\.io\/post\/\d+$/;
		return !regex.test(value) || value.split('https://')[1].split('.')[0] !== network;
	};

	const getDiscussionPostData = async (link: string, isDiscussionLinked: boolean) => {
		const regex = /^https:\/\/\w+\.polkassembly\.io\/post\/\d+$/;
		if (!regex.test(link)) return;

		const linkNetwork = link?.split('https://')[1]?.split('.')?.[0];
		const postId = link.split('post/')[1];
		if (network !== linkNetwork) return;
		setLoading(true);
		const { data, error } = await nextApiClientFetch<IPostResponse>(`api/v1/posts/off-chain-post?postId=${postId}&network=${network}`);
		if (data) {
			setTitle(data.title || '');
			setContent(data.content || '');
			setTags(data?.tags || []);
			form.setFieldValue('title', data?.title || '');
			form.setFieldValue('content', data?.content || '');
			form.setFieldValue('tags', data?.tags || []);
			setIsDiscussionFound(true);
			setSteps({ percent: 100, step: 0 });
			setLoading(false);
			onChangeLocalStorageSet({ content: data?.content || '', tags: data?.tags || [], title: data?.title || '' }, Boolean(isDiscussionLinked));
		} else if (error) {
			setIsDiscussionFound(false);
			queueNotification({
				header: 'Failed!',
				message: 'Unable to fetch data for this discussion number.',
				status: NotificationStatus.ERROR
			});
		}
		setLoading(false);
	};
	const handleStateChange = (writeProposalFormData: any) => {
		setSteps({ percent: 33.3, step: 0 });
		if (writeProposalFormData?.discussionLink) {
			setSteps({ percent: 66.6, step: 0 });
			!(writeProposalFormData?.content && writeProposalFormData.title) && getDiscussionPostData(writeProposalFormData?.discussionLink, writeProposalFormData?.isDiscussionLinked);
		}
		writeProposalFormData?.discussionLink && writeProposalFormData.title && writeProposalFormData.content && setSteps({ percent: 100, step: 0 });
		setDiscussionLink(writeProposalFormData?.discussionLink || '');
		setTitle(writeProposalFormData?.title || '');
		setContent(writeProposalFormData?.content || '');
		setTags(writeProposalFormData?.tags || []);
		form.setFieldValue('discussion_link', writeProposalFormData?.discussionLink || '');
		form.setFieldValue('title', writeProposalFormData?.title || '');
		form.setFieldValue('content', writeProposalFormData?.content || '');
		form.setFieldValue('tags', writeProposalFormData?.tags || []);
	};

	useEffect(() => {
		let data: any = localStorage.getItem('treasuryProposalData');
		data = JSON.parse(data);
		if (data && data?.writeProposalForm) {
			const isDiscussionLink = data?.isDiscussionLinked;
			data?.isDiscussionLinked !== undefined && setIsDiscussionLinked(Boolean(isDiscussionLink));
			setSteps({ percent: 33.3, step: 0 });
			const writeProposalFormData = data?.writeProposalForm?.[isDiscussionLink ? 'discussionLinkForm' : 'withoutDiscussionLinkForm'] || {};
			handleStateChange(writeProposalFormData);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onChangeLocalStorageSet = (obj: any, isDiscussionLink: boolean, isDiscussionLinkedStateChange?: boolean) => {
		let data: any = localStorage.getItem('treasuryProposalData');
		if (data) {
			data = JSON.parse(data);
		}

		const writeProposalFormKey = isDiscussionLink ? 'discussionLinkForm' : 'withoutDiscussionLinkForm';
		const writeProposalFormData = data?.writeProposalForm || {};
		const writeProposalKeysData = data?.writeProposalForm?.[writeProposalFormKey] || {};

		localStorage.setItem(
			'treasuryProposalData',
			JSON.stringify({
				...data,
				isDiscussionLinked: isDiscussionLink,
				step: 0,
				writeProposalForm: {
					...writeProposalFormData,
					[writeProposalFormKey]: { ...writeProposalKeysData, ...obj }
				}
			})
		);
		isDiscussionLinkedStateChange && handleStateChange(writeProposalKeysData);
	};

	const handleChangeIsDiscussion = () => {
		setTitle('');
		setTags([]);
		setContent('');
		form.resetFields(['content', 'tags', 'title']);
		setIsDiscussionFound(true);
	};

	const handleIsDiscussionLinkedChange = (value: boolean) => {
		setIsDiscussionLinked(value);
		handleChangeIsDiscussion();
		onChangeLocalStorageSet({ isDiscussionLinked: value }, value, true);
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const populateDiscussionPostDataFn = useCallback(_.debounce(getDiscussionPostData, 1500), []);
	const handleChangeDiscussionLink = (link: string, isDiscussionLinked: boolean) => {
		setDiscussionLink(link);
		handleChangeIsDiscussion();
		populateDiscussionPostDataFn(link, isDiscussionLinked);
		onChangeLocalStorageSet({ discussionLink: link }, Boolean(isDiscussionLinked));
		setSteps({ percent: 66.6, step: 0 });
	};

	return (
		<>
			<Spin
				spinning={loading}
				indicator={<LoadingOutlined />}
			>
				<div className='write-proposal my-8 flex flex-col'>
					<label className='text-sm text-lightBlue dark:text-blue-dark-high'>Have you initiated a discussion post for your proposal already? </label>
					<Radio.Group
						disabled={loading}
						onChange={(e) => handleIsDiscussionLinkedChange(e.target.value)}
						size='small'
						className='mt-1.5'
						value={isDiscussionLinked}
					>
						<Radio
							value={true}
							className='text-sm font-normal text-bodyBlue dark:text-blue-dark-high'
						>
							Yes
						</Radio>
						<Radio
							value={false}
							className='text-sm font-normal text-bodyBlue dark:text-blue-dark-high'
						>
							No
						</Radio>
					</Radio.Group>
				</div>
				<Form
					onFinish={handleSubmit}
					form={form}
					disabled={loading}
					initialValues={{ content, discussion_link: discussionLink, tags, title }}
					validateMessages={{ required: "Please add the '${name}'" }}
				>
					{isDiscussionLinked && (
						<>
							<label className='mb-1.5 text-sm text-lightBlue dark:text-blue-dark-high'>Link Discussion Post</label>
							<Form.Item
								name='discussion_link'
								rules={[
									{
										message: `Please add a valid discussion link for ${network} Network`,
										validator(rule, value, callback) {
											if (callback && isDiscussionLinkedValid(value)) {
												callback(rule?.message?.toString());
											} else {
												callback();
											}
										}
									}
								]}
							>
								<Input
									name='discussion_link'
									value={discussionLink}
									onChange={(e) => handleChangeDiscussionLink(e.target.value, Boolean(isDiscussionLinked))}
									className='h-[40px] rounded-[4px] dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:placeholder-white dark:focus:border-[#91054F]'
									placeholder='https://'
								/>
							</Form.Item>
						</>
					)}
					{isDiscussionLinked === false && (
						<Alert
							type='info'
							className='icon-alert dark:border-[#125798] dark:bg-[#05263F]'
							showIcon
							message={
								<span className='text-[13px] font-normal text-bodyBlue dark:text-blue-dark-high'>
									Discussion posts allows the community to deliberate and recommend improvements. A Discussion should be created before creating a proposal.
									<a
										className='ml-1 text-xs font-semibold text-pink_primary'
										target='_blank'
										rel='noreferrer'
										href={'/post/create'}
									>
										Create Discussion Post
									</a>
								</span>
							}
						/>
					)}

					{isDiscussionLinked !== null && (isDiscussionLinked ? discussionLink && !isDiscussionLinkedValid(discussionLink) && isDiscussionFound : true) && (
						<div className='mt-6 text-sm font-normal text-lightBlue dark:text-blue-dark-high'>
							<label className='font-medium'>Write a proposal :</label>
							<div className='mt-4'>
								<label className='mb-0.5'>
									Title <span className='text-nay_red'>*</span>
								</label>
								<Form.Item name='title'>
									<Input
										name='title'
										className='h-[40px] rounded-[4px] dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
										onChange={(e) => {
											setTitle(e.target.value);
											onChangeLocalStorageSet({ title: e.target.value }, Boolean(isDiscussionLinked));
											setSteps({ percent: content.length === 0 ? 83.33 : 100, step: 0 });
										}}
										disabled={isDiscussionLinked}
									/>
								</Form.Item>
							</div>
							<div className='mt-6'>
								<label className='mb-0.5'>{isDiscussionLinked ? 'Tags' : 'Add Tags'}</label>
								<Form.Item name='tags'>
									<AddTags
										onChange={(e) => onChangeLocalStorageSet({ tags: e }, isDiscussionLinked)}
										tags={tags}
										setTags={setTags}
										disabled={isDiscussionLinked}
									/>
								</Form.Item>
							</div>
							<div className='mt-6'>
								<label className='mb-0.5'>
									Description <span className='text-nay_red'>*</span>
								</label>
								{isDiscussionLinked ? (
									<Markdown
										imgHidden
										className='post-content rounded-[4px] border-[1px] border-solid border-[#dddddd] bg-[#f5f5f5] px-3 py-2 dark:bg-section-dark-overlay dark:text-blue-dark-high'
										md={`${content?.slice(0, 300)}...` || content}
									/>
								) : (
									<Form.Item name='content'>
										<ContentForm
											value={content}
											height={250}
											onChange={(content: string) => {
												setContent(content);
												onChangeLocalStorageSet({ content: content }, isDiscussionLinked);
												setSteps({ percent: title.length === 0 ? 83.33 : 100, step: 0 });
											}}
										/>
									</Form.Item>
								)}
							</div>
						</div>
					)}
					<div className='-mx-6 mt-6 flex justify-end border-0 border-t-[1px] border-solid border-[#D2D8E0] px-6 pt-4 dark:border-[#3B444F] dark:border-separatorDark'>
						<Button
							htmlType='submit'
							className={`h-[40px] w-[155px] rounded-[4px] bg-pink_primary text-sm font-medium tracking-[0.05em] text-white ${
								(!isDiscussionLinked ? !(title && content) : !(discussionLink && title && content)) && 'opacity-50'
							}`}
							disabled={!isDiscussionLinked ? !(title && content) : !(discussionLink && title && content)}
						>
							Next
						</Button>
					</div>
				</Form>
			</Spin>
		</>
	);
};
export default styled(WriteProposal)`
	.icon-alert .ant-alert-icon {
		margin-top: -20px !important;
	}
`;
