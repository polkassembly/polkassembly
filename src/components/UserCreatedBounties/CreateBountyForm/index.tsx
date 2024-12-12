// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState, useEffect, FC } from 'react';
import { spaceGrotesk } from 'pages/_app';
import { Form, DatePicker } from 'antd';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Input from '~src/basic-components/Input';
import { useUserDetailsSelector } from '~src/redux/selectors';
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
import { ESocials, NotificationStatus } from '~src/types';
import AddTags from '~src/ui-components/AddTags';
import BN from 'bn.js';
import { IVerificationResponse } from 'pages/api/v1/verification';
import messages from '~src/auth/utils/messages';

interface ICreateBountyForm {
	className?: string;
	theme?: string;
	setOpenCreateBountyModal: (pre: boolean) => void;
}

const CreateBountyForm: FC<ICreateBountyForm> = (props) => {
	const { className, setOpenCreateBountyModal } = props;
	const [open, setOpen] = useState(false);
	const { loginAddress } = useUserDetailsSelector();
	const [loading, setLoading] = useState<boolean>(false);
	const [startLoading, setStartLoading] = useState<boolean>(false);
	const [selectedAddress, setSelectedAddress] = useState<string>(loginAddress);
	const { resolvedTheme: theme } = useTheme();
	const [form] = Form.useForm();
	const [tags, setTags] = useState<string[]>([]);
	const [isTwitterVerified, setIsTwitterVerified] = useState<boolean>(false);
	const [twitterUrl, setTwitterUrl] = useState<string>('');
	const [newBountyAmount, setNewBountyAmount] = useState<any>();

	const onValueChange = (balance: BN) => setNewBountyAmount(balance);

	useEffect(() => {
		form.setFieldsValue({ address: selectedAddress });
	}, [selectedAddress, form]);

	const disabledDate: RangePickerProps['disabledDate'] = (current: any) => {
		// Can not select days before today and today
		return current && current < dayjs().endOf('day');
	};

	const handleVerify = async (checkingVerified?: boolean) => {
		const fieldName = ESocials.TWITTER;
		const account = twitterUrl?.split('@')?.[1] || twitterUrl;
		setStartLoading(true);

		const { data, error } = await nextApiClientFetch<IVerificationResponse>('api/v1/verification', {
			account,
			checkingVerified: Boolean(checkingVerified),
			type: fieldName
		});

		if (error) {
			console.log(error);
			setIsTwitterVerified(false);
			if (error === messages.INVALID_JWT)
				queueNotification({
					header: 'Error!',
					message: error,
					status: NotificationStatus.ERROR
				});
		}
		if (data) {
			setIsTwitterVerified(true);
		}
		setStartLoading(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	};

	const handleTwitterVerification = async () => {
		setStartLoading(true);
		const twitterHandle = twitterUrl?.split('@')?.[1] || twitterUrl;
		const { data, error } = await nextApiClientFetch<{ url?: string }>(`api/v1/verification/twitter-verification?twitterHandle=${twitterHandle}`);

		if (data && data?.url) {
			handleVerify();
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
	};

	const handleFormSubmit = async (values: any) => {
		setLoading(true);
		// title, content, tags, reward, proposerAddress, submissionGuidelines, deadlineDate, maxClaim
		const { data, error } = await nextApiClientFetch<MessageType>('api/v1/user-created-bounties/createBounty', {
			content: values?.description,
			deadlineDate: dayjs(values?.deadline).toDate(),
			maxClaim: Number(values?.claims),
			proposerAddress: values?.address,
			reward: newBountyAmount.toString(),
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
		}
	};

	return (
		<section className={`${className} ${spaceGrotesk.className} ${spaceGrotesk.variable} flex w-full flex-col gap-y-2`}>
			<Form
				layout='vertical'
				onFinish={handleFormSubmit}
				className='mt-4 w-full'
				form={form}
			>
				{/* address and twitter */}
				<article className='flex w-full flex-col justify-center gap-y-2 md:flex-row md:items-center md:justify-between md:gap-y-0'>
					<div className='flex w-full items-center gap-x-2 text-sm'>
						<div className='flex w-full flex-col gap-y-1'>
							<p className={`m-0 p-0 text-sm font-normal text-lightBlue dark:text-blue-dark-medium ${spaceGrotesk.className} ${spaceGrotesk.variable}`}>Select Account</p>
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
						</div>
						<div className='flex w-full flex-col gap-y-1'>
							<p className={`m-0 p-0 text-sm font-normal text-lightBlue dark:text-blue-dark-medium ${spaceGrotesk.className} ${spaceGrotesk.variable}`}>Twitter</p>
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
									}}
									suffix={
										<>
											{!isTwitterVerified ? (
												<CustomButton
													text='Verify'
													width={80}
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
												<p className='m-0 p-0 text-xs text-lightBlue dark:text-blue-dark-medium'>(verified)</p>
											)}
										</>
									}
									placeholder='@YourTwitter (case sensitive)'
									className={`h-10 rounded-[4px] text-bodyBlue dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F] ${theme}`}
								/>
							</Form.Item>
						</div>
					</div>
				</article>
				{/* title */}
				<article className='flex w-full flex-col justify-center gap-y-2 md:flex-row md:items-center md:justify-between md:gap-y-0'>
					<div className='flex w-full items-center gap-x-2 text-sm'>
						<div className='flex w-full flex-col gap-y-1'>
							<p className={`m-0 p-0 text-sm font-normal text-lightBlue dark:text-blue-dark-medium ${spaceGrotesk.className} ${spaceGrotesk.variable}`}>Title*</p>
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
							<p className={`m-0 p-0 text-sm font-normal text-lightBlue dark:text-blue-dark-medium ${spaceGrotesk.className} ${spaceGrotesk.variable}`}>Amount*</p>
							<Form.Item
								name='balance'
								className='w-full'
								rules={[
									{
										message: 'Enter bounty amount',
										required: true
									}
								]}
							>
								<BalanceInput
									placeholder={'Enter an amount for your bounty '}
									className='m-0 p-0 text-sm font-medium'
									// formItemName={'balance'}
									theme={theme}
								/>
								<BalanceInput
									theme={theme}
									balance={newBountyAmount}
									// formItemName='balance'
									placeholder='Enter an amount for your bounty'
									inputClassName='dark:text-blue-dark-high text-bodyBlue'
									noRules
									onChange={onValueChange}
								/>
							</Form.Item>
						</div>
					</div>
				</article>
				{/* Submission Guidelines */}
				<article className='-mt-6 flex w-full flex-col justify-center gap-y-2 md:flex-row md:items-center md:justify-between md:gap-y-0'>
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
							<p className={`m-0 p-0 text-sm font-normal text-lightBlue dark:text-blue-dark-medium ${spaceGrotesk.className} ${spaceGrotesk.variable}`}>Deadline</p>
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
								<DatePicker disabledDate={disabledDate} />
							</Form.Item>
						</div>
						<div className='flex w-full flex-col gap-y-1'>
							<p className={`m-0 p-0 text-sm font-normal text-lightBlue dark:text-blue-dark-medium ${spaceGrotesk.className} ${spaceGrotesk.variable}`}>Max no of claims</p>
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
								<Input
									name='claims'
									placeholder='Enter maximum number of requests'
									className={`h-10 rounded-[4px] text-bodyBlue dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F] ${theme}`}
								/>
							</Form.Item>
						</div>
					</div>
				</article>
				{/* categories */}
				<article className='flex w-full flex-col justify-center gap-y-2 md:flex-row md:items-center md:justify-between md:gap-y-0'>
					<div className='flex w-full items-center gap-x-2 text-sm'>
						<div className='flex w-full flex-col gap-y-1'>
							<p className={`m-0 p-0 text-sm font-normal text-lightBlue dark:text-blue-dark-medium ${spaceGrotesk.className} ${spaceGrotesk.variable}`}>Categories*</p>
							<Form.Item name='categories'>
								<AddTags
									tags={tags}
									setTags={setTags}
								/>
							</Form.Item>
						</div>
					</div>
				</article>
				{/* description */}
				<article className='-mb-6 flex w-full flex-col justify-center gap-y-2 md:flex-row md:items-center md:justify-between md:gap-y-0'>
					<div className='flex w-full items-center gap-x-2 text-sm'>
						<div className='flex w-full flex-col gap-y-1'>
							<p className={`m-0 p-0 text-sm font-normal text-lightBlue dark:text-blue-dark-medium ${spaceGrotesk.className} ${spaceGrotesk.variable}`}>Description*</p>
							<Form.Item
								name='description'
								className='w-full'
								rules={[
									{
										message: 'Please add bounty description',
										required: true
									}
								]}
							>
								<ContentForm />
							</Form.Item>
						</div>
					</div>
				</article>
				{/* footer buttons */}
				<div className='-mx-6 flex items-center justify-end gap-x-2 border-0 border-t-[1px] border-solid border-section-light-container px-6 pt-6'>
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
							text='Create'
							loading={loading}
							disabled={loading}
							buttonsize='sm'
							htmlType='submit'
							onClick={() => {
								setOpenCreateBountyModal?.(false);
							}}
						/>
					</Form.Item>
				</div>
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
`;
