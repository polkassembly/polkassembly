// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import BN from 'bn.js';
import { Form, Modal, Spin } from 'antd';
import { poppins } from 'pages/_app';
import AddressConnectModal from '~src/ui-components/AddressConnectModal';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import Address from '~src/ui-components/Address';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import Balance from '../Balance';
import AddressInput from '~src/ui-components/AddressInput';
import Alert from '~src/basic-components/Alert';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
import styled from 'styled-components';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import classNames from 'classnames';
import BalanceInput from '~src/ui-components/BalanceInput';
import { useTheme } from 'next-themes';
import { useApiContext } from '~src/context';
import { decodeAddress } from '@polkadot/util-crypto';
import executeTx from '~src/util/executeTx';
import queueNotification from '~src/ui-components/QueueNotification';
import { ILoading, NotificationStatus } from '~src/types';

interface IPeopleChainTeleport {
	className?: string;
	defaultAmount: BN;
	defaultBeneficiaryAddress: string;
	onConfirm?: (pre: BN, sec: boolean) => void;
}

const ZERO_BN = new BN(0);

const PeopleChainTeleport = ({ className, defaultAmount, defaultBeneficiaryAddress, onConfirm }: IPeopleChainTeleport) => {
	const { api, apiReady } = useApiContext();
	const { network } = useNetworkSelector();
	const { loginAddress } = useUserDetailsSelector();
	const { resolvedTheme: theme } = useTheme();
	const [loading, setLoading] = useState<ILoading>({ isLoading: false, message: '' });
	const [open, setOpen] = useState<boolean>(false);
	const [openAddressSelectModal, setOpenAddressSelectModal] = useState<boolean>(false);
	const [address, setAddress] = useState(loginAddress || '');
	const [beneficiaryAddress, setBeneficiaryAddress] = useState(defaultBeneficiaryAddress || '');
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [amount, setAmount] = useState<BN>(defaultAmount);
	const [form] = Form.useForm();

	useEffect(() => {
		form.setFieldValue('balance', formatedBalance(String(defaultAmount || ZERO_BN), unit));
		setAmount(defaultAmount);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [defaultAmount]);

	const handleOnAvailableBalanceChange = (balanceStr: string) => {
		let balance = ZERO_BN;

		try {
			balance = new BN(balanceStr);
		} catch (err) {
			console.log(err);
		}
		setAvailableBalance(balance);
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
		onConfirm?.(amount, true);
		form.setFieldValue('balance', '');
		setOpen(false);
		setLoading({ isLoading: false, message: 'Success!' });
	};

	const getPeopleChainTeleportTx = async () => {
		if (!api || !apiReady) return null;

		setLoading({ isLoading: true, message: 'Awaiting Confirmation!' });

		const tx = api.tx.xcmPallet.limitedTeleportAssets(
			{
				V3: {
					interior: {
						X1: { Parachain: chainProperties[network]?.peopleChainParachain }
					},
					parenets: 0
				}
			},
			{ V3: { interior: { X1: { AccountId32: { id: decodeAddress(beneficiaryAddress), network: null } } } } },
			{
				V3: [
					{
						fun: {
							Fungible: amount.toString()
						},
						id: {
							Concrete: {
								interior: 'Here',
								parents: '0'
							}
						}
					}
				]
			},
			'0',
			'Unlimited'
		);

		await executeTx({
			address,
			api,
			apiReady,
			errorMessageFallback: 'Failed!',
			network,
			onFailed,
			onSuccess,
			setStatus: (message: string) => setLoading({ isLoading: true, message: message || '' }),
			tx,
			waitTillFinalizedHash: true
		});
	};

	return (
		<div className={className}>
			<Alert
				className='mb-6 rounded-[4px]'
				type='info'
				showIcon
				message={
					<div className='m-0 flex items-center justify-between p-0 text-xs dark:text-blue-dark-high'>
						<span>
							You have to teleport {formatedBalance(defaultAmount.toString(), unit)} {unit} to People chain to continue.
						</span>
						<CustomButton
							text='Teleport'
							onClick={() => {
								setOpen(true);
							}}
							width={91}
							className='change-address mr-1 flex w-[70px] items-center justify-center text-[10px] tracking-wide'
							height={21}
							variant='primary'
						/>
					</div>
				}
			/>
			<Modal
				open={open}
				onCancel={() => {
					setOpen(false);
					setLoading({ isLoading: false, message: '' });
					form.setFieldValue('balance', formatedBalance(String(defaultAmount || ZERO_BN), unit));
				}}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
				className={`${poppins.className} ${poppins.variable} opengov-proposals w-[600px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
				wrapClassName={`${className} dark:bg-modalOverlayDark`}
				title={
					<div className='-mx-6 items-center gap-2 border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-4 text-lg font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high'>
						Teleport funds to People Chain
					</div>
				}
				footer={
					<div className='-mx-6 mt-6 flex items-center justify-end  gap-4 border-0 border-t-[1px] border-solid border-section-light-container px-6 pt-4 text-lg font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high'>
						<CustomButton
							onClick={() => {
								setOpen(false);
								setLoading({ isLoading: false, message: '' });
								setAmount(defaultAmount);
								form.setFieldValue('balance', formatedBalance(String(defaultAmount || ZERO_BN), unit));
							}}
							disabled={loading.isLoading}
							className={classNames('rounded-[4px] text-xs tracking-wide')}
							text='Cancel'
							variant='default'
							width={140}
							height={38}
						/>
						<CustomButton
							onClick={() => getPeopleChainTeleportTx()}
							disabled={!(availableBalance && availableBalance.gt(amount)) || loading.isLoading}
							className={classNames('rounded-[4px] text-xs tracking-wide', !(availableBalance && availableBalance.gt(amount)) || loading.isLoading ? 'opacity-50' : '')}
							text='Confirm'
							variant='primary'
							width={140}
							height={38}
						/>
					</div>
				}
			>
				<Spin
					spinning={loading.isLoading}
					tip={loading.message || ''}
				>
					<div>
						<div className='flex items-center justify-between text-lightBlue dark:text-blue-dark-medium'>
							<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>
								Your Address{' '}
								<HelperTooltip
									className='ml-1'
									text='Please note the verification cannot be transferred to another address.'
								/>
							</label>
							{!!address && (
								<Balance
									address={address || loginAddress}
									onChange={handleOnAvailableBalanceChange}
									usedInIdentityFlow={false}
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
									text='Change Wallet'
									onClick={() => {
										setOpenAddressSelectModal(true);
										setOpen(false);
									}}
									width={91}
									className='change-address mr-1 flex items-center justify-center text-[10px]'
									height={21}
									variant='primary'
								/>
							</div>
						</div>
					</div>
					<Form
						form={form}
						initialValues={{ balance: formatedBalance(String(amount || ZERO_BN), unit), beneficiary: defaultBeneficiaryAddress }}
					>
						<div className='mt-4'>
							<div>
								<div className='text-sm text-bodyBlue dark:text-blue-dark-medium'>Beneficiary Address</div>
								<div className='flex w-full items-end gap-2 text-sm'>
									<AddressInput
										skipFormatCheck
										className='-mt-6 w-full border-section-light-container dark:border-separatorDark'
										defaultAddress={beneficiaryAddress || defaultBeneficiaryAddress || ''}
										name={'beneficiary'}
										placeholder='Enter Beneficiary Address'
										iconClassName={'ml-[10px]'}
										identiconSize={26}
										onChange={(address) => setBeneficiaryAddress(address)}
									/>
								</div>
							</div>
							<div className='mt-4'>
								<BalanceInput
									balance={amount}
									theme={theme}
									label='Amount'
									onChange={(amount: BN) => setAmount(amount)}
								/>
							</div>
						</div>
					</Form>
				</Spin>
			</Modal>
			<AddressConnectModal
				open={openAddressSelectModal}
				setOpen={setOpenAddressSelectModal}
				walletAlertTitle='Teleport People Chain'
				onConfirm={(address: string) => {
					setAddress(address);
					// form.setFieldValue('beneficiary', address);
					setOpen(true);
				}}
				usedInIdentityFlow={false}
			/>
		</div>
	);
};

export default styled(PeopleChainTeleport)`
	.change-address {
		font-size: 10px !important;
	}
`;
