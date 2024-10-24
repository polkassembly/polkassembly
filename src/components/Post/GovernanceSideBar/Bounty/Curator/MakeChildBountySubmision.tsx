// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC, useEffect, useState } from 'react';
import { Modal, Form, Spin } from 'antd';
import Input from '~src/basic-components/Input';
import BalanceInput from '~src/ui-components/BalanceInput';
import { useTheme } from 'next-themes';
import classNames from 'classnames';
import { poppins } from 'pages/_app';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import Balance from '~src/components/Balance';
import { useUserDetailsSelector } from '~src/redux/selectors';
import Address from '~src/ui-components/Address';
import ContentForm from '~src/components/ContentForm';
import AddTags from '~src/ui-components/AddTags';
import BN from 'bn.js';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { MessageType } from '~src/auth/types';
import queueNotification from '~src/ui-components/QueueNotification';
import { IChildBountySubmission, NotificationStatus } from '~src/types';

interface IBountyChildBountiesProps {
	bountyId?: number | string | null;
	ModalTitle?: string;
	setOpen: (pre: boolean) => void;
	open: boolean;
	editing?: boolean;
	submission?: IChildBountySubmission | null;
	onSubmissionCreated: (created: boolean) => void;
}

const ZERO_BN = new BN(0);

const MakeChildBountySubmisionModal: FC<IBountyChildBountiesProps> = (props) => {
	const { loginAddress } = useUserDetailsSelector();
	const { bountyId, ModalTitle, open, setOpen, editing = false, submission, onSubmissionCreated = false } = props;
	const { resolvedTheme: theme } = useTheme();
	const [title, setTitle] = useState<string>('');
	const [content, setContent] = useState<string>('');
	const [link, setLink] = useState<string>('');
	const [tags, setTags] = useState<string[]>([]);
	const [reqAmount, setReqAmount] = useState<string>('0');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async () => {
		setLoading(true);

		const url = editing ? '/api/v1/bounty/curator/submissions/editSubmission' : '/api/v1/bounty/curator/submissions/addSubmissions';
		const { data, error } = await nextApiClientFetch<MessageType>(url, {
			content,
			link,
			parentBountyIndex: bountyId,
			proposerAddress: loginAddress,
			reqAmount,
			tags,
			title
		});

		if (data?.message) {
			queueNotification({
				header: 'Success!',
				message: data?.message || 'Child Bounty Sumbission added successfully',
				status: NotificationStatus.SUCCESS
			});
			if (typeof onSubmissionCreated === 'function') {
				onSubmissionCreated(true);
			}
			setOpen(false);
		}
		if (error) {
			queueNotification({
				header: 'Error!',
				message: error || 'Error in saving your submission',
				status: NotificationStatus.ERROR
			});
		}
		setLoading(false);
	};

	const handleModalClose = () => {
		setTitle('');
		setContent('');
		setLink('');
		setTags([]);
		setReqAmount('0');
		setOpen(false);
	};

	useEffect(() => {
		if (submission && editing) {
			setTitle(submission?.title || '');
			setContent(submission?.content || '');
			setTags(submission?.tags || []);
			setReqAmount(submission?.reqAmount || '0');
			setLink(submission?.link || '');
		}
	}, [submission, editing]);

	return (
		<>
			<Modal
				wrapClassName='dark:bg-modalOverlayDark'
				className={classNames(poppins.className, poppins.variable, 'w-[600px]')}
				open={open}
				footer={false}
				maskClosable={false}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
				onCancel={() => {
					handleModalClose();
					setOpen(false);
				}}
				title={
					<div className='-mx-6 border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-2 text-lg tracking-wide text-bodyBlue dark:border-separatorDark dark:text-blue-dark-high'>
						{ModalTitle || 'Make Submission'}
					</div>
				}
			>
				<Spin spinning={loading}>
					<Form
						layout='vertical'
						initialValues={{ content: submission?.content || '', link: submission?.link || '', tags: submission?.tags || [], title: submission?.title || '' }}
						className='mt-6 text-sm font-normal text-lightBlue dark:text-blue-dark-high'
					>
						<Form.Item name='proposer'>
							<div className=' flex items-center justify-between text-lightBlue dark:text-blue-dark-medium'>
								<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>Proposer Address </label>
								{!!loginAddress && <Balance address={loginAddress} />}
							</div>
							<div className='flex w-full items-end gap-2 text-sm '>
								<div className='flex h-10 w-full items-center justify-between rounded-[4px] border-[1px] border-solid border-section-light-container bg-[#f5f5f5] px-2 dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay'>
									<Address
										address={loginAddress || ''}
										isTruncateUsername={false}
										displayInline
									/>
								</div>
							</div>
						</Form.Item>
						<div>
							<label className='mb-0.5 '>
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
									onChange={(e) => setTitle(e.target.value?.trim() || '')}
									value={title}
								/>
							</Form.Item>
						</div>

						<section className='mt-4'>
							<BalanceInput
								theme={theme}
								balance={new BN(reqAmount || '0')}
								formItemName='reqAmount'
								placeholder='Enter Amount'
								label={
									<label className='mb-0.5 dark:text-white'>
										Request Amount <span className='text-nay_red'>*</span>
									</label>
								}
								inputClassName='dark:text-blue-dark-high text-bodyBlue'
								className='mb-0'
								onChange={(amount: BN) => setReqAmount(amount.toString())}
							/>{' '}
						</section>

						<section>
							<label className='mb-0.5 '>
								Link <span className='text-nay_red'>*</span>
							</label>
							<Form.Item name='link'>
								<Input
									name='link'
									className='h-10 rounded-[4px] dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
									onChange={(e) => {
										setLink(e.target.value?.trim() || '');
									}}
									value={link}
								/>
							</Form.Item>
						</section>

						<section className='mt-6'>
							<label className='mb-0.5'>Categories</label>
							<Form.Item name='tags'>
								<AddTags
									tags={tags}
									setTags={(tags: string[]) => setTags(tags)}
								/>
							</Form.Item>
						</section>
						<section className='mt-6'>
							<label className='mb-0.5'>
								Description <span className='text-nay_red'>*</span>
							</label>
							<Form.Item name='content'>
								<ContentForm
									value={content}
									height={250}
									onChange={(content: string) => {
										setContent(content?.trim() || '');
									}}
								/>
							</Form.Item>
						</section>
					</Form>
					<div className='-mx-6 mt-6 flex justify-end gap-2 border-0 border-t-[1px] border-solid border-section-light-container px-6 pt-4 dark:border-[#3B444F] dark:border-separatorDark'>
						<CustomButton
							text='Back'
							variant='default'
							height={40}
							width={155}
							onClick={() => setOpen(false)}
						/>
						<CustomButton
							text='Send'
							variant='primary'
							onClick={() => handleSubmit()}
							height={40}
							width={155}
							className={classNames(
								new BN(reqAmount || '0').eq(ZERO_BN) || !title || !content || (!!link?.length && !link?.startsWith('https:')) ? 'opacity-50' : '',
								'border-none'
							)}
							disabled={new BN(reqAmount || '0').eq(ZERO_BN) || !title || !content || (!!link?.length && !link?.startsWith('https:'))}
						/>
					</div>
				</Spin>
			</Modal>
		</>
	);
};

export default MakeChildBountySubmisionModal;
