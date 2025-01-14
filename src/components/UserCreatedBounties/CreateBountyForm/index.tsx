// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
import React, { useState, useEffect, FC, useCallback } from 'react';
import { spaceGrotesk } from 'pages/_app';
import { Form, DatePicker, InputNumber, Spin } from 'antd';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Input from '~src/basic-components/Input';
import { useNetworkSelector, useUserCreateBountyFormSelector, useUserDetailsSelector } from '~src/redux/selectors';
import Address from '~src/ui-components/Address';
import AddressConnectModal from '~src/ui-components/AddressConnectModal';
import { useTheme } from 'next-themes';
import BalanceInput from '~src/ui-components/BalanceInput';
import dayjs from 'dayjs';
import { RangePickerProps } from 'antd/es/date-picker';
import styled from 'styled-components';
import ContentForm from '~src/components/ContentForm';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { MessageType } from '~src/auth/types';
import queueNotification from '~src/ui-components/QueueNotification';
import { ESocials, NotificationStatus, VerificationStatus } from '~src/types';
import AddTags from '~src/ui-components/AddTags';
import BN from 'bn.js';
import { IVerificationResponse } from 'pages/api/v1/verification';
import { usePostDataContext } from '~src/context';
import _ from 'lodash';
import { VerifiedIcon } from '~src/ui-components/CustomIcons';
import { useDispatch } from 'react-redux';
import { ICreateBountyFormState } from '~src/redux/userCreateBountyForm/@types';
import { resetForm, setFormField } from '~src/redux/userCreateBountyForm';
import { inputToBn } from '~src/util/inputToBn';
import { useRouter } from 'next/router';

interface ICreateBountyForm {
	className?: string;
	theme?: string;
	setOpenCreateBountyModal: (pre: boolean) => void;
	isUsedForEdit?: boolean;
	postInfo?: any;
}

const ZERO_BN = new BN(0);

