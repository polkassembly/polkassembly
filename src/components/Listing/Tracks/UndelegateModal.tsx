// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { LoadingOutlined } from '@ant-design/icons';

import { Form, Modal, Spin } from 'antd';

import BN from 'bn.js';
import { dmSans } from 'pages/_app';
import React, { useContext, useEffect, useState } from 'react';
import { ApiContext } from 'src/context/ApiContext';
import { NotificationStatus } from 'src/types';
import queueNotification from 'src/ui-components/QueueNotification';
import styled from 'styled-components';
import UndelegateProfileIcon from '~assets/icons/undelegate-gray-profile.svg';
import { useRouter } from 'next/router';
import { handleTrack } from '~src/components/DelegationDashboard/DashboardTrack';
import { formatBalance } from '@polkadot/util';
import DelegationSuccessPopup from './DelegationSuccessPopup';
import { chainProperties } from '~src/global/networkConstants';
import Address from '~src/ui-components/Address';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import { APPNAME } from '~src/global/appName';
import { Injected, InjectedWindow } from '@polkadot/extension-inject/types';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import executeTx from '~src/util/executeTx';
import { formatedBalance } from '~src/util/formatedBalance';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Alert from '~src/basic-components/Alert';
import { useTranslation } from 'next-i18next';

const ZERO_BN = new BN(0);

