// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useContext, useEffect, useState } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { Alert, Button, Checkbox, Form, Modal, Popover, Slider, Spin } from 'antd';
import BN from 'bn.js';
import { poppins } from 'pages/_app';
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
import Web3 from 'web3';
import Balance from '~src/components/Balance';
import executeTx from '~src/util/executeTx';
import { formatedBalance } from '~src/util/formatedBalance';
import usePolkasafe from '~src/hooks/usePolkasafe';
import DelegateProfileWhiteIcon from '~assets/icons/delegation-listing.svg';
import LockIcon from '~assets/icons/lock.svg';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { CloseIcon, DelegateModalIcon } from '~src/ui-components/CustomIcons';
import { useTheme } from 'next-themes';

const ZERO_BN = new BN(0);

interface Props {
	trackNum?: number;
	className?: string;
	defaultTarget?: string;
	open?: boolean;
	setOpen?: (pre: boolean) => void;
	isMultisig?: boolean;
}

const DelegateModal = ({ className, defaultTarget, open, setOpen, trackNum, isMultisig }: Props) => {
	const { api, apiReady } = useContext(ApiContext);
	const { network } = useNetworkSelector();
	const [form] = Form.useForm();
	const { resolvedTheme: theme } = useTheme();
	const [loading, setLoading] = useState<boolean>(false);
	const { delegationDashboardAddress } = useUserDetailsSelector();
	const [target, setTarget] = useState<string>('');
	const [bnBalance, setBnBalance] = useState<BN>(ZERO_BN);
	const [conviction, setConviction] = useState<number>(0);
	const [lock, setLockValue] = useState<number>(0);
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);
	const [checkedList, setCheckedList] = useState<CheckboxValueType[]>([]);
	const [indeterminate, setIndeterminate] = useState(false);
	const [checkAll, setCheckAll] = useState(false);
	const [openSuccessPopup, setOpenSuccessPopup] = useState<boolean>(false);
	const [txFee, setTxFee] = useState(ZERO_BN);
	const [showAlert, setShowAlert] = useState<boolean>(false);
	const [trackArr, setTrackArr] = useState<any[]>([]);
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [defaultOpen, setDefaultOpen] = useState<boolean>(false);
	const [checkedTrack, setCheckedTrack] = useState<any>();
	const router = useRouter();
	const [checkedTrackArr, setCheckedTrackArr] = useState<string[]>([]);
	const [addressAlert, setAddressAlert] = useState<boolean>(false);
	const multisigDelegationAssociatedAddress = localStorage.getItem('multisigDelegationAssociatedAddress') || '';
	const { client, connect } = usePolkasafe(multisigDelegationAssociatedAddress);
	const isTargetAddressSame =
		delegationDashboardAddress && target ? delegationDashboardAddress === target || delegationDashboardAddress === getEncodedAddress(target, network) : false;

	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});

		if (defaultTarget) {
			form.setFieldValue('targetAddress', defaultTarget);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	const handleSubstrateAddressChangeAlert = (target: string) => {
		if (!target) return;
		(getEncodedAddress(target, network) || Web3.utils.isAddress(target)) && target !== getEncodedAddress(target, network) && setAddressAlert(true);
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
		if (
			!delegationDashboardAddress ||
			!delegateTo ||
			!getEncodedAddress(delegateTo, network) ||
			isNaN(convictionVal) ||
			!bnBalance ||
			bnBalance.lte(ZERO_BN) ||
			bnBalance.eq(ZERO_BN) ||
			isTargetAddressSame
		)
			return;
		if (!checkedTrack && !checkedTracksList) return;

		setLoading(true);
		const checkedArr =
			checkedTrack && checkedTrack.name && checkedTracksList.filter((item) => item === checkedTrack?.name).length === 0
				? [checkedTrack?.name, ...checkedTracksList]
				: [...checkedTracksList];

		setCheckedTrackArr(checkedArr);
		const txArr = checkedArr?.map((trackName) =>
			api.tx.convictionVoting.delegate(networkTrackInfo[network][trackName.toString()].trackId, delegateTo, Number(convictionVal), bnBalance.toString())
		);
		const delegateTxn = api.tx.utility.batchAll(txArr);

		(async () => {
			const info = await delegateTxn.paymentInfo(delegationDashboardAddress);
			setTxFee(new BN(info.partialFee.toString() || 0));
			setLoading(false);
			setShowAlert(true);
		})();
	};

	const getData = async () => {
		if (!api || !apiReady) return;
		setLoading(true);
		form.setFieldValue('dashboardAddress', delegationDashboardAddress);

		const { data, error } = await nextApiClientFetch<ITrackDelegation[]>(`api/v1/delegations?address=${delegationDashboardAddress}`);
		if (data) {
			const trackData = data.filter((item) => !item.status.includes(ETrackDelegationStatus.Delegated));
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
		setOpen ? setOpen?.(false) : setDefaultOpen(false);
	};

	const handleSubmit = async () => {
		if (!api || !apiReady || !bnBalance || bnBalance.lte(ZERO_BN) || bnBalance.eq(ZERO_BN) || !target) return;
		if ((!checkedTrack && !checkedList) || !getEncodedAddress(target, network)) return;
		setLoading(true);

		const checkedArr =
			checkedTrack && checkedTrack.name && checkedList.filter((item) => item === checkedTrack?.name).length === 0 ? [checkedTrack?.name, ...checkedList] : [...checkedList];
		setCheckedTrackArr(checkedArr);

		const txArr = checkedArr?.map((trackName) =>
			api.tx.convictionVoting.delegate(networkTrackInfo[network][trackName.toString()].trackId, target, conviction, bnBalance.toString())
		);
		const delegateTxn = api.tx.utility.batchAll(txArr);

		if (isMultisig) {
			const delegationByMultisig = async (tx: any) => {
				try {
					setLoading(true);
					await connect();
					const { error } = await client.customTransactionAsMulti(delegationDashboardAddress, tx);
					if (error) {
						throw new Error(error.error);
					}
					queueNotification({
						header: 'Success!',
						message: 'Delegation will be successful once approved by other signatories.',
						status: NotificationStatus.SUCCESS
					});
					setOpenSuccessPopup(true);
					setOpen ? setOpen?.(false) : setDefaultOpen(false);
				} catch (error) {
					onFailed(error.message);
				} finally {
					setLoading(false);
				}
			};
			setLoading(true);
			await delegationByMultisig(delegateTxn);
			return;
		}

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

	useEffect(() => {
		open && getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open]);

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
		getTxFee(checkedList, conviction);
	};

	const handleCloseModal = () => {
		form.setFieldValue('balance', '');
		setBnBalance(ZERO_BN);
		setConviction(0);
		setCheckedList([]);
		setOpen ? setOpen?.(false) : setDefaultOpen(false);
	};

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
							className={`${poppins.variable} ${poppins.className} flex gap-[13px] p-[8px] text-sm tracking-[0.01em] text-bodyBlue dark:text-blue-dark-high`}
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
				<Button
					onClick={() => {
						network === 'kusama' ? router.push('/delegation') : setDefaultOpen(true);
					}}
					className='flex items-center justify-center gap-0 rounded-md border-pink_primary bg-pink_primary p-5 text-sm font-medium text-white'
				>
					<DelegateProfileWhiteIcon className='mr-2' />
					<span>Delegate</span>
				</Button>
			)}
			<Modal
				maskClosable={false}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
				className={`${poppins.variable} ${poppins.className} padding shadow-[0px 8px 18px rgba(0, 0, 0, 0.06)] w-[600px] max-md:w-full dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
				wrapClassName={`${className} dark:bg-modalOverlayDark`}
				title={
					<div className='-mx-6 mb-6 flex items-center border-0 border-b-[1px] border-solid border-[#D2D8E0] px-6 pb-4 text-[20px] font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high'>
						<DelegateModalIcon className='mr-2 text-lightBlue dark:text-icon-dark-inactive' />
						Delegate
					</div>
				}
				open={open ? open : defaultOpen}
				onOk={handleSubmit}
				confirmLoading={loading}
				onCancel={handleCloseModal}
				footer={
					<div className='-mx-6 flex items-center justify-end gap-1 border-0 border-t-[1px] border-solid border-[#D2D8E0] px-6 pt-4 dark:border-[#3B444F] dark:border-separatorDark'>
						<Button
							key='back'
							disabled={loading}
							className='h-[40px] w-[134px] rounded-[4px] border-pink_primary tracking-wide text-pink_primary dark:bg-section-dark-overlay dark:text-white'
							onClick={handleCloseModal}
						>
							Cancel
						</Button>
						<Button
							htmlType='submit'
							key='submit'
							className={`h-[40px] w-[134px] rounded-[4px] border-pink_primary bg-pink_primary text-white hover:bg-pink_secondary dark:bg-[#33071E] dark:text-pink_primary
							${
								(!form.getFieldValue('targetAddress') ||
									!delegationDashboardAddress ||
									bnBalance.lte(ZERO_BN) ||
									isNaN(conviction) ||
									isTargetAddressSame ||
									loading ||
									txFee.lte(ZERO_BN) ||
									availableBalance.lte(txFee.add(bnBalance))) &&
								'opacity-50'
							}`}
							disabled={
								!form.getFieldValue('targetAddress') ||
								!delegationDashboardAddress ||
								bnBalance.lte(ZERO_BN) ||
								isNaN(conviction) ||
								isTargetAddressSame ||
								loading ||
								txFee.lte(ZERO_BN) ||
								availableBalance.lte(txFee.add(bnBalance))
							}
							onClick={async () => {
								await handleSubmit();
							}}
						>
							Delegate
						</Button>
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
										className='mb-4 h-10 rounded-[4px] dark:border-[#5C3931] dark:bg-[#331701]'
										showIcon
										message={<span className='dark:text-blue-dark-high'>Insufficient balance</span>}
									/>
								)}
								<div className=''>
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
									onBlur={getTxFee}
									name='targetAddress'
									defaultAddress={defaultTarget || target}
									label={'Beneficiary Address'}
									placeholder='Add beneficiary address'
									className='text-sm font-normal text-lightBlue dark:text-blue-dark-medium'
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
									? (!(getEncodedAddress(target, network) || Web3.utils.isAddress(target)) || isTargetAddressSame) && (
											<span className='text-sm text-[#ff4d4f]'>
												{isTargetAddressSame ? 'You can not delegate to the same address. Please provide a different target address' : 'Invalid address'}
											</span>
									  )
									: null}

								{addressAlert && (
									<Alert
										className='mb mt-2 rounded-[4px] dark:border-[#125798] dark:bg-[#05263F]'
										showIcon
										message={<span className='dark:text-blue-dark-high'>The substrate address has been changed to Kusama address.</span>}
									/>
								)}

								<div className='mt-6 flex cursor-pointer items-center justify-between text-lightBlue dark:text-blue-dark-medium'>
									Balance
									<span
										onClick={() => {
											setBnBalance(availableBalance);
											form.setFieldValue('balance', Number(formatedBalance(availableBalance.toString(), unit)));
										}}
									>
										<Balance
											address={delegationDashboardAddress}
											onChange={handleOnBalanceChange}
										/>
									</span>
								</div>

								<BalanceInput
									onBlur={getTxFee}
									placeholder={'Enter balance'}
									className='text-sm font-normal text-lightBlue dark:text-blue-dark-high'
									address={delegationDashboardAddress}
									onAccountBalanceChange={handleOnBalanceChange}
									onChange={(balance) => setBnBalance(balance)}
									size='middle'
									inputClassName='text-[#7c899b] text-sm dark:bg-section-dark-overlay'
									theme={theme}
								/>
								<div className='mb-2 mt-4'>
									<label className='flex items-center text-sm text-lightBlue dark:text-blue-dark-medium'>
										Conviction
										<span>
											<HelperTooltip
												className='ml-1'
												text='You can multiply your votes by locking your tokens for longer periods of time.'
											/>
										</span>
									</label>

									<div className='mt-4 px-[2px]'>
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
								<div className='track-[0.0025em] mt-4 flex items-center justify-between rounded-md bg-[#F6F7F9] px-[17px] py-[13px] dark:bg-inactiveIconDark'>
									<div className='flex items-center justify-center gap-[10px] text-sm text-lightBlue dark:text-blue-dark-medium'>
										<LockIcon />
										<span>Locking period</span>
									</div>
									<div className='flex items-center justify-center text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>
										{conviction === 0 ? '0.1x voting balance, no lockup period' : `${conviction}x voting balance, locked for ${lock} enactment period`}
									</div>
								</div>
								<div className='mb-2 mt-6 flex items-center justify-between'>
									<span className='text-sm text-lightBlue dark:text-blue-dark-medium'>Selected track(s)</span>
									{trackArr.length ? (
										<Popover
											defaultOpen={true}
											content={content}
											placement='topLeft'
											zIndex={1056}
										>
											<Checkbox
												indeterminate={indeterminate}
												onChange={onCheckAllChange}
												checked={checkAll}
												className='dark:text-blue-dark-medium'
											>
												Select available tracks
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
									<div className='mb-6 mt-0 flex flex-wrap gap-2 '>
										{checkedTrack && (
											<div
												key={checkedTrack?.trackId}
												className='flex items-center justify-center gap-2 rounded-[20px] border-[1px] border-solid border-[#D2D8E0] px-3 py-2 text-sm text-[#7c899b] dark:border-[#3B444F] dark:border-separatorDark dark:text-white'
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
														className='flex items-center justify-center gap-2 rounded-[20px] border-[1px] border-solid border-[#D2D8E0] px-3 py-2 text-sm text-[#7c899b] dark:border-[#3B444F] dark:border-separatorDark dark:text-white'
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
								className='mb-4 rounded-[4px] dark:border-[#125798] dark:bg-[#05263F]'
								message={
									<span className='dark:text-blue-dark-high'>An approximate fees of {formatBalance(txFee.toString(), { forceUnit: unit })} will be applied to the transaction</span>
								}
							/>
						)}
					</div>
				</Spin>
			</Modal>
			<DelegationSuccessPopup
				open={openSuccessPopup}
				redirect={true}
				setOpen={setOpenSuccessPopup}
				tracks={checkedTrackArr}
				address={target}
				isMultisig={isMultisig}
				isDelegate={true}
				balance={bnBalance}
				trackNum={trackNum}
				conviction={conviction}
				title={isMultisig ? 'Delegation with Polkasafe initiated' : ' Delegated Successfully'}
			/>
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
`;
