// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useContext, useEffect, useState } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { Checkbox, Form, Modal, Slider, Spin } from 'antd';
import BN from 'bn.js';
import { dmSans } from 'pages/_app';
import { ApiContext } from 'src/context/ApiContext';
import { ETrackDelegationStatus, NotificationStatus } from 'src/types';
import AddressInput from 'src/ui-components/AddressInput';
import BalanceInput from 'src/ui-components/BalanceInput';
import queueNotification from 'src/ui-components/QueueNotification';
import styled from 'styled-components';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { ITrackDelegation } from 'pages/api/v1/delegations';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import DelegationSuccessPopup from './DelegationSuccessPopup';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import { formatBalance } from '@polkadot/util';
import { chainProperties } from '~src/global/networkConstants';
import { useRouter } from 'next/router';
import { isAddress } from 'ethers';
import Balance from '~src/components/Balance';
import executeTx from '~src/util/executeTx';
import { formatedBalance } from '~src/util/formatedBalance';
import DelegatedProfileIcon from '~assets/icons/delegate-profile.svg';
import LockIcon from '~assets/icons/lock.svg';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { CloseIcon, DelegateModalIcon } from '~src/ui-components/CustomIcons';
import { useTheme } from 'next-themes';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Popover from '~src/basic-components/Popover';
import blockToDays from '~src/util/blockToDays';
import Alert from '~src/basic-components/Alert';
import { delegationSupportedNetworks } from '~src/components/Post/Tabs/PostStats/util/constants';
import userProfileBalances from '~src/util/userProfileBalances';

const ZERO_BN = new BN(0);

interface Props {
	trackNum?: number;
	className?: string;
	defaultTarget?: string;
	open?: boolean;
	setOpen?: (pre: boolean) => void;
	onConfirm?: (balance: string, delegatedTo: string, lockPeriod: number) => void;
}

