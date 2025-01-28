// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
import React, { useEffect, useState } from 'react';
import { AutoComplete, Divider, Modal, Spin } from 'antd';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useApiContext } from '~src/context';
import BN from 'bn.js';
import { IAccountData, NotificationStatus } from '~src/types';
import queueNotification from '~src/ui-components/QueueNotification';
import executeTx from '~src/util/executeTx';
import Address from '~src/ui-components/Address';
import BalanceInput from '~src/ui-components/BalanceInput';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import Balance from '~src/components/Balance';
import { useTheme } from 'next-themes';
import { dmSans } from 'pages/_app';
import Image from 'next/image';
import { inputToBn } from '~src/util/inputToBn';

const ZERO_BN = new BN(0);

interface Props {
	open: boolean;
	setOpen: (pre: boolean) => void;
	address: string;
	accountData: IAccountData;
}

const SendFundsModal = ({ open, setOpen, address, accountData }: Props) => {
	const { network } = useNetworkSelector();
	const { loginAddress } = useUserDetailsSelector();
	const { resolvedTheme: theme } = useTheme();
	const { api, apiReady } = useApiContext();
	const [tipAmount, setTipAmount] = useState<BN>(ZERO_BN);
	const [receiverAddress, setReceiverAddress] = useState<string>('');
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);
	const [loadingStatus, setLoadingStatus] = useState({ isLoading: false, message: '' });
	const disable = loadingStatus.isLoading || availableBalance.lte(tipAmount) || tipAmount.eq(ZERO_BN);

	useEffect(() => {
		if (!api || !apiReady || !loginAddress) return;

		const loadBalance = async () => {
			const accountData = await api?.query?.system?.account(address || loginAddress);
			setAvailableBalance(new BN(accountData.data.free.toString() || '0'));
		};

		loadBalance();
	}, [api, apiReady, address, loginAddress]);

	const handleTip = async () => {
		if (!api || !apiReady || disable || !address) return;

		setLoadingStatus({ isLoading: true, message: 'Awaiting Confirmation' });

		try {
			const tx = api?.tx?.balances?.transferKeepAlive(address, tipAmount);

			await executeTx({
				address: loginAddress,
				api,
				apiReady,
				network,
				setStatus: (message: string) => setLoadingStatus({ isLoading: false, message: message }),
				tx,
				errorMessageFallback: 'Failed to process the transaction. Please try again later.',
				onSuccess: () => {
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

	const accountSet = new Set<string>();

	const combinedAccounts = [
		...accountData.proxy.proxy_account.map((proxy) => ({
			address: proxy.account_display.address,
			type: proxy.proxy_type || 'Proxy Account'
		})),
		...accountData.proxy.real_account.map((real) => ({
			address: real.account_display.address,
			type: 'Real Account'
		})),
		...(accountData.multisig.multi_account || []).map((multi) => ({
			address: multi.address,
			type: 'Multi-Account'
		})),
		...(accountData.multisig.multi_account_member || []).map((member) => ({
			address: member.address,
			type: 'Multi-Account Member'
		}))
	];

	const uniqueAccounts = combinedAccounts.filter((account) => {
		const key = `${account.address}-${account.type}`;
		if (accountSet.has(key)) {
			return false;
		}
		accountSet.add(key);
		return true;
	});

	const autoCompleteOptions = uniqueAccounts.map((account) => ({
		value: account.address,
		label: (
			<div className='flex items-center gap-2'>
				<Address
					address={account.address}
					isTruncateUsername={false}
					displayInline
					disableTooltip
					usernameClassName='font-medium'
				/>
				<span className='text-xs'>{account.type}</span>
			</div>
		)
	}));

	const handleCancel = () => {
		setTipAmount(ZERO_BN);
		setOpen(false);
	};

	const fundingAmtToBN = () => {
		const [fundingAmt] = inputToBn(address || '0', network, false);
		return fundingAmt;
	};

	return (
		<Modal
			title={
				<div>
					<div className={' flex items-center gap-1 '}>
						<Image
							className='h-6 w-6 rounded-full object-contain'
							src={'/assets/icons/send-funds-dark.svg'}
							alt='funds'
							width={24}
							height={24}
						/>
						<span className={`${dmSans.variable} ${dmSans.className} text-xl font-bold text-bodyBlue dark:bg-section-dark-overlay dark:text-blue-dark-high`}>Send Funds</span>
					</div>
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
				<div className=''>
					<Divider
						className=' mb-5 mt-3 dark:bg-separatorDark'
						style={{ background: '#D2D8E0' }}
					/>
					<div className='flex justify-end gap-2'>
						<CustomButton
							variant='default'
							onClick={handleCancel}
							width={140}
							disabled={loadingStatus.isLoading}
							text='Cancel'
						/>
						<CustomButton
							variant='primary'
							onClick={handleTip}
							width={140}
							disabled={disable}
							text='Send'
						/>
					</div>
				</div>
			}
		>
			<Spin spinning={loadingStatus.isLoading}>
				<div className='mt-6 flex items-center justify-between text-lightBlue dark:text-blue-dark-medium'>
					<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>Send from Account</label>
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
					<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>Send to Account</label>
					<AutoComplete
						options={autoCompleteOptions}
						placeholder='Enter an address or select an address'
						value={receiverAddress}
						onChange={(value) => setReceiverAddress(value)}
						style={{ width: '100%' }}
						filterOption={(inputValue, option) => !!option?.value?.toLowerCase().includes(inputValue.toLowerCase())}
					/>
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

export default SendFundsModal;