interface Props {
	trackNum: number;
	className?: string;
	defaultTarget: string;
	open: boolean;
	setOpen: (pre: boolean) => void;
	conviction: number;
	balance: BN;
	onConfirm?: () => void;
}
const UndelegateModal = ({ trackNum, className, defaultTarget, open, setOpen, conviction, balance, onConfirm }: Props) => {
	const { api, apiReady } = useContext(ApiContext);
	const { t } = useTranslation('common');
	const { network } = useNetworkSelector();
	const router = useRouter();
	const trackName = handleTrack(String(router.query.track));
	const [form] = Form.useForm();
	const [loading, setLoading] = useState<boolean>(false);
	const { delegationDashboardAddress: defaultAddress } = useUserDetailsSelector();
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [target, setTarget] = useState<string>(defaultTarget);
	const lock = Number(2 ** (conviction - 1));
	const [openSuccessPopup, setOpenSuccessPopup] = useState<boolean>(false);
	const [txFee, setTxFee] = useState(ZERO_BN);
	const [isMobile, setIsMobile] = useState<boolean>(false);
	const unit = `${chainProperties[network]?.tokenSymbol}`;

	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth < 640);
		handleResize();

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	useEffect(() => {
		if (!api || !apiReady) return;

		setLoading(true);

		const txArr = api.tx.convictionVoting.undelegate(trackNum);

		(async () => {
			const info = await txArr.paymentInfo(defaultAddress);
			setTxFee(new BN(info.partialFee.toString() || 0));
			setLoading(false);
		})();
	}, [defaultAddress, api, apiReady, balance, trackNum, conviction, network, target]);

	const onSuccess = () => {
		queueNotification({
			header: 'Success!',
			message: 'Undelegate successful.',
			status: NotificationStatus.SUCCESS
		});
		setLoading(false);
		onConfirm?.();
		setOpenSuccessPopup(true);
		setOpen(false);
	};
	const onFailed = (message: string) => {
		queueNotification({
			header: 'Undelegate failed!',
			message,
			status: NotificationStatus.ERROR
		});
		setLoading(false);
	};

	const handleSubmit = async () => {
		if (!api || !apiReady) return;

		setLoading(true);
		const chosenWallet = localStorage.getItem('delegationWallet');

		const injectedWindow = window as Window & InjectedWindow;

		const wallet = isWeb3Injected ? injectedWindow.injectedWeb3[String(chosenWallet)] : null;

		if (!wallet) {
			setLoading(false);
			return;
		}

		let injected: Injected | undefined;

		try {
			injected = await new Promise((resolve, reject) => {
				const timeoutId = setTimeout(() => {
					reject(new Error('Wallet Timeout'));
				}, 60000); // wait 60 sec
				if (wallet && wallet.enable) {
					wallet
						.enable(APPNAME)
						.then((value) => {
							clearTimeout(timeoutId);
							resolve(value);
						})
						.catch((error) => {
							reject(error);
						});
				}
			});
		} catch (err) {
			console.log(err?.message);
		}
		if (!injected) {
			setLoading(false);
			return;
		}

		setLoading(true);
		// TODO: check .toNumber()
		const delegateTxn = api.tx.convictionVoting.undelegate(trackNum);

		await executeTx({ address: defaultAddress, api, apiReady, errorMessageFallback: 'Undelegate successful.', network, onFailed, onSuccess, tx: delegateTxn });
	};

	return (
		<>
			<Modal
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
				className={`${dmSans.variable} ${dmSans.className} padding w-[600px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
				wrapClassName={`${className} dark:bg-modalOverlayDark`}
				title={
					<div className=' flex items-center border-0 border-b-[1px] border-solid border-section-light-container pb-3  text-[18px] font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high sm:px-6 sm:pb-4 sm:text-[20px]'>
						<UndelegateProfileIcon className='mr-2' />
						{t('undelegate')}
					</div>
				}
				open={open}
				onOk={handleSubmit}
				confirmLoading={loading}
				onCancel={() => setOpen(false)}
				footer={
					<div className='-mx-6 flex items-center justify-evenly gap-1 border-0 border-t-[1px] border-solid border-section-light-container px-6 pt-4 dark:border-[#3B444F] dark:border-separatorDark sm:justify-end'>
						<CustomButton
							key='back'
							text={t('cancel')}
							buttonsize='xs'
							variant='default'
							disabled={loading}
							onClick={() => setOpen(false)}
							className='rounded-[4px] text-sm sm:text-base'
						/>
						<CustomButton
							htmlType='submit'
							key='submit'
							text={t('undelegate')}
							buttonsize='xs'
							variant='primary'
							disabled={loading}
							onClick={handleSubmit}
							className='rounded-[4px] text-sm sm:text-base'
						/>
					</div>
				}
			>
				<Spin
					spinning={loading}
					indicator={<LoadingOutlined />}
				>
					<div className='flex flex-col border-0'>
						<Alert
							showIcon
							type='info'
							className='mt-1 rounded-[4px] text-sm'
							message={
								<span className='text-sm dark:text-blue-dark-high sm:text-base'>
									{t('an_approximate_fees_of')} {formatBalance(txFee.toNumber(), { forceUnit: unit })} {t('will_be_applied_to_the_transaction')}
								</span>
							}
						/>
						<Form
							form={form}
							disabled={true}
						>
							<div className='mt-4'>
								<label className='mb-1 text-sm text-lightBlue dark:text-blue-dark-medium'>{t('your_address')}</label>
								<Address
									isTruncateUsername={false}
									address={defaultAddress}
									iconSize={isMobile ? 24 : 32}
									addressClassName='text-[#7c899b] text-sm'
									displayInline
									className={`mt-1 ${isMobile ? '' : 'hidden sm:flex'}`}
								/>
							</div>

							<div className='mt-4'>
								<label className='mb-1 text-sm text-lightBlue dark:text-blue-dark-medium'>{t('delegated_to')}</label>
								<Address
									isTruncateUsername={false}
									address={defaultTarget}
									iconSize={isMobile ? 24 : 32}
									addressClassName='text-[#7c899b] text-sm'
									displayInline
									className={`mt-1 ${isMobile ? '' : 'hidden sm:flex'}`}
								/>
							</div>

							<div className='mt-4'>
								<label className='mb-2 text-sm text-lightBlue dark:text-blue-dark-medium'>{t('balance')}</label>
								<div className='cursor-not-allowed rounded-sm px-0 py-[px] text-[#7c899b] dark:text-blue-dark-high sm:h-10'>{`${formatedBalance(
									balance.toString(),
									unit
								)} ${unit}`}</div>
							</div>

							<div className=' mt-3 border-solid border-white dark:border-0 sm:mt-4'>
								<label className='flex items-center text-sm text-lightBlue dark:text-blue-dark-medium'>
									{t('conviction')}
									<span>
										<HelperTooltip
											className='ml-2'
											text='You can multiply your votes by locking your tokens for longer periods of time.'
										/>
									</span>
								</label>
							</div>
							<div className='track-[0.0025em] mt-[2px] flex items-center justify-between rounded-md'>
								<div className='flex items-center justify-center text-sm text-[#7c899b] dark:text-blue-dark-high'>
									{conviction === 0 ? '0.1x voting balance, no lockup period' : `${conviction}x voting balance, locked for ${lock} enactment period`}
								</div>
							</div>
							<div className='mt-4 flex items-center justify-start gap-2 sm:mb-4 sm:mt-6'>
								<label className='mb-[2px] text-sm tracking-[0.0025em] text-lightBlue dark:text-blue-dark-medium'>{t('track')}:</label>
								<span className='tracking-medium text-sm text-[#7c899b] dark:text-blue-dark-high'>
									{trackName} #{trackNum}
								</span>
							</div>
						</Form>
					</div>
				</Spin>
			</Modal>
			<DelegationSuccessPopup
				open={openSuccessPopup}
				setOpen={setOpenSuccessPopup}
				balance={balance}
				title='Undelegated Successfully'
			/>
		</>
	);
};

export default styled(UndelegateModal)`
	.padding .ant-modal-close {
		margin-top: 4px;
	}
	.padding .ant-alert-message {
		color: #243a57;
		font-size: 14px;
		font-weight: 400;
	}

	.padding .ant-modal-close:hover {
		margin-top: 4px;
	}
	.padding .ant-slider-dot {
		margin-top: -1px;
		height: 12px;
		width: 2px;
		border-radius: 0px !important;
		border-color: #edeff3;
	}
	.padding .ant-slider-dot-active {
		border-color: #b97b9c !important;
		width: 2px;
		height: 12px;
		border-radius: 0px !important;
		margin-top: -1px;
	}

	.padding .ant-tooltip-open {
		border-color: #485f7d !important;
	}
	.padding .ant-slider-handle {
		border: 1px solid;
	}
	.padding .ant-slider .ant-slider-rail {
		background-color: #edeff3;
		height: 5px;
	}
	.padding .ant-slider .ant-slider-track {
		height: 5px;
		background-color: #b97b9c !important;
	}
	.padding .ant-slider .ant-slider-handle::after {
		height: 25px;
		margin-top: -7px;
		background: #f285bf;
		width: 18px;
		border-radius: 8px !important;
		border: none !important;
		margin-left: -4px;
		box-shadow: 0px 4px 6px rgba(157, 12, 89, 0.4) !important;
	}
	.padding .ant-slider .ant-slider-handle::before {
		border-radius: 8px !important;
		border: none !important;
		box-shadow: 0px 4px 6px rgba(157, 12, 89, 0.4) !important;
	}
	@media (max-width: 640px) {
		.ant-modal-content {
			padding: 12px !important;
		}
		.ant-modal-content .ant-modal-close {
			margin-top: -2px !important;
		}
	}
`;
