// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Modal, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Alert from '~src/basic-components/Alert';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { useApiContext } from '~src/context';
import { useClaimPayoutSelector, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import getBeneficiaryAmoutAndAsset from '~src/util/getBeneficiaryAmoutAndAsset';
import Address from './Address';
import classNames from 'classnames';
import { ILoading, NotificationStatus } from '~src/types';
import executeTx from '~src/util/executeTx';
import queueNotification from './QueueNotification';
import { poppins } from 'pages/_app';
import { CloseIcon } from './CustomIcons';
import HelperTooltip from './HelperTooltip';
import Balance from '~src/components/Balance';
import BN from 'bn.js';
import AddressConnectModal from './AddressConnectModal';
import { parseBalance } from '~src/components/Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';

interface IProps {
	className?: string;
	closePreviousModal?: () => void;
}

const ZERO_BN = new BN(0);

const ClaimAssetPayoutInfo = ({ className, closePreviousModal }: IProps) => {
	const { loginAddress } = useUserDetailsSelector();
	const { network } = useNetworkSelector();
	const { claimPayoutAvailable, payouts } = useClaimPayoutSelector();
	const { api, apiReady } = useApiContext();
	const [open, setOpen] = useState(false);
	const [openAddressSelectModal, setOpenAddressSelectModal] = useState(false);
	const [loading, setLoading] = useState<ILoading>({ isLoading: false, message: '' });
	const [availableBalance, setAvailableBalance] = useState<BN | null>(null);
	const [address, setAddress] = useState(loginAddress);
	const [txFee, setTxFee] = useState<BN>(ZERO_BN);
	const [updateAvailableBalance, setUpdateAvailableBalance] = useState(false);

	const handleOnAvailableBalanceChange = (balanceStr: string) => {
		let balance = ZERO_BN;

		try {
			balance = new BN(balanceStr);
		} catch (err) {
			console.log(err);
		}
		setAvailableBalance(balance);
	};

	const getTxFee = async () => {
		if (!api || !apiReady || !address) return;

		const batchData = payouts.map((payout) => api.tx.treasury.payout(payout?.payoutIndex));
		const tx = batchData.length > 1 ? api.tx.utility.batch(batchData) : batchData[0];

		const paymentInfo = await tx.paymentInfo(address);
		setTxFee(paymentInfo.partialFee);
	};

	const onFailed = (error: string) => {
		queueNotification({
			header: 'failed!',
			message: error || 'Transaction failed!',
			status: NotificationStatus.ERROR
		});
		setLoading({ isLoading: false, message: '' });
	};
	const onSuccess = () => {
		queueNotification({
			header: 'Success!',
			message: 'Transaction Successfull!',
			status: NotificationStatus.SUCCESS
		});
		setOpen(false);
		setUpdateAvailableBalance(!updateAvailableBalance);
		setLoading({ isLoading: false, message: 'Success!' });
	};

	const handleSubmitTx = async () => {
		if (!api || !apiReady || !loginAddress) return;
		setLoading({ isLoading: true, message: 'Awaiting Confirmation!' });

		const batchData = payouts.map((payout) => api.tx.treasury.payout(payout?.payoutIndex));
		const tx = batchData.length > 1 ? api.tx.utility.batch(batchData) : batchData[0];

		await executeTx({
			address: address || loginAddress,
			api,
			apiReady,
			errorMessageFallback: 'Failed!',
			network,
			onFailed,
			onSuccess,
			setStatus: (msg: string) => setLoading({ isLoading: true, message: msg || '' }),
			tx
		});
	};

	useEffect(() => {
		setAddress(loginAddress || '');
		getTxFee();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loginAddress, api, apiReady]);

	return (
		<section>
			{!claimPayoutAvailable ? null : (
				<div className={className}>
					<Alert
						type='info'
						showIcon
						message={
							<div className='m-0 flex items-center justify-between p-0 text-xs dark:text-blue-dark-high'>
								<span>You have {payouts?.length} payouts from your proposals </span>
								<CustomButton
									text='Claim'
									onClick={() => {
										setOpen(true);
										closePreviousModal?.();
									}}
									width={91}
									className='_button mr-1 flex w-[70px] items-center justify-center text-[10px] tracking-wide'
									height={21}
									variant='primary'
								/>
							</div>
						}
					/>
				</div>
			)}
			<Modal
				open={open}
				maskClosable={false}
				onCancel={() => setOpen(false)}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
				className={classNames(poppins.className, poppins.variable)}
				wrapClassName={'dark:bg-modalOverlayDark'}
				title={
					<div className='-mx-6 items-center gap-2 border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-4 text-lg font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high'>
						Claim Payouts
					</div>
				}
				footer={
					<div className='-mx-6 mt-6 flex items-center justify-end  gap-4 border-0 border-t-[1px] border-solid border-section-light-container px-6 pt-4 text-lg font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high'>
						<CustomButton
							onClick={() => {
								setOpen(false);
								setLoading({ isLoading: false, message: '' });
							}}
							disabled={loading.isLoading}
							className={classNames('text-xm rounded-[4px] tracking-wide', loading.isLoading ? 'opacity-50' : '')}
							text='Cancel'
							variant='default'
							width={120}
							height={38}
						/>
						<CustomButton
							onClick={() => handleSubmitTx()}
							className={classNames('rounded-[4px] text-xs tracking-wide', loading.isLoading || availableBalance?.lt(txFee) ? 'opacity-50' : '')}
							text='Claim'
							variant='primary'
							width={120}
							height={38}
						/>
					</div>
				}
			>
				<Spin
					spinning={loading.isLoading}
					tip={loading.message}
				>
					<div className='flex flex-col gap-2'>
						{!!txFee.gt(ZERO_BN) && availableBalance && availableBalance.lte(txFee) && (
							<Alert
								className='mb-6 rounded-[4px]'
								type='warning'
								showIcon
								message={<p className='m-0 p-0 text-xs dark:text-blue-dark-high'>Insufficient available balance</p>}
							/>
						)}
						<div>
							<div className='flex items-center justify-between text-lightBlue dark:text-blue-dark-medium'>
								<label className='text-sm text-lightBlue dark:text-blue-dark-high'>
									Your Address{' '}
									<HelperTooltip
										className='ml-1'
										text='Please note the verification cannot be transferred to another address.'
									/>
								</label>
								{!!loginAddress && (
									<Balance
										address={address || loginAddress}
										onChange={handleOnAvailableBalanceChange}
										usedInIdentityFlow
										isBalanceUpdated={updateAvailableBalance}
									/>
								)}
							</div>
							<div className='flex w-full items-end gap-2 text-sm '>
								<div className='flex h-10 w-full items-center justify-between rounded-[4px] border-[1px] border-solid border-section-light-container bg-[#f5f5f5] px-2 dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay'>
									<Address
										address={address || loginAddress}
										isTruncateUsername={false}
										displayInline
									/>
									<CustomButton
										onClick={() => {
											setOpenAddressSelectModal(true);
											setOpen(false);
										}}
										width={91}
										className='_button mr-1 flex items-center justify-center text-[10px]'
										height={21}
										variant='primary'
									>
										<span className='text-[10px]'>Change Wallet</span>
									</CustomButton>
								</div>
							</div>
						</div>

						<div className='mt-4 flex justify-between rounded-lg border-[1px] border-solid border-section-light-container px-4 py-2 text-sm font-medium text-bodyBlue dark:border-separatorDark dark:text-blue-dark-high'>
							<span>Index</span>
							<span>Beneficiary</span>
							<span>Amount</span>
							<span>Expire In</span>
						</div>
						{payouts.map((payout) => {
							// console.log({payout})
							return (
								<div
									key={payout.payoutIndex}
									className='flex justify-between rounded-lg border-[1px] border-solid border-section-light-container px-4 py-4 text-bodyBlue dark:border-separatorDark dark:text-white'
								>
									<span>{payout.payoutIndex}</span>
									<span>
										<Address
											address={payout?.beneficiary || ''}
											displayInline
										/>
									</span>
									<span>{getBeneficiaryAmoutAndAsset(payout.generalIndex, String(payout.amount || '0'), network)}</span>
									<span>{payout.expireAt}</span>
								</div>
							);
						})}

						{txFee.gt(ZERO_BN) && (
							<Alert
								type='info'
								message={`Removing Identity would unlock bond amount of ${parseBalance(txFee.toString(), 2, true, network)} `}
								showIcon
								className='mt-4 rounded-[4px]'
							/>
						)}
					</div>
				</Spin>
			</Modal>
			<AddressConnectModal
				open={openAddressSelectModal}
				setOpen={setOpenAddressSelectModal}
				walletAlertTitle='Claim Payout'
				onConfirm={(address: string) => {
					setAddress(address);
					setOpen(true);
				}}
				usedInIdentityFlow={false}
			/>
		</section>
	);
};

export default styled(ClaimAssetPayoutInfo)`
	._button {
		font-size: 10px !important;
	}
`;
