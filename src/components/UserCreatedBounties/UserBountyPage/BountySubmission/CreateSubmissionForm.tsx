// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Spin, Alert, Divider } from 'antd';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useApiContext } from '~src/context';
import AccountSelectionForm from '~src/ui-components/AccountSelectionForm';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import BN from 'bn.js';
import { EUserCreatedBountyActions, IChildBountySubmission, NotificationStatus, Wallet } from '~src/types';
import { dmSans } from 'pages/_app';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import { useTheme } from 'next-themes';
import queueNotification from '~src/ui-components/QueueNotification';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import getAccountsFromWallet from '~src/util/getAccountsFromWallet';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { chainProperties } from '~src/global/networkConstants';
import formatBnBalance from '~src/util/formatBnBalance';
import MarkdownEditor from '~src/components/Editor/MarkdownEditor';
import getMarkdownContent from '~src/api-utils/getMarkdownContent';

const ZERO_BN = new BN(0);

interface Props {
	openModal: boolean;
	setOpenModal: (pre: boolean) => void;
	parentBountyIndex: number;
	isUsedForEditing?: boolean;
	submission?: IChildBountySubmission;
	onEditSuccess?: (updatedSubmission: IChildBountySubmission) => void;
	fetchSubmissions?: () => Promise<void>;
}

