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

interface ICreateBountyForm {
	className?: string;
	theme?: string;
	setOpenCreateBountyModal: (pre: boolean) => void;
}

const CreateBountyForm: FC<ICreateBountyForm> = (props) => {
	const { className, setOpenCreateBountyModal } = props;
	const [open, setOpen] = useState(false);
	const { loginAddress } = useUserDetailsSelector();
	const [selectedAddress, setSelectedAddress] = useState<string>(loginAddress);
	const { resolvedTheme: theme } = useTheme();
	const [form] = Form.useForm();
	useEffect(() => {
		form.setFieldsValue({ address: selectedAddress });
	}, [selectedAddress, form]);

	const disabledDate: RangePickerProps['disabledDate'] = (current: any) => {
		// Can not select days before today and today
		return current && current < dayjs().endOf('day');
	};

	const handleFormSubmit = (values: any) => {
		console.log('Form Submitted with Values:', values);
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
										required: true
									}
								]}
							>
								<Input
									name='twitter'
									suffix={
										<CustomButton
											text='Verify'
											onClick={() => {
												console.log('Twitter handle verification triggered.');
											}}
											width={80}
											className='change-wallet-button mr-1 flex items-center justify-center text-[10px]'
											height={24}
											variant='primary'
										/>
									}
									placeholder='@YourTwitter (case sensitive)'
									className={`h-10 rounded-[4px] text-bodyBlue dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F] ${theme}`}
									onChange={(e) => console.log(e.target.value)}
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
									onChange={(e) => console.log(e.target.value)}
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
									onChange={(e) => {
										console.log(e);
									}}
									className='m-0 p-0 text-sm font-medium'
									formItemName={'balance'}
									theme={theme}
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
									onChange={(e) => console.log(e.target.value)}
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
								<DatePicker
									disabledDate={disabledDate}
									format='DD-MM-YYYY'
									onChange={(e) => {
										console.log(e);
									}}
								/>
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
									onChange={(e) => console.log(e.target.value)}
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
							<Form.Item
								name='categories'
								className='w-full'
								rules={[
									{
										message: 'Please add categories',
										required: true
									}
								]}
							>
								<Input
									name='categories'
									placeholder='Add more context for your request'
									className={`h-10 rounded-[4px] text-bodyBlue dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F] ${theme}`}
									onChange={(e) => console.log(e.target.value)}
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
								<ContentForm onChange={(v: string) => console.log(v)} />
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
							buttonsize='sm'
							htmlType='submit'
							// loading={loading}
							// className={`${loading ? 'opacity-60' : ''}`}
							// disabled={!report_uploaded}
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