const CreateBountyForm: FC<ICreateBountyForm> = (props) => {
	const { className, setOpenCreateBountyModal, isUsedForEdit, postInfo } = props;
	const { network } = useNetworkSelector();
	const router = useRouter();
	const { setPostData } = usePostDataContext();
	const { loginAddress } = useUserDetailsSelector();
	const createBountyFormState = useUserCreateBountyFormSelector();
	const dispatch = useDispatch();
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [startLoading, setStartLoading] = useState<boolean>(false);
	const [selectedAddress, setSelectedAddress] = useState<string>(loginAddress);
	const { resolvedTheme: theme } = useTheme();
	const [form] = Form.useForm();
	const [tags, setTags] = useState<string[]>([]);
	const [isTwitterVerified, setIsTwitterVerified] = useState<boolean>(false);
	const [twitterUrl, setTwitterUrl] = useState<string>('');
	const [newBountyAmount, setNewBountyAmount] = useState<BN>(ZERO_BN);
	const [clickedVerifyBtn, setClickedVerifiedBtn] = useState<boolean>(false);

	useEffect(() => {
		form.setFieldsValue({
			address: createBountyFormState.address || selectedAddress || loginAddress,
			balance: createBountyFormState.balance || '0',
			content: createBountyFormState.content || '',
			claims: createBountyFormState.claims,
			deadline: createBountyFormState.deadline ? dayjs(createBountyFormState.deadline) : null,
			guidelines: createBountyFormState.guidelines,
			title: createBountyFormState.title,
			twitter: createBountyFormState.twitter,
			categories: createBountyFormState.categories
		});
		setSelectedAddress(createBountyFormState.address || selectedAddress || loginAddress);

		if (createBountyFormState?.twitter) {
			handleVerify(createBountyFormState?.twitter || '');
		}

		if (createBountyFormState?.balance) {
			const [balance, isValid] = inputToBn(createBountyFormState?.balance || '0', network, false);
			if (isValid) {
				setNewBountyAmount(balance);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		form.setFieldsValue({ address: selectedAddress || loginAddress });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedAddress]);

	const handleFormValueChange = (changedValues: Partial<ICreateBountyFormState>) => {
		Object.keys(changedValues).forEach((key) => {
			const typedKey = key as keyof ICreateBountyFormState;
			dispatch(setFormField(typedKey, typedKey == 'deadline' ? (changedValues[typedKey] ? String(changedValues[typedKey]) : '') : changedValues[typedKey]));
		});
	};
	const allowCreateBounty = () => {
		const formValues = form?.getFieldsValue(['title', 'content', 'address', 'claims', 'deadline', 'twitter']);

		const allow =
			!!(formValues?.title as string)?.length &&
			!!(formValues?.content as string)?.length &&
			!!(formValues?.address as string)?.length &&
			!!formValues?.claims &&
			!!dayjs(formValues?.deadline)?.isValid() &&
			!!formValues?.twitter &&
			!!isTwitterVerified &&
			newBountyAmount.gt(ZERO_BN);

		return allow;
	};

	const disabledDate: RangePickerProps['disabledDate'] = (current: any) => {
		// Can not select days before today and today
		return current && current < dayjs().endOf('day');
	};

	const handleVerify = async (twitterHandle: string) => {
		if (!twitterHandle) return;

		const account = twitterHandle?.split('@')?.[1] || twitterHandle || '';

		setStartLoading(true);

		const { data, error } = await nextApiClientFetch<IVerificationResponse>('api/v1/verification', {
			account,
			checkingVerified: true,
			type: ESocials.TWITTER
		});

		setIsTwitterVerified(data?.message == VerificationStatus.ALREADY_VERIFIED);

		if (error) {
			console?.log(error);
		}

		setStartLoading(false);
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedHandleVerify = useCallback(
		_.debounce((value: string) => {
			handleVerify(value);
		}, 300),
		[]
	);

	const handleTwitterVerification = async () => {
		if (clickedVerifyBtn) {
			handleVerify(twitterUrl);
		} else {
			setClickedVerifiedBtn(true);

			setStartLoading(true);
			const twitterHandle = twitterUrl?.split('@')?.[1] || twitterUrl;
			const isUserCreatedBounty: boolean = true;
			const { data, error } = await nextApiClientFetch<{ url?: string }>(
				`api/v1/verification/twitter-verification?twitterHandle=${twitterHandle}&isUserCreatedBounty=${isUserCreatedBounty}`
			);

			if (data && data?.url) {
				window.open(data?.url, '_blank');
			} else if (error) {
				queueNotification({
					header: 'Error!',
					message: error,
					status: NotificationStatus.ERROR
				});
				console.log(error);
			}
			setStartLoading(false);
		}
	};

	const handleReset = () => {
		dispatch(resetForm() as any);
		form.resetFields();
	};

	const handleFormSubmit = async (values: any) => {
		setLoading(true);
		const { data, error } = await nextApiClientFetch<MessageType>('api/v1/user-created-bounties/createBounty', {
			content: values?.content,
			deadlineDate: dayjs(values?.deadline).toDate(),
			maxClaim: Number(values?.claims),
			proposerAddress: values?.address,
			reward: newBountyAmount?.toString(),
			submissionGuidelines: values?.guidelines,
			tags: values?.categories,
			title: values?.title,
			twitterHandle: values?.twitter
		});
		if (error) {
			console.error('error resetting passoword : ', error);
			setLoading(false);
		}

		if (data) {
			queueNotification({
				header: 'Success!',
				message: data.message,
				status: NotificationStatus.SUCCESS
			});
			setLoading(false);
			router.reload();
			setOpenCreateBountyModal?.(false);
			handleReset();
		}
	};
	const handleEditBounty = async (values: any) => {
		setLoading(true);
		const { data, error } = await nextApiClientFetch<any>('api/v1/user-created-bounties/editBounty', {
			bountyId: postInfo?.id,
			content: values?.content,
			deadlineDate: dayjs(values?.deadline).toDate(),
			maxClaim: Number(values?.claims),
			reward: newBountyAmount?.toString(),
			submissionGuidelines: values?.guidelines,
			tags: values?.categories,
			title: values?.title
		});
		if (error) {
			console.error('error resetting passoword : ', error);
			setLoading(false);
		}

		if (data) {
			setPostData(data?.post);
			queueNotification({
				header: 'Success!',
				message: data.message,
				status: NotificationStatus.SUCCESS
			});
			setLoading(false);
		}
	};

	return (
		<section className={`${className} ${spaceGrotesk.className} ${spaceGrotesk.variable} flex w-full flex-col gap-y-2`}>
			<Form
				layout='vertical'
				onFinish={isUsedForEdit ? handleEditBounty : handleFormSubmit}
				className='mt-4 w-full'
				form={form}
				initialValues={{
					address: postInfo?.proposer || '',
					balance: Number(postInfo?.reward) / 10 ** 10 || '', // Convert from planck to DOT if necessary
					claims: postInfo?.maxClaim || '',
					deadline: postInfo?.deadlineDate ? dayjs(postInfo.deadlineDate) : null,
					content: postInfo?.content || '',
					guidelines: postInfo?.submissionGuidelines || '',
					title: postInfo?.title || ''
				}}
				onValuesChange={handleFormValueChange}
			>
				<Spin spinning={loading}>
					{/* address and twitter */}
					<article className='flex w-full flex-col justify-center gap-y-2 md:flex-row md:items-center md:justify-between md:gap-y-0'>
						<div className='flex w-full items-center gap-x-2 text-sm'>
							<div className='flex w-full flex-col gap-y-1'>
								<p className={`m-0 flex items-center gap-1 p-0 text-sm font-normal text-lightBlue dark:text-blue-dark-medium ${spaceGrotesk.className} ${spaceGrotesk.variable}`}>
									{isUsedForEdit ? 'Selected Account' : 'Select Account'}
									<span className='text-[#FF3C5F]'>*</span>
								</p>
								{!isUsedForEdit ? (
									<Form.Item
										name='address'
										className='w-full'
										rules={[
											{
												message: 'Please select an address',
												required: true
											}
										]}
									>
										<div className='flex h-[40px] w-full items-center justify-between rounded-[4px] border-[1px] border-solid border-section-light-container bg-white px-2 dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay'>
											<Address
												address={selectedAddress}
												isTruncateUsername={false}
												displayInline
											/>
											<CustomButton
												text='Change Wallet'
												onClick={() => setOpen(true)}
												width={120}
												className='change-wallet-button mr-1 flex items-center justify-center text-[10px]'
												height={24}
												variant='primary'
											/>
										</div>
									</Form.Item>
								) : (
									<div className='mb-6 flex h-10 w-full items-center justify-between rounded-[4px] border-[1px] border-solid border-section-light-container bg-[#f5f5f5] px-2 dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay'>
										<Address
											address={postInfo?.proposer || loginAddress}
											displayInline
											disableTooltip
											isTruncateUsername={false}
										/>
									</div>
								)}
							</div>
							{!isUsedForEdit && (
								<div className='flex w-full flex-col gap-y-1'>
									<p className={`m-0 flex gap-1 p-0 text-sm font-normal text-lightBlue dark:text-blue-dark-medium items-center${spaceGrotesk.className} ${spaceGrotesk.variable}`}>
										Twitter<span className='text-[#FF3C5F]'>*</span>
									</p>
									<Form.Item
										name='twitter'
										className='w-full'
										rules={[
											{
												message: 'Please enter your Twitter handle',
												required: false
											}
										]}
									>
										<Input
											name='twitter'
											onChange={(e) => {
												setTwitterUrl(e?.target?.value);
												setIsTwitterVerified(false);
												setClickedVerifiedBtn(false);
												debouncedHandleVerify(e.target?.value);
											}}
											suffix={
												<>
													{!isTwitterVerified ? (
														<CustomButton
															text={clickedVerifyBtn ? 'Confirm' : 'Verify'}
															width={85}
															loading={startLoading}
															disabled={twitterUrl?.length < 0 || startLoading}
															onClick={() => {
																handleTwitterVerification();
															}}
															className={`change-wallet-button mr-1 flex items-center justify-center text-[10px] ${twitterUrl?.length < 0 || startLoading ? 'opacity-60' : ''}`}
															height={24}
															variant='primary'
														/>
													) : (
														<span className='flex items-center justify-center gap-1 text-xs text-[#8d99a9]'>
															<VerifiedIcon className='text-lg' />
															Verified
														</span>
													)}
												</>
											}
											placeholder='@YourTwitter (case sensitive)'
											className={`h-10 rounded-[4px] text-bodyBlue dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F] ${theme}`}
										/>
									</Form.Item>
								</div>
							)}
						</div>
					</article>
					{/* title */}
					<article className='flex w-full flex-col justify-center gap-y-2 md:flex-row md:items-center md:justify-between md:gap-y-0'>
						<div className='flex w-full items-center gap-x-2 text-sm'>
							<div className='flex w-full flex-col gap-y-1'>
								<p className={`m-0 flex items-center gap-1 p-0 text-sm font-normal text-lightBlue dark:text-blue-dark-medium ${spaceGrotesk.className} ${spaceGrotesk.variable}`}>
									Title<span className='text-[#FF3C5F]'>*</span>
								</p>
								<Form.Item
									name='title'
									className='w-full'
									rules={[
										{
											message: 'Please enter your bounty title handle',
											required: true
										}
									]}
								>
									<Input
										name='title'
										value={postInfo?.title || ''}
										placeholder='Add title for your bounty'
										className={`h-10 rounded-[4px] text-bodyBlue dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F] ${theme}`}
									/>
								</Form.Item>
							</div>
						</div>
					</article>
					{/* amount balance */}
					<article className='flex w-full flex-col justify-center gap-y-2 md:flex-row md:items-center md:justify-between md:gap-y-0'>
						<div className='flex w-full items-center gap-x-2 text-sm'>
							<div className='flex w-full flex-col gap-y-1'>
								<BalanceInput
									label={
										<p className={`item m-0 flex gap-1 p-0 text-sm font-normal text-lightBlue dark:text-blue-dark-medium ${spaceGrotesk.className} ${spaceGrotesk.variable}`}>
											Amount<span className='text-[#FF3C5F]'>*</span>
										</p>
									}
									placeholder='Enter Amount'
									onChange={(tip) => setNewBountyAmount(tip)}
									isBalanceUpdated={open}
									className='mt-0'
									noRules
									theme={theme}
								/>{' '}
							</div>
						</div>
					</article>
					{/* Submission Guidelines */}
					<article className='mt-2 flex w-full flex-col justify-center gap-y-2 md:flex-row md:items-center md:justify-between md:gap-y-0'>
						<div className='flex w-full items-center gap-x-2 text-sm'>
							<div className='flex w-full flex-col gap-y-1'>
								<p className={`m-0 p-0 text-sm font-normal text-lightBlue dark:text-blue-dark-medium ${spaceGrotesk.className} ${spaceGrotesk.variable}`}>Submission Guidelines</p>
								<Form.Item
									name='guidelines'
									className='w-full'
									rules={[
										{
											required: false
										}
									]}
								>
									<Input
										name='guidelines'
										placeholder='Add more context for submissions'
										className={`h-10 rounded-[4px] text-bodyBlue dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F] ${theme}`}
									/>
								</Form.Item>
							</div>
						</div>
					</article>
					{/* date and claims */}
					<article className='flex w-full flex-col justify-center gap-y-2 md:flex-row md:items-center md:justify-between md:gap-y-0'>
						<div className='flex w-full items-center gap-x-2 text-sm'>
							<div className='flex w-full flex-col gap-y-1'>
								<p className={`m-0 flex items-center gap-1 p-0 text-sm font-normal text-lightBlue dark:text-blue-dark-medium ${spaceGrotesk.className} ${spaceGrotesk.variable}`}>
									Deadline<span className='text-[#FF3C5F]'>*</span>
								</p>
								<Form.Item
									name='deadline'
									className='w-full'
									rules={[
										{
											message: 'Please select deadline',
											required: true
										}
									]}
								>
									<DatePicker
										className={className}
										disabledDate={disabledDate}
										clearIcon={false}
									/>
								</Form.Item>
							</div>
							<div className='flex w-full flex-col gap-y-1'>
								<p className={`m-0 flex items-center gap-1 p-0 text-sm font-normal text-lightBlue dark:text-blue-dark-medium ${spaceGrotesk.className} ${spaceGrotesk.variable}`}>
									Max no of claims<span className='text-[#FF3C5F]'>*</span>
								</p>
								<Form.Item
									name='claims'
									className='w-full'
									rules={[
										{
											message: 'Please enter max claims',
											required: true
										}
									]}
								>
									<InputNumber
										name='claims'
										type='number'
										placeholder='Enter maximum number of requests'
										className={`h-10 w-full rounded-[4px] text-bodyBlue dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F] ${theme}`}
									/>
								</Form.Item>
							</div>
						</div>
					</article>
					{/* categories */}
					<article className='flex w-full flex-col justify-center gap-y-2 md:flex-row md:items-center md:justify-between md:gap-y-0'>
						<div className='flex w-full items-center gap-x-2 text-sm'>
							<div className='flex w-full flex-col gap-y-1'>
								<p className={`m-0 p-0 text-sm font-normal text-lightBlue dark:text-blue-dark-medium ${spaceGrotesk.className} ${spaceGrotesk.variable}`}>Categories</p>
								<Form.Item name='categories'>
									<AddTags
										tags={tags}
										setTags={setTags}
									/>
								</Form.Item>
							</div>
						</div>
					</article>
					{/* content */}
					<article className='-mb-6 flex w-full flex-col justify-center gap-y-2 md:flex-row md:items-center md:justify-between md:gap-y-0'>
						<div className='mb-4 flex w-full items-center gap-x-2 text-sm'>
							<div className='flex w-full flex-col gap-y-1'>
								<p className={`m-0 flex items-center gap-1 p-0 text-sm font-normal text-lightBlue dark:text-blue-dark-medium ${spaceGrotesk.className} ${spaceGrotesk.variable}`}>
									Description<span className='text-[#FF3C5F]'>*</span>
								</p>
								<ContentForm
									value={form.getFieldValue('content')}
									height={250}
								/>
							</div>
						</div>
					</article>
					{/* footer buttons */}
					<div className='-mx-6 flex items-center justify-end gap-4 border-0 border-t-[1px] border-solid border-section-light-container px-6 pt-4 dark:border-separatorDark'>
						<Form.Item>
							<CustomButton
								variant='default'
								text='Cancel'
								disabled={loading}
								htmlType='reset'
								buttonsize='sm'
								onClick={() => {
									setOpenCreateBountyModal?.(false);
								}}
							/>
						</Form.Item>
						<Form.Item>
							<CustomButton
								variant='primary'
								text={isUsedForEdit ? 'Edit' : 'Create'}
								loading={loading}
								disabled={loading || !allowCreateBounty()}
								buttonsize='sm'
								htmlType='submit'
								className={allowCreateBounty() ? '' : ' opacity-50'}
								onClick={() => {
									allowCreateBounty();
								}}
							/>
						</Form.Item>
					</div>
				</Spin>
			</Form>
			<AddressConnectModal
				open={open}
				setOpen={setOpen}
				walletAlertTitle='Batch Voting.'
				onConfirm={(address: string) => {
					setSelectedAddress(address);
				}}
				isUsedInBatchVoting={true}
			/>
		</section>
	);
};

export default styled(CreateBountyForm)`
	.ant-picker {
		height: 40px !important;
		width: 100% !important;
		background: transparent !important;
		color: ${(props: any) => (props.theme === 'dark' ? 'white' : '')} !important;
		border-color: ${(props: any) => (props.theme === 'dark' ? '#4B4B4B' : '#D9D9D9')};
	}
	.ant-picker .ant-picker-input > input {
		color: ${(props: any) => (props.theme === 'dark' ? 'white' : '#243a57')} !important;
	}

	.ant-picker .ant-picker-suffix {
		filter: invert(56%) sepia(0%) saturate(15%) hue-rotate(141deg) brightness(101%) contrast(93%) !important;
	}

	.ant-picker-panel-container {
		background: ${(props: any) => (props.theme === 'dark' ? 'black' : '#D9D9D9')} !important;
	}
	.ant-input {
		border-color: ${(props: any) => (props.theme === 'dark' ? '#4B4B4B' : '#D2D8E0')};
		color: ${(props: any) => (props.theme === 'dark' ? 'white' : '#243a57')} !important;
	}
	.ant-input-number .ant-input-number-input:placeholder-shown {
		height: 38px !important;
		color: ${(props: any) => (props.theme === 'dark' ? 'white' : '#243a57')} !important;
	}
	.ant-input-number .ant-input-number-input {
		height: 38px !important;
		color: ${(props: any) => (props.theme === 'dark' ? 'white' : '#243a57')} !important;
	}
`;