const CreateSubmissionForm = ({ openModal, setOpenModal, parentBountyIndex, isUsedForEditing, submission, onEditSuccess, fetchSubmissions }: Props) => {
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
	const [errorStatus, setErrorStatus] = useState<{ isError: boolean; message: string }>({ isError: false, message: '' });
	const baseDecimals = chainProperties?.[network]?.tokenDecimals;
	const [content, setContent] = useState<string>(getMarkdownContent(submission?.content || '') || '');

	useEffect(() => {
		if (isUsedForEditing && submission) {
			form.setFieldsValue({
				title: submission.title || '',
				requestAmount: submission.reqAmount
					? Number(formatBnBalance(String(submission.reqAmount), { numberAfterComma: 6, withThousandDelimitor: false, withUnit: false }, network))
					: '',
				description: submission?.content || '',
				links: submission.link || '',
				loginAddress: submission.proposer || loginAddress
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isUsedForEditing, submission, form, loginAddress]);

	const loadBalance = async () => {
		if (!api || !apiReady) return;
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
			} else setShowBalanceAlert(false);
		} catch (error) {
			console.error('Failed to fetch balance:', error);
		} finally {
			setLoadingStatus({ isLoading: false, message: '' });
		}
	};

	useEffect(() => {
		if (!api || !apiReady) return;

		loadBalance();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, loginAddress]);

	const handleSubmit = async () => {
		if (!api || !apiReady || !content) {
			return;
		}

		setLoadingStatus({ isLoading: true, message: 'Submitting' });
		const values = form.getFieldsValue();

		const hasValidationErrors = !form.getFieldValue('title') || !form.getFieldValue('requestAmount') || !form.getFieldValue('description');

		if (hasValidationErrors) {
			setErrorStatus({ isError: true, message: 'Please ensure all required fields are filled out correctly.' });
			return;
		}

		setErrorStatus({ isError: false, message: '' });

		const adjustedRequestAmount = new BN(values.requestAmount).mul(new BN(10).pow(new BN(baseDecimals)));

		const requestBody = {
			title: values.title,
			content: values.description,
			tags: [],
			link: values.links || '',
			reqAmount: String(adjustedRequestAmount),
			proposerAddress: loginAddress,
			parentBountyIndex: parentBountyIndex,
			...(isUsedForEditing && submission
				? {
						action: EUserCreatedBountyActions.EDIT,
						submissionId: submission.id
				  }
				: {})
		};

		const apiRoute = isUsedForEditing ? '/api/v1/user-created-bounties/submissions/editOrDeleteSubmission' : '/api/v1/user-created-bounties/submissions/addSubmission';

		try {
			const { data, error } = await nextApiClientFetch<any>(apiRoute, requestBody);

			if (error || !data) {
				console.log('Submission failed:', error);
				queueNotification({
					header: 'Error',
					message: 'Submission failed.',
					status: NotificationStatus.ERROR
				});
				setErrorStatus({ isError: true, message: error || '' });
				setLoadingStatus({ isLoading: false, message: '' });
				return;
			}

			queueNotification({
				header: 'Success!',
				message: isUsedForEditing ? 'Submission updated successfully.' : 'Submission created successfully.',
				status: NotificationStatus.SUCCESS
			});
			setLoadingStatus({ isLoading: false, message: '' });
			setOpenModal(false);
			if (onEditSuccess && isUsedForEditing && submission) {
				onEditSuccess({
					...submission,
					title: values.title,
					content: values.description,
					reqAmount: values.requestAmount,
					link: values.links || '',
					createdAt: submission.createdAt ?? new Date()
				});
			} else {
				fetchSubmissions && fetchSubmissions();
			}
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<Modal
			open={openModal}
			wrapClassName='dark:bg-modalOverlayDark'
			onCancel={() => setOpenModal(false)}
			title={
				<div className={`${dmSans.className} ${dmSans.variable}`}>
					<div className='flex items-center gap-2 text-xl font-semibold text-bodyBlue dark:text-blue-dark-high'>
						<span>{isUsedForEditing ? 'Edit Submission' : 'Make Submission'}</span>
					</div>
					<Divider
						className=' mb-1 mt-3 dark:bg-separatorDark'
						style={{ background: '#D2D8E0' }}
					/>
				</div>
			}
			footer={
				<div className='flex justify-end gap-2 '>
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
						text={isUsedForEditing ? 'Edit' : 'Send'}
					/>
				</div>
			}
			width={600}
			closable
			className={`${dmSans.className} ${dmSans.variable} rounded-[14px] p-0 dark:bg-section-dark-overlay`}
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
							className='mb-3'
						>
							<AccountSelectionForm
								title='Select Account'
								isTruncateUsername={false}
								accounts={accounts}
								address={loginAddress}
								withBalance={false}
								onAccountChange={(address) => form.setFieldsValue({ loginAddress: address })}
								className={`${dmSans.className} ${dmSans.variable}  text-sm font-normal text-lightBlue dark:text-blue-dark-medium`}
								inputClassName='rounded-[4px] px-3 py-[7px]'
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
							className='mb-3'
						>
							<Input
								placeholder='Add title for your request'
								className='h-10 w-full rounded border text-blue-light-high dark:border-separatorDark dark:text-blue-dark-high'
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
							className='mb-3'
						>
							<Input
								placeholder='Enter an amount for your request'
								className='h-10 w-full rounded border text-blue-light-high dark:border-separatorDark dark:text-blue-dark-high'
							/>
						</Form.Item>

						{/* Links */}
						<span className='text-sm text-blue-light-medium dark:text-blue-dark-medium'> Links</span>
						<Form.Item
							name='links'
							className='mb-3'
						>
							<Input
								placeholder='Add more context for your request'
								className='h-10 w-full rounded border text-blue-light-high dark:border-separatorDark dark:text-blue-dark-high'
							/>
						</Form.Item>

						<span className='text-sm text-blue-light-medium dark:text-blue-dark-medium'>
							{' '}
							Description<span className='text-lg font-medium text-[#FF3C5F]'>*</span>
						</span>

						<MarkdownEditor
							className=' h-min text-blue-light-high dark:text-blue-dark-high'
							height={200}
							value={content}
							onChange={(value: string) => setContent(value)}
						/>

						{showBalanceAlert && availableBalance.lt(ZERO_BN) && (
							<Alert
								type='error'
								message='Insufficient Balance'
								description='You do not have enough balance to complete this submission.'
							/>
						)}

						{errorStatus.isError && (
							<Alert
								type='error'
								message='Form Validation Error'
								description={errorStatus.message}
							/>
						)}
					</Form>
				</div>
			</Spin>
		</Modal>
	);
};

export default CreateSubmissionForm;
