// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Form, Input, Spin } from 'antd';
import React, { useState } from 'react';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import AddTags from '~src/ui-components/AddTags';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { EAllowedCommentor, ILoading, NotificationStatus } from '~src/types';
import ContentForm from '../ContentForm';
import { useDispatch } from 'react-redux';
import AllowedCommentorsRadioButtons from '../AllowedCommentorsRadioButtons';
import { useApiContext } from '~src/context';
import { BN_HUNDRED } from '@polkadot/util';
import queueNotification from '~src/ui-components/QueueNotification';
import executeTx from '~src/util/executeTx';
import classNames from 'classnames';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { CreatePostResponseType } from '~src/auth/types';
import { EAmbassadorActions, IAmbassadorProposalCreation } from './types';
import { ambassadorSeedingActions } from '~src/redux/addAmbassadorSeeding';
import { ambassadorReplacementActions } from '~src/redux/replaceAmbassador';
import { ambassadorRemovalActions } from '~src/redux/removeAmbassador';

const CreateAmbassadorProposal = ({ className, setOpen, openSuccessModal, action, ambassadorPreimage, discussion, proposer }: IAmbassadorProposalCreation) => {
	const dispatch = useDispatch();
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const [form] = Form.useForm();
	const { loginAddress, id: userId } = useUserDetailsSelector();
	const [loading, setLoading] = useState<ILoading>({ isLoading: false, message: '' });
	const [allowedCommentor, setAllowedCommentor] = useState<EAllowedCommentor>(EAllowedCommentor.ALL);

	const handleAmbassadorProposalIndexChange = (proposalIndex: number) => {
		switch (action) {
			case EAmbassadorActions.ADD_AMBASSADOR:
				dispatch(ambassadorSeedingActions.updateAmbassadorProposalIndex(proposalIndex));
				break;
			case EAmbassadorActions.REMOVE_AMBASSADOR:
				dispatch(ambassadorRemovalActions.updateAmbassadorProposalIndex(proposalIndex));
				break;
			case EAmbassadorActions.REPLACE_AMBASSADOR:
				dispatch(ambassadorReplacementActions.updateAmbassadorProposalIndex(proposalIndex));
				break;
		}
	};
	const handleAmbassadorDiscussionTitleChange = (title: string) => {
		switch (action) {
			case EAmbassadorActions.ADD_AMBASSADOR:
				dispatch(ambassadorSeedingActions.updateDiscussionTitle(title || ''));
				break;
			case EAmbassadorActions.REMOVE_AMBASSADOR:
				dispatch(ambassadorRemovalActions.updateDiscussionTitle(title || ''));
				break;
			case EAmbassadorActions.REPLACE_AMBASSADOR:
				dispatch(ambassadorReplacementActions.updateDiscussionTitle(title || ''));
				break;
		}
	};
	const handleAmbassadorDiscussionTagsChange = (tags: string[]) => {
		switch (action) {
			case EAmbassadorActions.ADD_AMBASSADOR:
				dispatch(ambassadorSeedingActions.updateDiscussionTags(tags || []));
				break;
			case EAmbassadorActions.REMOVE_AMBASSADOR:
				dispatch(ambassadorRemovalActions.updateDiscussionTags(tags || []));
				break;
			case EAmbassadorActions.REPLACE_AMBASSADOR:
				dispatch(ambassadorReplacementActions.updateDiscussionTags(tags || []));
				break;
		}
	};
	const handleAmbassadorDiscussionContentChange = (content: string) => {
		switch (action) {
			case EAmbassadorActions.ADD_AMBASSADOR:
				dispatch(ambassadorSeedingActions.updateDiscussionContent(content || ''));
				break;
			case EAmbassadorActions.REMOVE_AMBASSADOR:
				dispatch(ambassadorRemovalActions.updateDiscussionContent(content || ''));
				break;
			case EAmbassadorActions.REPLACE_AMBASSADOR:
				dispatch(ambassadorReplacementActions.updateDiscussionContent(content || ''));
				break;
		}
	};

	const handleSaveProposal = async (postId: number) => {
		const { data, error: apiError } = await nextApiClientFetch<CreatePostResponseType>('api/v1/auth/actions/createTreasuryProposal', {
			allowedCommentors: [allowedCommentor] || [EAllowedCommentor.ALL],
			content: discussion.discussionContent,
			discussionId: null,
			postId,
			proposerAddress: proposer || loginAddress,
			tags: discussion.discussionTags,
			title: discussion.discussionTitle,
			userId: userId
		});

		if (apiError || !data?.post_id) {
			queueNotification({
				header: 'Error',
				message: apiError,
				status: NotificationStatus.ERROR
			});
			console.error(apiError);
		}

		setLoading({ isLoading: false, message: '' });
	};

	const handleSubmit = async () => {
		if (!api || !apiReady || !proposer) return;
		const origin: any = { Origins: 'FellowshipAdmin' };
		setLoading({ isLoading: true, message: 'Awaiting Confirmation' });
		const tx = api.tx.referenda.submit(origin, { Lookup: { hash: ambassadorPreimage?.hash, len: String(ambassadorPreimage?.length) } }, { After: BN_HUNDRED });
		const postId = Number(await api.query.referenda.referendumCount());

		const onSuccess = () => {
			handleAmbassadorProposalIndexChange(postId);
			setOpen(false);
			openSuccessModal();
			setLoading({ isLoading: false, message: '' });
			handleSaveProposal(postId);
		};

		const onFailed = () => {
			queueNotification({
				header: 'failed!',
				message: 'Transaction failed!',
				status: NotificationStatus.ERROR
			});
			setLoading({ isLoading: false, message: '' });
		};

		await executeTx({
			address: proposer || loginAddress,
			api,
			apiReady,
			errorMessageFallback: 'failed!',
			network,
			onFailed,
			onSuccess: onSuccess,
			setStatus: (message: string) => setLoading({ isLoading: true, message: message }),
			tx: tx
		});
	};

	return (
		<>
			<Spin
				spinning={loading.isLoading}
				tip={loading.message || ''}
			>
				<Form
					form={form}
					onFinish={handleSubmit}
					disabled={loading.isLoading}
					initialValues={{ content: discussion?.discussionContent, tags: discussion?.discussionTags || [], title: discussion?.discussionTitle || '' }}
					validateMessages={{ required: "Please add the '${name}'" }}
				>
					<div className={classNames('mt-6 text-sm font-normal text-lightBlue dark:text-blue-dark-high', className)}>
						<label className='font-medium'>Write a proposal :</label>
						<div className='mt-4'>
							<label className='mb-0.5'>
								Title <span className='text-nay_red'>*</span>
							</label>
							<Form.Item
								name='title'
								rules={[
									{
										message: 'Title should not exceed 150 characters.',
										validator(rule, value, callback) {
											if (callback && value?.length > 150) {
												callback(rule?.message?.toString());
											} else {
												callback();
											}
										}
									}
								]}
							>
								<Input
									name='title'
									className='h-10 rounded-[4px] dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
									onChange={(e) => {
										handleAmbassadorDiscussionTitleChange(e?.target?.value || '');
									}}
									value={discussion?.discussionTitle || ''}
								/>
							</Form.Item>
						</div>
						<div className='mt-6'>
							<label className='mb-0.5'>Add Tags</label>
							<Form.Item name='tags'>
								<AddTags
									tags={discussion.discussionTags}
									setTags={(tags: string[]) => handleAmbassadorDiscussionTagsChange(tags || [])}
								/>
							</Form.Item>
						</div>
						<div className='mt-6'>
							<label className='mb-0.5'>
								Description <span className='text-nay_red'>*</span>
							</label>

							<Form.Item name='content'>
								<ContentForm
									value={discussion.discussionContent}
									height={250}
									onChange={(content: string) => {
										handleAmbassadorDiscussionContentChange(content || '');
									}}
								/>
							</Form.Item>
						</div>
					</div>
					{/* who can comment */}
					<AllowedCommentorsRadioButtons
						className={'-mt-8'}
						onChange={(value) => setAllowedCommentor(value as EAllowedCommentor)}
						isLoading={loading.isLoading}
						allowedCommentors={allowedCommentor}
					/>
					<div className='-mx-6 mt-6 flex justify-end border-0 border-t-[1px] border-solid border-section-light-container px-6 pt-4 dark:border-[#3B444F] dark:border-separatorDark'>
						<CustomButton
							htmlType='submit'
							text='Create Proposal'
							variant='primary'
							height={40}
							width={155}
							className={`${!(discussion.discussionTitle && discussion.discussionContent) && 'opacity-50'}`}
							disabled={!(discussion.discussionTitle && discussion.discussionContent)}
						/>
					</div>
				</Form>
			</Spin>
		</>
	);
};

export default CreateAmbassadorProposal;