const DelegateModal = ({ className, defaultTarget, open, setOpen, trackNum, onConfirm }: Props) => {
	const { api, apiReady } = useContext(ApiContext);
	const { network } = useNetworkSelector();
	const [form] = Form.useForm();
	const { resolvedTheme: theme } = useTheme();
	const [loading, setLoading] = useState<boolean>(false);
	const { delegationDashboardAddress } = useUserDetailsSelector();
	const [target, setTarget] = useState<string>(defaultTarget || '');
	const [bnBalance, setBnBalance] = useState<BN>(ZERO_BN);
	const [conviction, setConviction] = useState<number>(0);
	const [lock, setLockValue] = useState<number>(0);
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);
	const [availableTransferableBalance, setAvailableTransferableBalance] = useState<BN>(ZERO_BN);
	const [checkedList, setCheckedList] = useState<CheckboxValueType[]>([]);
	const [indeterminate, setIndeterminate] = useState(false);
	const [checkAll, setCheckAll] = useState(false);
	const [openSuccessPopup, setOpenSuccessPopup] = useState<boolean>(false);
	const [txFee, setTxFee] = useState(ZERO_BN);
	const [showAlert, setShowAlert] = useState<boolean>(false);
	const [trackArr, setTrackArr] = useState<any[]>([]);
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [defaultOpen, setDefaultOpen] = useState<boolean>(false);
	const [checkedTrack, setCheckedTrack] = useState<any>(null);
	const router = useRouter();
	const [checkedTrackArr, setCheckedTrackArr] = useState<string[]>([]);
	const [addressAlert, setAddressAlert] = useState<boolean>(false);
	const [isBalanceUpdated, setIsBalanceUpdated] = useState<boolean>(false);
	const [days, setDays] = useState<number>(0);
	const isTargetAddressSame =
		delegationDashboardAddress && target ? delegationDashboardAddress === target || delegationDashboardAddress === getEncodedAddress(target, network) : false;
	const delegateButtonDisable =
		!form.getFieldValue('targetAddress') ||
		!delegationDashboardAddress ||
		bnBalance.lte(ZERO_BN) ||
		isNaN(conviction) ||
		isTargetAddressSame ||
		loading ||
		availableBalance.lte(txFee.add(bnBalance)) ||
		(checkedTrack == null && !checkedList?.length);

	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});

		if (defaultTarget) {
			form.setFieldValue('targetAddress', defaultTarget);
			setTarget(defaultTarget);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, defaultTarget]);

	const handleSubstrateAddressChangeAlert = (target: string) => {
		if (!target) return;
		(getEncodedAddress(target, network) || isAddress(target)) && target !== getEncodedAddress(target, network) && setAddressAlert(true);
		setTimeout(() => {
			setAddressAlert(false);
		}, 5000);
	};

	const handleClose = (removedTag: string) => {
		const newList = checkedList.filter((list) => list !== removedTag);
		setCheckedList(newList);
		setIndeterminate(!!newList.length && newList.length < trackArr.length);
		setCheckAll(newList.length === trackArr.length);
	};

	const getTxFee = (checkedTracksList?: CheckboxValueType[], convictionVal?: number) => {
		if (!checkedTracksList) {
			checkedTracksList = checkedList;
		}
		if (!convictionVal) {
			convictionVal = conviction || 0;
		}

		const delegateTo = form.getFieldValue('targetAddress');
		if (!api || !apiReady || !delegateTo) return;
		if (!delegationDashboardAddress || !delegateTo || !getEncodedAddress(delegateTo, network) || isNaN(convictionVal) || !bnBalance || isTargetAddressSame) return;

		if (!checkedTrack && !checkedTracksList.length) return;

		setLoading(true);
		const checkedArr =
			checkedTrack && checkedTrack.name && checkedTracksList.filter((item) => item === checkedTrack?.name).length === 0
				? [checkedTrack?.name, ...checkedTracksList]
				: [...checkedTracksList];

		setCheckedTrackArr(checkedArr);
		const txArr = checkedArr?.map((trackName) =>
			api.tx.convictionVoting.delegate(networkTrackInfo[network][trackName.toString()].trackId, delegateTo, Number(convictionVal), bnBalance.toString())
		);
		const delegateTxn = txArr?.length > 1 ? api.tx.utility.batchAll(txArr) : txArr?.[0];

		(async () => {
			const info = await delegateTxn?.paymentInfo(delegationDashboardAddress);
			setTxFee(new BN(info.partialFee.toString() || 0));
			setLoading(false);
			setShowAlert(true);
		})();
	};

	const getData = async () => {
		if (!api || !apiReady || !delegationDashboardAddress) return;
		const res = api?.consts?.convictionVoting?.voteLockingPeriod;
		const num = res?.toJSON();
		const days = blockToDays(num, network);
		setDays(days);
		setLoading(true);
		form.setFieldValue('dashboardAddress', delegationDashboardAddress);

		const { data, error } = await nextApiClientFetch<ITrackDelegation[]>('api/v1/delegations', {
			address: delegationDashboardAddress
		});
		if (data) {
			const trackData = data.filter((item) => !item.status.includes(ETrackDelegationStatus.DELEGATED));
			if (network) {
				const tracks = trackData.map((item) => {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const values = Object.entries(networkTrackInfo?.[network]).find(([key, value]) => {
						return value.trackId === item?.track;
					});

					return values
						? {
								name: values[0],
								trackId: values[1].trackId
						  }
						: null;
				});
				setTrackArr(tracks);
				const defaultCheck = tracks.filter((item) => item?.trackId === trackNum);
				defaultCheck.length > 0 && defaultCheck?.[0] && setCheckedTrack(defaultCheck[0]);
			}
		} else {
			console.log(error);
		}
		setLoading(false);
	};

	const onChange = (list: CheckboxValueType[]) => {
		setCheckedList(list);
		getTxFee(list);
		setIndeterminate(!!list.length && list.length < trackArr.length);
		setCheckAll(list.length === trackArr.length);
	};

	const onCheckAllChange = (e: CheckboxChangeEvent) => {
		const list = e.target.checked ? trackArr.map((track) => track?.name) : [];
		setCheckedList(list);
		getTxFee(list);
		setIndeterminate(false);
		setCheckAll(e.target.checked);
	};

	const onSuccess = () => {
		queueNotification({
			header: 'Success!',
			message: 'Delegation successful.',
			status: NotificationStatus.SUCCESS
		});
		setOpenSuccessPopup(true);
		setIsBalanceUpdated(true);
		onConfirm?.(bnBalance.toString(), target, conviction);
		setLoading(false);
		setOpen ? setOpen?.(false) : setDefaultOpen(false);
	};
	const onFailed = (message: string) => {
		queueNotification({
			header: 'Failed!',
			message,
			status: NotificationStatus.ERROR
		});
		setLoading(false);
	};

	const handleSubmit = async () => {
		if (!api || !apiReady || !bnBalance || bnBalance.lte(ZERO_BN) || bnBalance.eq(ZERO_BN) || !target) return;
		if ((checkedTrack == null && !checkedList?.length) || !getEncodedAddress(target, network)?.length) return;
		setLoading(true);

		const checkedArr =
			checkedTrack && checkedTrack?.name && checkedList?.filter((item) => item === checkedTrack?.name).length === 0 ? [checkedTrack?.name, ...checkedList] : [...checkedList];
		setCheckedTrackArr(checkedArr);
		if (checkedArr?.length === 0) return;

		const txArr = checkedArr?.map((trackName) =>
			api.tx.convictionVoting.delegate(networkTrackInfo[network][trackName.toString()].trackId, target, conviction, bnBalance.toString())
		);
		const delegateTxn = txArr.length > 1 ? api.tx.utility.batchAll(txArr) : txArr[0];

		await executeTx({ address: delegationDashboardAddress, api, apiReady, errorMessageFallback: 'Delegation failed.', network, onFailed, onSuccess, tx: delegateTxn });
	};

	const handleOnBalanceChange = (balanceStr: string) => {
		let balance = ZERO_BN;

		try {
			balance = new BN(balanceStr);
		} catch (err) {
			console.log(err);
		}

		setAvailableBalance(balance);
	};

	const handleOnchangeConviction = (value: number) => {
		let conviction = 0;
		let lockValue = 0;
		if (value === 1) {
			conviction = 0;
		} else if (value === 2) {
			conviction = 1;
			lockValue = 1;
		} else {
			conviction = value - 1;
			lockValue = 2 ** (value - 2);
		}
		setConviction(conviction);
		setLockValue(lockValue);
	};

	const handleCloseModal = () => {
		form.setFieldValue('balance', '');
		setBnBalance(ZERO_BN);
		setConviction(0);
		setCheckedList([]);
		setOpen ? setOpen?.(false) : setDefaultOpen(false);
	};

	useEffect(() => {
		getData();

		(async () => {
			const allBalances = await userProfileBalances({ address: delegationDashboardAddress, api, apiReady, network });
			setAvailableTransferableBalance(allBalances?.transferableBalance || ZERO_BN);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, delegationDashboardAddress, api, apiReady]);

	useEffect(() => {
		if (!network || !api || !apiReady) return;
		getTxFee();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, api, apiReady]);

	const content = (
		<div className='flex flex-col'>
			<Checkbox.Group
				className='flex max-h-[200px] flex-col overflow-y-auto'
				onChange={onChange}
				value={checkedList}
			>
				{trackArr
					?.filter((item) => item?.trackId !== trackNum)
					?.map((track, index) => (
						<div
							className={`${dmSans.variable} ${dmSans.className} flex gap-[13px] p-[8px] text-sm tracking-[0.01em] text-bodyBlue dark:text-blue-dark-high`}
							key={index}
						>
							<Checkbox
								className='text-pink_primary'
								value={track?.name}
							/>
							{track.name === 'root' ? 'Root' : track.name?.split(/(?=[A-Z])/).join(' ')}
						</div>
					))}
			</Checkbox.Group>
		</div>
	);
	return (
		<>
			{!open && !setOpen && (
				<div>
					<CustomButton
						className='delegation-buttons'
						variant='default'
						buttonsize='xs'
						onClick={() => {
							delegationSupportedNetworks.includes(network) ? router.push('/delegation') : setDefaultOpen(true);
						}}
					>
						<DelegatedProfileIcon className='mr-2' />
						<span>Delegate</span>
					</CustomButton>
				</div>
			)}
			<Modal
				maskClosable={false}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive ' />}
				className={`${dmSans.variable} ${dmSans.className} padding shadow-[0px 8px 18px rgba(0, 0, 0, 0.06)] w-[600px] max-md:w-full dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
				wrapClassName={`${className} dark:bg-modalOverlayDark`}
				title={
					<div className=' flex items-center border-0 border-b-[1px] border-solid border-section-light-container pb-3  text-[18px] font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high sm:px-6 sm:pb-4 sm:text-[20px]'>
						<DelegateModalIcon className='-mt-1 mr-2 text-[20px] text-lightBlue dark:text-icon-dark-inactive ' />
						Delegate
					</div>
				}
				open={open ? open : defaultOpen}
				onOk={handleSubmit}
				confirmLoading={loading}
				onCancel={handleCloseModal}
				footer={
					<div className='-mx-6 flex items-center justify-evenly gap-1 border-0 border-t-[1px] border-solid border-section-light-container px-6 pt-4 dark:border-[#3B444F] dark:border-separatorDark sm:justify-end'>
						<CustomButton
							text='Cancel'
							className='rounded-[4px] text-sm sm:text-base'
							variant='default'
							buttonsize='xs'
							onClick={handleCloseModal}
						/>
						<CustomButton
							text='Delegate'
							variant='primary'
							className={`rounded-[4px] text-sm sm:text-base ${delegateButtonDisable && 'opacity-50'}`}
							disabled={delegateButtonDisable}
							onClick={async () => {
								await handleSubmit();
							}}
							buttonsize='xs'
						/>
					</div>
				}
			>
				<Spin
					spinning={loading}
					indicator={<LoadingOutlined />}
				>
					<div className='flex flex-col'>
						<Form
							form={form}
							disabled={loading}
							initialValues={{ dashboardAddress: delegationDashboardAddress }}
						>
							<div className='flex flex-col'>
								{availableBalance.lte(bnBalance) && txFee.gt(ZERO_BN) && (
									<Alert
										type='error'
										className='mb-2 h-10 rounded-[4px] sm:mb-4'
										showIcon
										message={<span className='dark:text-blue-dark-high'>Insufficient balance</span>}
									/>
								)}

								{availableTransferableBalance.lte(txFee) && !txFee.eq(ZERO_BN) && (
									<Alert
										type='error'
										className='mb-2 h-10 rounded-[4px] sm:mb-4'
										showIcon
										message={<span className='dark:text-blue-dark-high'>Insufficient Transferable Balance for paing Gas Fee</span>}
									/>
								)}

								<div className='mt-2 '>
									<label className='mb-[2px] text-sm text-lightBlue dark:text-blue-dark-medium'>Your Address</label>
									<AddressInput
										name='dashboardAddress'
										defaultAddress={delegationDashboardAddress}
										onChange={() => setLoading(false)}
										inputClassName={' font-normal text-sm h-[40px] text-lightBlue dark:text-blue-dark-medium dark:bg-[#1D1D1D]'}
										className='-mt-6 text-sm font-normal text-bodyBlue dark:bg-[#1D1D1D] dark:text-blue-dark-high'
										disabled
										size='large'
										identiconSize={30}
									/>
								</div>
								<AddressInput
									name='targetAddress'
									defaultAddress={defaultTarget || target}
									label={'Delegate To'}
									placeholder='Add Delegatee Address'
									className='font-normal text-lightBlue dark:text-blue-dark-medium sm:text-sm'
									onChange={(address) => {
										setTarget(address);
										handleSubstrateAddressChangeAlert(address);
									}}
									helpText='The amount requested in the proposal will be received in this address.'
									size='large'
									identiconSize={30}
									inputClassName={' font-normal text-sm h-[40px]'}
									skipFormatCheck={true}
									theme={theme}
								/>
								{target
									? (!(getEncodedAddress(target, network) || isAddress(target)) || isTargetAddressSame) && (
											<span className='text-sm text-[#ff4d4f]'>
												{isTargetAddressSame ? 'You can not delegate to the same address. Please provide a different target address' : 'Invalid address'}
											</span>
									  )
									: null}

								{addressAlert && (
									<Alert
										className='mb mt-2 rounded-[4px]'
										showIcon
										message={<span className='dark:text-blue-dark-high'>The substrate address has been changed to {network} address.</span>}
										type='info'
									/>
								)}

								<div className='mt-4 flex cursor-pointer items-center justify-between text-lightBlue dark:text-blue-dark-medium sm:mt-6'>
									Balance
									<span
										onClick={() => {
											setBnBalance(availableBalance);
											form.setFieldValue('balance', Number(formatedBalance(availableBalance.toString(), unit).replace(/,/g, '')));
										}}
									>
										<Balance
											address={delegationDashboardAddress}
											onChange={handleOnBalanceChange}
											isDelegating={true}
											isBalanceUpdated={isBalanceUpdated}
										/>
									</span>
								</div>

								<BalanceInput
									placeholder={'Enter balance'}
									className='text-sm font-normal text-lightBlue dark:text-blue-dark-high'
									address={delegationDashboardAddress}
									onAccountBalanceChange={handleOnBalanceChange}
									onChange={(balance) => setBnBalance(balance)}
									size='middle'
									inputClassName='text-[#7c899b] text-sm dark:bg-section-dark-overlay'
									theme={theme}
								/>
								<div className='mb-2 sm:mt-4'>
									<label className='flex items-center text-sm text-lightBlue dark:text-blue-dark-medium'>
										Conviction
										<span>
											<HelperTooltip
												className='ml-1'
												text='You can multiply your votes by locking your tokens for longer periods of time.'
											/>
										</span>
									</label>

									<div className='mt-3 px-[2px] sm:mt-4'>
										<Slider
											tooltip={{ open: false }}
											className='mt-[9px] text-sm'
											trackStyle={{ backgroundColor: '#FF49AA' }}
											onChange={handleOnchangeConviction}
											step={7}
											marks={{
												1: { label: <div>0.1x</div>, style: { color: `${theme === 'dark' ? '#909090' : '#243A57'}`, fontSize: '12px', marginTop: '16px' } },
												2: { label: <div>1x</div>, style: { color: `${theme === 'dark' ? '#909090' : '#243A57'}`, fontSize: '12px', marginTop: '16px' } },
												3: { label: <div>2x</div>, style: { color: `${theme === 'dark' ? '#909090' : '#243A57'}`, fontSize: '12px', marginTop: '16px' } },
												4: { label: <div>3x</div>, style: { color: `${theme === 'dark' ? '#909090' : '#243A57'}`, fontSize: '12px', marginTop: '16px' } },
												5: { label: <div>4x</div>, style: { color: `${theme === 'dark' ? '#909090' : '#243A57'}`, fontSize: '12px', marginTop: '16px' } },
												6: { label: <div>5x</div>, style: { color: `${theme === 'dark' ? '#909090' : '#243A57'}`, fontSize: '12px', marginTop: '16px' } },
												7: { label: <div>6x</div>, style: { color: `${theme === 'dark' ? '#909090' : '#243A57'}`, fontSize: '12px', marginTop: '16px' } }
											}}
											min={1}
											max={7}
											defaultValue={1}
										/>
									</div>
								</div>
								<div className='track-[0.0025em] mt-3 flex items-center justify-between rounded-md bg-[#F6F7F9] px-2 py-2 dark:bg-inactiveIconDark sm:mt-4 sm:px-[17px] sm:py-[13px]'>
									<div className='flex items-center justify-center gap-2.5 text-xs text-lightBlue dark:text-blue-dark-medium sm:text-sm'>
										<LockIcon />
										<span>Locking period</span>
									</div>
									<div className='flex items-center justify-center text-xs font-medium text-bodyBlue dark:text-blue-dark-high sm:text-sm'>
										{conviction === 0 ? '0.1x voting balance, no lockup period' : `${conviction}x voting balance for duration (${Number(lock) * days} days)`}
									</div>
								</div>
								<div className='mb-2 mt-4 flex flex-col justify-between sm:mt-6 sm:flex-row sm:items-center'>
									<span className='text-sm text-lightBlue dark:text-blue-dark-medium'>Selected track(s)</span>
									{trackArr?.length ? (
										<Popover
											content={content}
											placement='top'
											zIndex={1056}
											className='mt-1 sm:mt-0'
										>
											<Checkbox
												indeterminate={indeterminate}
												onChange={onCheckAllChange}
												checked={checkAll}
												className='dark:text-blue-dark-medium'
											>
												Delegate to all available tracks
											</Checkbox>
										</Popover>
									) : (
										<Checkbox
											indeterminate={indeterminate}
											onChange={onCheckAllChange}
											checked={checkAll}
											className='dark:text-blue-dark-medium'
										>
											Select available tracks
										</Checkbox>
									)}
								</div>
								{
									<div className='mb-2 mt-0 flex flex-wrap gap-2 sm:mb-6 '>
										{checkedTrack && (
											<div
												key={checkedTrack?.trackId}
												className='flex items-center justify-center gap-2 rounded-[20px] border-[1px] border-solid border-section-light-container px-3 py-2 text-sm text-[#7c899b] dark:border-[#3B444F] dark:border-separatorDark dark:text-white'
											>
												{checkedTrack?.name}
											</div>
										)}
										{checkedList.length > 0 &&
											checkedList
												.filter((item) => item !== checkedTrack?.name)
												.map((list, index) => (
													<div
														key={index}
														className='flex items-center justify-center gap-2 rounded-[20px] border-[1px] border-solid border-section-light-container px-3 py-2 text-sm text-[#7c899b] dark:border-[#3B444F] dark:border-separatorDark dark:text-white'
													>
														{list}
														<span
															onClick={() => handleClose(String(list))}
															className='flex items-center justify-center'
														>
															<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />
														</span>
													</div>
												))}
									</div>
								}
							</div>
						</Form>

						{showAlert && (
							<Alert
								showIcon
								type='info'
								className='mb-2 rounded-[4px] sm:mb-4'
								message={
									<span className='dark:text-blue-dark-high'>An approximate fees of {formatBalance(txFee.toString(), { forceUnit: unit })} will be applied to the transaction</span>
								}
							/>
						)}
					</div>
				</Spin>
			</Modal>
			{checkedTrack?.name && (
				<DelegationSuccessPopup
					open={openSuccessPopup}
					setOpen={setOpenSuccessPopup}
					tracks={[...checkedTrackArr.filter((track) => track !== checkedTrack?.name), checkedTrack?.name || '']}
					address={target}
					isDelegate={true}
					balance={bnBalance}
					trackNum={trackNum}
					conviction={conviction}
					title={'Delegated Successfully'}
				/>
			)}
		</>
	);
};

export default styled(DelegateModal)`
	.padding .ant-modal-close {
		margin-top: 4px;
	}
	.padding .ant-modal-close:hover {
		margin-top: 4px;
	}
	.padding .ant-alert-message {
		color: var(--bodyBlue);
		font-size: 14px;
		font-weight: 400;
	}
	.padding .ant-slider-dot {
		height: 12px;
		width: 2px;
		border-radius: 0px !important;
		border-color: #d2d8e0;
		margin-top: -1px;
	}
	.padding .ant-slider-dot-active {
		border-color: var(--pink_primary) !important;
		width: 2px;
		height: 12px;
		border-radius: 0px !important;
		margin-top: -1px;
	}
	.padding .ant-tooltip-open {
		border-color: #d2d8e0 !important;
		margin-top: -1px;
	}
	.padding .ant-slider .ant-slider-rail {
		background-color: #d2d8e0;
		height: 5px;
	}
	.padding .ant-slider .ant-slider-track {
		height: 5px;
		background-color: var(--pink_primary) !important;
	}
	.padding .ant-slider .ant-slider-handle::after {
		height: 25px;
		margin-top: -7px;
		background: var(--pink_primary);
		width: 18px;
		border-radius: 8px !important;
		border: none !important;
		margin-left: -2px;
		box-shadow: 0px 4px 6px rgba(157, 12, 89, 0.4) !important;
	}
	.padding .ant-slider .ant-slider-handle::before {
		border-radius: 8px !important;
		border: none !important;
		box-shadow: 0px 4px 6px rgba(157, 12, 89, 0.4) !important;
	}
	@media (max-width: 640px) and (min-width: 320px) {
		.ant-modal-content .ant-modal-close {
			margin-top: -3px !important;
		}
	}

	@media (max-width: 365px) and (min-width: 320px) {
		.delegation-buttons {
			padding: 12px 0px;
		}
		.ant-modal-content .ant-modal-close {
			margin-top: -3px !important;
		}
	}
	@media (max-width: 640px) {
		.ant-modal-content {
			padding: 12px !important;
		}
	}
`;
