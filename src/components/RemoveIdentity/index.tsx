// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Modal, Spin } from 'antd';
import BN from 'bn.js';
import classNames from 'classnames';
import { dmSans } from 'pages/_app';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Alert from '~src/basic-components/Alert';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { useApiContext, usePeopleChainApiContext } from '~src/context';
import { useNetworkSelector, useRemoveIdentity, useUserDetailsSelector } from '~src/redux/selectors';
import { ILoading, NotificationStatus } from '~src/types';
import Address from '~src/ui-components/Address';
import AddressConnectModal from '~src/ui-components/AddressConnectModal';
import { ClearIdentityFilledIcon, ClearIdentityOutlinedIcon, CloseIcon } from '~src/ui-components/CustomIcons';
import { parseBalance } from '../Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import Balance from '../Balance';
import executeTx from '~src/util/executeTx';
import queueNotification from '~src/ui-components/QueueNotification';
import { useDispatch } from 'react-redux';
import { setOpenRemoveIdentityModal, setOpenRemoveIdentitySelectAddressModal } from '~src/redux/removeIdentity';
import { trackEvent } from 'analytics';
import getIdentityInformation from '~src/auth/utils/getIdentityInformation';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

const ZERO_BN = new BN(0);

export interface IRemoveIdentity {
	className?: string;
	withButton?: boolean;
}

