// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Form, Input, Radio, Spin } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import AddTags from '~src/ui-components/AddTags';
import Markdown from '~src/ui-components/Markdown';
import { useGov1treasuryProposal, useNetworkSelector } from '~src/redux/selectors';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IPostResponse } from 'pages/api/v1/posts/on-chain-post';
import queueNotification from '~src/ui-components/QueueNotification';
import { EAllowedCommentor, NotificationStatus } from '~src/types';
import ContentForm from '../ContentForm';
import { useDispatch } from 'react-redux';
import { gov1TreasuryProposalActions, updateGov1TreasuryProposal } from '~src/redux/gov1TreasuryProposal';
import _ from 'lodash';
import classNames from 'classnames';
import Alert from '~src/basic-components/Alert';
import AllowedCommentorsRadioButtons from '../AllowedCommentorsRadioButtons';
import { useTranslation } from 'next-i18next';

interface Props {
	className?: string;
	setStep: (pre: number) => void;
}
const WriteProposal = ({ setStep, className }: Props) => {
	const { t } = useTranslation('common');
	const { network } = useNetworkSelector();
	const gov1ProposalData = useGov1treasuryProposal();
	const dispatch = useDispatch();
	const [form] = Form.useForm();
	const { isDiscussionLinked: discussionLinked, discussionLink, title, content, tags, allowedCommentors } = gov1ProposalData;
	const [loading, setLoading] = useState<boolean>(false);
	const [isDiscussionLinked, setIsDiscussionLinked] = useState<boolean | null>(discussionLinked);

	const handleOnchange = (obj: any) => {
		dispatch(updateGov1TreasuryProposal({ ...gov1ProposalData, ...obj }));
	};

	const handleSubmit = async () => {
		handleOnchange({ firstStepPercentage: 100 });
		setStep(1);
	};

	const isDiscussionLinkedValid = (value: string) => {
		const regex = /^https:\/\/\w+\.polkassembly\.io\/post\/\d+$/;
		return !regex.test(value) || value.split('https://')[1].split('.')[0] !== network;
	};

	const getDiscussionPostData = async (link: string) => {
		const regex = /^https:\/\/\w+\.polkassembly\.io\/post\/\d+$/;
		if (!regex.test(link)) return;

		const linkNetwork = link?.split('https://')[1]?.split('.')?.[0];
		const postId = link.split('post/')[1];

		if (network !== linkNetwork) return;

		setLoading(true);

		const { data, error } = await nextApiClientFetch<IPostResponse>(`api/v1/posts/off-chain-post?postId=${postId}&network=${network}`);
		if (data) {
			handleOnchange({
				content: data?.content,
				discussionId: postId,
				discussionLink: link,
				firstStepPercentage: 100,
				tags: data?.tags,
				title: data.title
			});
			form.setFieldsValue({ content: data?.content, tags: data?.tags, title: data?.title });
			setLoading(false);
		} else if (error) {
			queueNotification({
				header: t('notification_failed'),
				message: t('notification_fetch_failed'),
				status: NotificationStatus.ERROR
			});
			setLoading(false);
		}
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const populateDiscussionPostDataFn = useCallback(_.debounce(getDiscussionPostData, 1500), []);
	const handleChangeDiscussionLink = (link: string) => {
		handleOnchange({ firstStepPercentage: 66.6 });
		populateDiscussionPostDataFn(link);
	};

	useEffect(() => {
		getDiscussionPostData(discussionLink);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [discussionLink]);

	return (
		<>
			<Spin spinning={loading}>
				<div className={classNames(className, 'write-proposal my-8 flex flex-col')}>
					<label className='text-sm text-lightBlue dark:text-blue-dark-high'>{t('initiate_discussion')}</label>
					<Radio.Group
						disabled={loading}
						onChange={(e) => {
							setIsDiscussionLinked(e.target.value);
							handleOnchange({ content: '', isDiscussionLinked: e.target.value, tags: [], title: '' });
							form.setFieldValue('content', '');
							form.setFieldValue('title', '');
							form.setFieldValue('tags', []);
							dispatch(gov1TreasuryProposalActions.setAllowedCommentors(EAllowedCommentor.ALL));
						}}
						size='small'
						className='mt-1.5'
						value={isDiscussionLinked}
					>
						<Radio
							value={true}
							className='text-sm font-normal text-bodyBlue dark:text-blue-dark-high'
						>
							{t('yes')}
						</Radio>
						<Radio
							value={false}
							className='text-sm font-normal text-bodyBlue dark:text-blue-dark-high'
						>
							{t('no')}
						</Radio>
					</Radio.Group>
				</div>
				<Form
					form={form}
					onFinish={handleSubmit}
					disabled={loading}
					initialValues={{ content, discussion_link: discussionLink, tags, title }}
					validateMessages={{ required: t('required_field') }}
				>
					{isDiscussionLinked && (
						<>
							<label className='mb-1.5 text-sm text-lightBlue dark:text-blue-dark-high'>{t('link_discussion_post')}</label>
							<Form.Item
								name='discussion_link'
								rules={[
									{
										message: t('invalid_discussion_link', { network }),
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
									onChange={(e) => handleChangeDiscussionLink(e.target.value)}
									className='h-10 rounded-[4px] dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:placeholder-white dark:focus:border-[#91054F]'
									placeholder='https://'
								/>
							</Form.Item>
						</>
					)}
					{isDiscussionLinked === false && (
						<Alert
							type='info'
							className='icon-alert'
							showIcon
							message={
								<span className='text-[13px] font-normal text-bodyBlue dark:text-blue-dark-high'>
									{t('discussion_info')}
									<a
										className='ml-1 text-xs font-semibold text-pink_primary'
										target='_blank'
										rel='noreferrer'
										href={'/post/create'}
									>
										{t('create_discussion')}
									</a>
								</span>
							}
						/>
					)}
					{isDiscussionLinked !== null && (isDiscussionLinked ? !!discussionLink && !isDiscussionLinkedValid(discussionLink) : true) && (
						<div className='mt-6 text-sm font-normal text-lightBlue dark:text-blue-dark-high'>
							<label className='font-medium'>{t('write_proposal')}</label>
							<div className='mt-4'>
								<label className='mb-0.5'>
									{t('title')} <span className='text-nay_red'>*</span>
								</label>
								<Form.Item
									name='title'
									rules={
										isDiscussionLinked
											? []
											: [
													{
														message: t('title_length_exceeded'),
														validator(rule, value, callback) {
															if (callback && value?.length > 150) {
																callback(rule?.message?.toString());
															} else {
																callback();
															}
														}
													}
											  ]
									}
								>
									<Input
										name='title'
										className='h-10 rounded-[4px] dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
										onChange={(e) => {
											handleOnchange({ firstStepPercentage: content.length === 0 ? 83.33 : 100, title: e.target.value });
										}}
										disabled={isDiscussionLinked}
										value={title}
									/>
								</Form.Item>
							</div>
							<div className='mt-6'>
								<label className='mb-0.5'>{isDiscussionLinked ? t('tags') : t('add_tags')}</label>
								<Form.Item name='tags'>
									<AddTags
										tags={tags}
										setTags={(tags: string[]) => handleOnchange({ tags: tags })}
										disabled={isDiscussionLinked}
									/>
								</Form.Item>
							</div>
							<div className='mt-6'>
								<label className='mb-0.5'>
									{t('description')} <span className='text-nay_red'>*</span>
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
												handleOnchange({ content: content, firstStepPercentage: title.length === 0 ? 83.33 : 100 });
											}}
										/>
									</Form.Item>
								)}
							</div>
						</div>
					)}
					<AllowedCommentorsRadioButtons
						className={isDiscussionLinked ? 'mt-6 ' : '-mt-8'}
						onChange={(value) => dispatch(gov1TreasuryProposalActions.setAllowedCommentors(value as EAllowedCommentor))}
						isLoading={loading}
						allowedCommentors={allowedCommentors}
					/>
					<div className='-mx-6 mt-6 flex justify-end border-0 border-t-[1px] border-solid border-section-light-container px-6 pt-4 dark:border-[#3B444F] dark:border-separatorDark'>
						<CustomButton
							htmlType='submit'
							text={t('next')}
							variant='primary'
							height={40}
							width={155}
							className={`${(!isDiscussionLinked ? !(title && content) : !(discussionLink && title && content)) && 'opacity-50'}`}
							disabled={!isDiscussionLinked ? !(title && content) : !(discussionLink && title && content)}
						/>
					</div>
				</Form>
			</Spin>
		</>
	);
};

export default WriteProposal;
