// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Spin, Alert } from 'antd';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useApiContext } from '~src/context';
import AccountSelectionForm from '~src/ui-components/AccountSelectionForm';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import BN from 'bn.js';
import { NotificationStatus, Wallet } from '~src/types';
import { dmSans } from 'pages/_app';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import { useTheme } from 'next-themes';
import queueNotification from '~src/ui-components/QueueNotification';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import getAccountsFromWallet from '~src/util/getAccountsFromWallet';
import ContentForm from '~src/components/ContentForm';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

const ZERO_BN = new BN(0);

interface Props {
	openModal: boolean;
	setOpenModal: (pre: boolean) => void;
	parentBountyIndex: number;
}

const CreateSubmissionForm = ({ openModal, setOpenModal, parentBountyIndex }: Props) => {
	const { network } = useNetworkSelector();
	const userDetails = useUserDetailsSelector();
	const { api, apiReady } = useApiContext();
	const { loginAddress, loginWallet } = userDetails;
	const { resolvedTheme: theme } = useTheme();
	const [form] = Form.useForm();
	const [loadingStatus, setLoadingStatus] = useState<{ isLoading: boolean; message: string }>({
		isLoading: false,
		message: ''
	});
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);
	const [showBalanceAlert, setShowBalanceAlert] = useState<boolean>(false);
	const [showError, setShowError] = useState(false);

	useEffect(() => {
		if (!api || !apiReady) return;

		const loadBalance = async () => {
			try {
				setLoadingStatus({ isLoading: true, message: 'Fetching balance' });

				const accountData = await api.query.system.account(loginAddress);
				const accountsData = await getAccountsFromWallet({
					api,
					apiReady,
					chosenWallet: loginWallet || (localStorage.getItem('loginWallet') as Wallet),
					loginAddress,
					network
				});
				setAccounts(accountsData?.accounts || []);
				const balance = new BN(accountData.data.free.toString() || '0');
				setAvailableBalance(balance);

				if (balance.lt(ZERO_BN)) {
					queueNotification({
						header: 'Insufficient Balance',
						message: 'Your balance is insufficient.',
						status: NotificationStatus.ERROR
					});
					setShowBalanceAlert(true);
				}
				setShowBalanceAlert(false);
			} catch (error) {
				console.error('Failed to fetch balance:', error);
			} finally {
				setLoadingStatus({ isLoading: false, message: '' });
			}
		};

		loadBalance();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, loginAddress]);

	const handleSubmit = async () => {
		if (!api || !apiReady) {
			return;
		}

		setLoadingStatus({ isLoading: true, message: 'Submitting' });
		const values = form.getFieldsValue();

		const hasValidationErrors = !form.getFieldValue('title') || !form.getFieldValue('requestAmount') || !form.getFieldValue('description');

		if (hasValidationErrors) {
			setShowError(true);
			return;
		}

		setShowError(false);

		const requestBody = {
			title: values.title,
			content: values.description,
			tags: [],
			link: values.links || '',
			reqAmount: String(values.requestAmount),
			proposerAddress: loginAddress,
			parentBountyIndex: parentBountyIndex
		};

		try {
			const { data, error } = await nextApiClientFetch<any>('/api/v1/user-created-bounties/submissions/addSubmission', requestBody);

			if (error || !data) {
				console.log('Submission failed:', error);
				queueNotification({
					header: 'Error',
					message: 'Submission failed.',
					status: NotificationStatus.ERROR
				});
				setLoadingStatus({ isLoading: false, message: '' });
				return;
			}

			queueNotification({
				header: 'Success!',
				message: 'Submission created successfully.',
				status: NotificationStatus.SUCCESS
			});
			setLoadingStatus({ isLoading: false, message: '' });
			setOpenModal(false);
		} catch (error) {
			console.log(error);
		}
	};

	console.log('availableBalance', availableBalance);

	return (
		<Modal
			open={openModal}
			onCancel={() => setOpenModal(false)}
			title={
				<div className={`${dmSans.className} ${dmSans.variable}`}>
					<div className='flex items-center gap-2 text-xl font-semibold text-bodyBlue dark:text-blue-dark-high'>
						<span>Make Submission</span>
					</div>
				</div>
			}
			footer={
				<div className='flex justify-end'>
					<CustomButton
						onClick={() => setOpenModal(false)}
						text='Cancel'
						variant='default'
						height={40}
						width={156}
					/>
					<CustomButton
						onClick={handleSubmit}
						variant='primary'
						htmlType='submit'
						height={40}
						width={156}
						text='Send'
					/>
				</div>
			}
			width={600}
			closable
			className={`${dmSans.className} ${dmSans.variable} rounded-[14px] dark:bg-section-dark-overlay`}
			closeIcon={<CloseIcon className=' text-lightBlue dark:text-icon-dark-inactive' />}
		>
			<Spin spinning={loadingStatus.isLoading}>
				<div className=' py-3'>
					<Form
						form={form}
						onFinish={handleSubmit}
						initialValues={{
							loginAddress
						}}
					>
						<Form.Item
							name='loginAddress'
							rules={[
								{ required: true, message: 'Address is required' },
								{
									validator: async (_, value) => {
										if (!value) {
											return Promise.reject(new Error('Please enter a valid address'));
										}
										try {
											return Promise.resolve();
										} catch (error) {
											return Promise.reject(new Error('Failed to calculate gas fee or base deposit'));
										}
									}
								}
							]}
						>
							<AccountSelectionForm
								title='Select Account'
								isTruncateUsername={false}
								accounts={accounts}
								address={loginAddress}
								withBalance={false}
								onAccountChange={(address) => form.setFieldsValue({ loginAddress: address })}
								className={`${dmSans.className} ${dmSans.variable} text-sm font-normal text-lightBlue dark:text-blue-dark-medium`}
								inputClassName='rounded-[4px] px-3 py-1'
								withoutInfo={true}
								linkAddressTextDisabled
								theme={theme}
								isVoting
								isUsedInProxy={true}
							/>
						</Form.Item>

						{/* Title */}
						<span className='text-sm text-blue-light-medium dark:text-blue-dark-medium'>
							{' '}
							Title <span className='text-lg font-medium text-[#FF3C5F]'>*</span>
						</span>
						<Form.Item
							name='title'
							rules={[{ required: true, message: 'Please input the title of your request!' }]}
						>
							<Input
								placeholder='Add title for your request'
								className='h-10 w-full'
							/>
						</Form.Item>

						{/* Requested Amount */}
						<span className='text-sm text-blue-light-medium dark:text-blue-dark-medium'>
							{' '}
							Requested Amount <span className='text-lg font-medium text-[#FF3C5F]'>*</span>
						</span>
						<Form.Item
							name='requestAmount'
							rules={[{ required: true, message: 'Please input the requested amount!' }]}
						>
							<Input
								placeholder='Enter an amount for your request'
								className='h-10 w-full'
							/>
						</Form.Item>

						{/* Links */}
						<span className='text-sm text-blue-light-medium dark:text-blue-dark-medium'> Links</span>
						<Form.Item name='links'>
							<Input
								placeholder='Add more context for your request'
								className='h-10 w-full'
							/>
						</Form.Item>

						<span className='text-sm text-blue-light-medium dark:text-blue-dark-medium'>
							{' '}
							Description<span className='text-lg font-medium text-[#FF3C5F]'>*</span>
						</span>
						<Form.Item
							name='description'
							rules={[{ required: true, message: 'Please input the description of your request!' }]}
							className='h-min'
						>
							<ContentForm
								className='h-min'
								height={200}
							/>
						</Form.Item>

						{showBalanceAlert && (
							<Alert
								type='error'
								message='Insufficient Balance'
								description='You do not have enough balance to complete this submission.'
							/>
						)}

						{showError && (
							<Alert
								type='error'
								message='Form Validation Error'
								description='Please ensure all required fields are filled out correctly.'
							/>
						)}
					</Form>
				</div>
			</Spin>
		</Modal>
	);
};

export default CreateSubmissionForm;
