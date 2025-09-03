// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
import React, { useEffect, useState } from 'react';
import { Divider, Modal, Spin } from 'antd';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useApiContext } from '~src/context';
import BN from 'bn.js';
import { EUserCreatedBountySubmissionStatus, NotificationStatus } from '~src/types';
import queueNotification from '~src/ui-components/QueueNotification';
import executeTx from '~src/util/executeTx';
import Address from '~src/ui-components/Address';
import BalanceInput from '~src/ui-components/BalanceInput';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import Balance from '~src/components/Balance';
import { useTheme } from 'next-themes';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { dmSans } from 'pages/_app';
import { inputToBn } from '~src/util/inputToBn';

const ZERO_BN = new BN(0);

interface Props {
	open: boolean;
	setOpen: (pre: boolean) => void;
	submissionProposer: string;
	parentBountyProposerAddress: string;
	submissionId: string;
	submissionReqAmount: string;
	parentBountyIndex: number;
	fetchSubmissions?: () => Promise<void>;
}

const SubmissionTippingModal = ({
	open,
	setOpen,
	submissionProposer,
	parentBountyProposerAddress,
	submissionReqAmount,
	submissionId,
	parentBountyIndex,
	fetchSubmissions
}: Props) => {
	const { network } = useNetworkSelector();
	const { loginAddress } = useUserDetailsSelector();
	const { resolvedTheme: theme } = useTheme();
	const { api, apiReady } = useApiContext();
	const [tipAmount, setTipAmount] = useState<BN>(ZERO_BN);
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);
	const [loadingStatus, setLoadingStatus] = useState({ isLoading: false, message: '' });
	const disable = loadingStatus.isLoading || availableBalance.lte(tipAmount) || tipAmount.eq(ZERO_BN);

	useEffect(() => {
		if (!api || !apiReady || !loginAddress) return;

		const loadBalance = async () => {
			const accountData = await api?.query?.system?.account(loginAddress);
			setAvailableBalance(new BN(accountData.data.free.toString() || '0'));
		};

		loadBalance();
	}, [api, apiReady, loginAddress]);

	const handleSubmissionStatusChange = async (status: EUserCreatedBountySubmissionStatus) => {
		try {
			const { data, error } = await nextApiClientFetch('/api/v1/user-created-bounties/submissions/updateSubmissionStatus', {
				parentBountyIndex,
				parentBountyProposerAddress,
				submissionId,
				submissionProposerAddress: submissionProposer,
				updatedStatus: status
			});
			if (error || !data) {
				console.log('error in submission modal', error);
				setLoadingStatus({ isLoading: false, message: '' });
				return;
			}
			if (data) {
				fetchSubmissions && fetchSubmissions();
			}
		} catch (error) {
			console.log(error);
		}
	};

	const handleTip = async () => {
		if (!api || !apiReady || disable || !submissionProposer) return;

		setLoadingStatus({ isLoading: true, message: 'Awaiting Confirmation' });

		try {
			const tx = api?.tx?.balances?.transferKeepAlive(submissionProposer, tipAmount);

			await executeTx({
				address: loginAddress,
				api,
				apiReady,
				network,
				setStatus: (message: string) => setLoadingStatus({ isLoading: false, message: message }),
				tx,
				errorMessageFallback: 'Failed to process the transaction. Please try again later.',
				onSuccess: () => {
					handleSubmissionStatusChange(EUserCreatedBountySubmissionStatus.PAID);
					setLoadingStatus({ isLoading: false, message: '' });
					queueNotification({
						header: 'Success!',
						message: 'Submission paid successfully.',
						status: NotificationStatus.SUCCESS
					});
					setOpen(false);
				},
				onFailed: (error: string) => {
					setLoadingStatus({ isLoading: false, message: '' });
					queueNotification({
						header: 'Error!',
						message: error || 'Failed to pay.',
						status: NotificationStatus.ERROR
					});
				}
			});
		} catch (error) {
			console.error('Error sending tip:', error);
		}
	};

	const handleCancel = () => {
		setTipAmount(ZERO_BN);
		setOpen(false);
	};

	const fundingAmtToBN = () => {
		const [fundingAmt] = inputToBn(submissionReqAmount || '0', network, false);
		return fundingAmt;
	};

	return (
		<Modal
			title={
				<div className={`${dmSans.variable} ${dmSans.className} text-xl font-bold text-bodyBlue dark:bg-section-dark-overlay dark:text-blue-dark-high`}>
					Pay Submission Amount
					<Divider
						className=' mb-1 mt-3 dark:bg-separatorDark'
						style={{ background: '#D2D8E0' }}
					/>
				</div>
			}
			wrapClassName='dark:bg-modalOverlayDark'
			open={open}
			onCancel={handleCancel}
			closeIcon={<CloseIcon />}
			footer={
				<div className='flex justify-end gap-2'>
					<CustomButton
						type='default'
						onClick={handleCancel}
						width={120}
						disabled={loadingStatus.isLoading}
						text='Cancel'
					/>
					<CustomButton
						type='primary'
						onClick={handleTip}
						width={120}
						disabled={disable}
						text='Pay'
					/>
				</div>
			}
		>
			<Spin spinning={loadingStatus.isLoading}>
				<div className='mt-6 flex items-center justify-between text-lightBlue dark:text-blue-dark-medium'>
					<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>Your Address</label>
					{loginAddress && (
						<Balance
							isBalanceUpdated={true}
							address={loginAddress}
							onChange={(balance: any) => setAvailableBalance(new BN(balance))}
						/>
					)}
				</div>
				<div className='flex w-full items-end gap-2 text-sm '>
					<div className='flex h-10 w-full items-center justify-between rounded-[4px] border-[1px] border-solid border-section-light-container bg-[#f5f5f5] px-2 dark:border-separatorDark dark:bg-transparent'>
						<Address
							address={loginAddress}
							isTruncateUsername={false}
							displayInline
							disableTooltip
						/>
					</div>
				</div>

				<div className='mb-4 mt-4'>
					<span className='block text-sm font-medium'></span>
					<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>Submission Proposer</label>
					<div className='flex w-full items-end gap-2 text-sm '>
						<div className='flex h-10 w-full items-center justify-between rounded-[4px] border-[1px] border-solid border-section-light-container bg-[#f5f5f5] px-2 dark:border-separatorDark dark:bg-transparent'>
							<Address
								address={submissionProposer}
								isTruncateUsername={false}
								displayInline
								disableTooltip
							/>
						</div>
					</div>
				</div>

				<BalanceInput
					theme={theme}
					label='Amount'
					balance={fundingAmtToBN()}
					placeholder='Enter an amount to pay'
					address={loginAddress}
					onChange={(tip) => setTipAmount(tip)}
				/>

				{availableBalance.lte(tipAmount) && <div className='mt-2 text-sm text-red-500'>Insufficient balance.</div>}
			</Spin>
		</Modal>
	);
};

export default SubmissionTippingModal;