const RemoveIdentity = ({ className, withButton = false }: IRemoveIdentity) => {
	const { t } = useTranslation('common');
	const { network } = useNetworkSelector();
	const router = useRouter();
	const { loginAddress, id, username } = useUserDetailsSelector();
	const dispatch = useDispatch();
	const { api, apiReady } = useApiContext();
	const { peopleChainApi, peopleChainApiReady } = usePeopleChainApiContext();
	const { openAddressSelectModal, openRemoveIdentityModal } = useRemoveIdentity();
	const [address, setAddress] = useState<string>(loginAddress);
	const [gasFee, setGasFee] = useState<BN>(ZERO_BN);
	const [bondFee, setBondFee] = useState<BN>(ZERO_BN);
	const [isIdentityAvailable, setIsIdentityAvailable] = useState<boolean>(false);
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);
	const [loading, setLoading] = useState<ILoading>({ isLoading: false, message: '' });
	const isDisable = availableBalance.lte(gasFee) || loading.isLoading || !(address.length || loginAddress.length) || !isIdentityAvailable;

	const handleAvailableBalanceChange = (balanceStr: string) => {
		let balance = ZERO_BN;

		try {
			balance = new BN(balanceStr);
		} catch (err) {
			console.log(err);
		}
		setAvailableBalance(balance);
	};

	const checkIsIdentityAvailable = async (addr: string) => {
		if ((!api && !peopleChainApi) || !addr) {
			setIsIdentityAvailable(false);
			return;
		}
		setLoading({ ...loading, isLoading: true });
		const info = await getIdentityInformation({
			address: addr,
			api: peopleChainApi ?? api,
			network: network
		});
		setIsIdentityAvailable(!!info?.display);
		setLoading({ ...loading, isLoading: false });
	};

	const getGasFee = async (addr: string) => {
		if (!api || !apiReady) return;

		setLoading({ ...loading, isLoading: true });
		const tx = (peopleChainApi ?? api)?.tx?.identity?.clearIdentity();
		const paymentInfo = await tx.paymentInfo(addr);
		const bnGasFee = new BN(paymentInfo.partialFee.toString() || '0');
		setGasFee(bnGasFee);
		setLoading({ ...loading, isLoading: false });
	};

	const getBondFee = () => {
		const bondFee = (peopleChainApi ?? api)?.consts?.identity?.basicDeposit || ZERO_BN;
		setBondFee(bondFee);
	};

	const handleRemoveIdentity = () => {
		if (!api || !apiReady || !(address || loginAddress) || !isIdentityAvailable) return;
		setLoading({ isLoading: true, message: t('awaiting_confirmation') });

		const onFailed = (message: string) => {
			queueNotification({
				header: t('failed'),
				message: message || t('transaction_failed'),
				status: NotificationStatus.ERROR
			});
			setLoading({ isLoading: false, message: message });
		};

		const onSuccess = () => {
			trackEvent('identity_removed', 'removed_identity', {
				loginAddress: loginAddress || '',
				userId: id || '',
				userName: username || ''
			});
			queueNotification({
				header: t('success'),
				message: t('identity_removed_successfully'),
				status: NotificationStatus.SUCCESS
			});
			setLoading({ isLoading: false, message: '' });
			dispatch(setOpenRemoveIdentityModal(false));
			router.reload();
		};
		const tx = (peopleChainApi ?? api)?.tx?.identity?.clearIdentity();

		executeTx({
			address: address || loginAddress,
			api: peopleChainApi ?? api,
			apiReady,
			errorMessageFallback: t('error_removing_identity'),
			network,
			onFailed,
			onSuccess,
			setStatus: (message: string) => setLoading({ isLoading: true, message: message }),
			tx
		});
	};

	useEffect(() => {
		if (!(api && peopleChainApi) || !apiReady) return;
		checkIsIdentityAvailable(address || loginAddress);

		getGasFee(address || loginAddress);
		getBondFee();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loginAddress, api, apiReady, address, peopleChainApi, peopleChainApiReady]);

	return (
		<div className={className}>
			{withButton && (
				<div
					className='ml-1 flex items-center gap-3 text-sm font-medium'
					onClick={() => (!loginAddress ? dispatch(setOpenRemoveIdentitySelectAddressModal(true)) : dispatch(setOpenRemoveIdentityModal(true)))}
				>
					<ClearIdentityOutlinedIcon className='bg-transparent text-lg' />
					{t('remove_identity')}
				</div>
			)}
			<AddressConnectModal
				open={openAddressSelectModal}
				setOpen={() => dispatch(setOpenRemoveIdentitySelectAddressModal(false))}
				closable
				accountSelectionFormTitle={t('select_address')}
				onConfirm={(selectedAddr: string) => {
					dispatch(setOpenRemoveIdentityModal(true));
					dispatch(setOpenRemoveIdentitySelectAddressModal(false));
					setAddress(selectedAddr);
					getGasFee(selectedAddr);
					checkIsIdentityAvailable(selectedAddr);
				}}
				walletAlertTitle={t('remove_identity')}
				accountAlertTitle={t('install_wallet_to_remove_identity')}
				usedInIdentityFlow
			/>

			<Modal
				open={openRemoveIdentityModal}
				onCancel={() => dispatch(setOpenRemoveIdentityModal(false))}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
				className={classNames(dmSans.className, dmSans.variable, 'w-[600px]')}
				wrapClassName={`${className} dark:bg-modalOverlayDark`}
				title={
					<div className='-mx-6 flex items-center gap-2 border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-2 text-lg text-lightBlue dark:border-separatorDark dark:text-blue-dark-medium'>
						<ClearIdentityFilledIcon />
						{t('remove_identity')}
					</div>
				}
				footer={
					<div className='-mx-6 mt-6 flex  justify-end gap-2 border-0 border-t-[1px] border-solid border-section-light-container px-6 pt-4 dark:border-[#3B444F] dark:border-separatorDark'>
						<CustomButton
							text={t('cancel')}
							onClick={() => dispatch(setOpenRemoveIdentityModal(false))}
							variant='default'
							height={40}
							width={155}
							disabled={loading.isLoading}
						/>
						<CustomButton
							text={t('confirm')}
							onClick={handleRemoveIdentity}
							variant='primary'
							height={40}
							width={155}
							className={`${isDisable && 'opacity-50'} `}
							disabled={isDisable}
						/>
					</div>
				}
			>
				<Spin
					spinning={loading.isLoading}
					tip={loading.message}
				>
					<div className='my-6 flex flex-col gap-6'>
						{!isIdentityAvailable && (
							<Alert
								type='error'
								message={t('no_onchain_identity_found')}
								className='rounded-[4px]'
								showIcon
							/>
						)}

						{isIdentityAvailable && availableBalance.lte(gasFee) && !loading.isLoading && (
							<Alert
								type='error'
								message={t('insufficient_balance')}
								className='rounded-[4px]'
								showIcon
							/>
						)}

						{isIdentityAvailable && bondFee.gte(ZERO_BN) && (
							<Alert
								type='warning'
								message={`${t('bond_fee_warning', { bond: parseBalance(bondFee.toString(), 2, true, network) })}`}
								showIcon
								className='rounded-[4px]'
							/>
						)}
						<div>
							<div className='flex items-center justify-between'>
								<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>{t('your_address')}</label>
								{(!!address || !!loginAddress) && (
									<Balance
										address={address || loginAddress}
										onChange={handleAvailableBalanceChange}
										usedInIdentityFlow
									/>
								)}
							</div>
							<div className='flex h-10 w-full items-center justify-between rounded-[4px] border-[1px] border-solid border-section-light-container bg-[#f5f5f5] px-2 dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay'>
								<Address
									address={address || loginAddress}
									isTruncateUsername={false}
									disableHeader
									addressWithVerifiedTick
									iconSize={24}
									addressMaxLength={5}
									addressClassName='text-sm font-semibold text-bodyBlue dark:text-blue-dark-high'
									className='font-normal'
								/>
								<CustomButton
									text={t('change_wallet')}
									onClick={() => {
										dispatch(setOpenRemoveIdentitySelectAddressModal(true));
										dispatch(setOpenRemoveIdentityModal(false));
									}}
									width={91}
									className='change-wallet-button mr-1 flex items-center justify-center'
									height={21}
									variant='primary'
								/>
							</div>
						</div>

						{isIdentityAvailable && gasFee.gte(ZERO_BN) && (
							<Alert
								type='info'
								message={`${t('gas_fee_info', { gas: parseBalance(gasFee.toString(), 2, true, network) })}`}
								showIcon
								className='rounded-[4px]'
							/>
						)}
					</div>
				</Spin>
			</Modal>
		</div>
	);
};

export default styled(RemoveIdentity)`
	.change-wallet-button {
		font-size: 10px !important;
	}
`;
