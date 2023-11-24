// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, Input, Modal, Select, Spin } from 'antd';
import { useCurrentTokenDataSelector, useNetworkSelector, useTippingDataSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useApiContext } from '~src/context';
import { LoadingStatusType, NotificationStatus } from '~src/types';
import BN from 'bn.js';
import { network as AllNetworks } from '~src/global/networkConstants';
import { poppins } from 'pages/_app';
import BalanceInput from '~src/ui-components/BalanceInput';
import styled from 'styled-components';
import queueNotification from '~src/ui-components/QueueNotification';
import executeTx from '~src/util/executeTx';
import { inputToBn } from '~src/util/inputToBn';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { MessageType } from '~src/auth/types';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
import { formatBalance } from '@polkadot/util';
import HelperTooltip from '~src/ui-components/HelperTooltip';

import Tip1Icon from '~assets/icons/tip-1.svg';
import Tip2Icon from '~assets/icons/tip-2.svg';
import Tip3Icon from '~assets/icons/tip-3.svg';
import Tip4Icon from '~assets/icons/tip-4.svg';
import SaySomethingIcon from '~assets/icons/say-something.svg';
import CloseIcon from '~assets/icons/close.svg';
import TipIcon from '~assets/icons/tip-title.svg';
import fetchTokenToUSDPrice from '~src/util/fetchTokenToUSDPrice';
import { setCurrentTokenPrice } from '~src/redux/currentTokenPrice';
import { useDispatch } from 'react-redux';
import AddressConnectModal from '~src/ui-components/AddressConnectModal';
import Balance from '../Balance';
import Address from '~src/ui-components/Address';
import { useTheme } from 'next-themes';
import DownArrow from '~assets/icons/down-icon.svg';
import { getKiltDidLinkedAccounts } from '~src/util/kiltDid';
import { setReceiver } from '~src/redux/Tipping';
import getEncodedAddress from '~src/util/getEncodedAddress';

const ZERO_BN = new BN(0);

interface Props {
	open: boolean;
	setOpen: (pre: boolean) => void;
	className?: string;
	username: string;
	openAddressChangeModal: boolean;
	setOpenAddressChangeModal: (pre: boolean) => void;
	paUsername: string;
}

const TIPS: { key: 'threeDollar' | 'fiveDollar' | 'tenDollar' | 'fifteenDollar'; value: number }[] = [
	{ key: 'threeDollar', value: 3 },
	{ key: 'fiveDollar', value: 5 },
	{ key: 'tenDollar', value: 10 },
	{ key: 'fifteenDollar', value: 15 }
];

const Tipping = ({ className, open, setOpen, username, openAddressChangeModal, setOpenAddressChangeModal, paUsername }: Props) => {
	const { network } = useNetworkSelector();
	const { loginWallet, loginAddress } = useUserDetailsSelector();
	const { currentTokenPrice } = useCurrentTokenDataSelector();
	const { receiverAddress } = useTippingDataSelector();
	const { api, apiReady } = useApiContext();
	const dispatch = useDispatch();
	const [form] = Form.useForm();
	const { resolvedTheme: theme } = useTheme();
	const [address, setAddress] = useState<string>(loginAddress);
	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: true, message: '' });
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);
	const [tipAmount, setTipAmount] = useState<BN>(ZERO_BN);
	const [tipInput, setTipInput] = useState<string>('0');
	const disable = loadingStatus.isLoading || availableBalance.lte(tipAmount) || !address || tipAmount.eq(ZERO_BN);
	const [remark, setRemark] = useState<string>('');
	const [existentialDeposit, setExistentialDeposit] = useState<BN>(ZERO_BN);
	const [kiltAccounts, setKiltAccounts] = useState<string[]>([]);
	const unit = chainProperties[network]?.tokenSymbol;
	const [isBalanceUpdated, setIsBalanceUpdated] = useState<boolean>(false);
	const [userAddresses, setUserAddresses] = useState<string[]>([]);
	const [beneficiaryAddress, setBeneficiaryAddress] = useState<string>(receiverAddress);
	const [dollarToTokenBalance, setDollarToTokenBalance] = useState<{ threeDollar: string; fiveDollar: string; tenDollar: string; fifteenDollar: string }>({
		fifteenDollar: '0',
		fiveDollar: '0',
		tenDollar: '0',
		threeDollar: '0'
	});

	const filterDuplicateAddresses = (addresses: string[]) => {
		const obj: any = {};
		for (const address of addresses) {
			const encodedAdd = getEncodedAddress(address, network) || '';
			if (obj[encodedAdd] === undefined) {
				obj[encodedAdd] = 1;
			} else {
				obj[encodedAdd] += 1;
			}
		}
		const dataArr: string[] = [];
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const data = Object.entries(obj).forEach(([key]) => {
			dataArr.push(key);
		});
		return dataArr;
	};
	const getKiltDidAccounts = async () => {
		if (!api || !apiReady || !network) return;
		const kiltAccounts = await getKiltDidLinkedAccounts(api, beneficiaryAddress || receiverAddress);
		if (kiltAccounts) {
			const linkedAccounts: string[] = [];
			kiltAccounts.map((account: any) => {
				Object.entries(account).forEach(([key, value]) => {
					if (key === 'AccountId32') linkedAccounts.push(value as string);
				});
			});
			setKiltAccounts(linkedAccounts);
		}
	};

	useEffect(() => {
		setBeneficiaryAddress(receiverAddress);
		if (network === AllNetworks.KILT) {
			getKiltDidAccounts();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [receiverAddress, network, api, apiReady]);

	const getUserProfile = async () => {
		const { data } = await nextApiClientFetch<any>(`api/v1/auth/data/userProfileWithUsername?username=${paUsername}`);
		if (data) {
			if (data?.addresses) {
				setUserAddresses(data?.addresses || []);
			}
		}
	};

	useEffect(() => {
		if (!paUsername) return;
		getUserProfile();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [paUsername, network]);

	const handleTipChangeToDollar = (value: number) => {
		const tip = value / Number(currentTokenPrice || 1);
		return String(tip.toFixed(2));
	};

	const getCurrentTokenPrice = async () => {
		if (currentTokenPrice !== 'N/A' && currentTokenPrice.length) return;
		const price = await fetchTokenToUSDPrice(network);
		if (price !== 'N/A') {
			dispatch(setCurrentTokenPrice(price));
		}
	};
	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});
		getCurrentTokenPrice();
		if (!currentTokenPrice || !currentTokenPrice.length) return;
		setLoadingStatus({ isLoading: false, message: 'Awaiting for network' });

		setDollarToTokenBalance({
			fifteenDollar: handleTipChangeToDollar(15),
			fiveDollar: handleTipChangeToDollar(5),
			tenDollar: handleTipChangeToDollar(10),
			threeDollar: handleTipChangeToDollar(3)
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentTokenPrice, currentTokenPrice.length, network, api, apiReady]);

	const handleCancel = (e?: any) => {
		e?.preventDefault();
		e?.stopPropagation();
		setTipAmount(ZERO_BN);
		setBeneficiaryAddress('');
		setUserAddresses([]);
		setRemark('');
		form.setFieldValue('balance', '');
		setLoadingStatus({ isLoading: false, message: '' });
		setOpen(false);
		dispatch(setReceiver(''));
	};

	useEffect(() => {
		setIsBalanceUpdated(false);
		if (!api || !apiReady) return;

		const deposit = api?.consts?.balances?.existentialDeposit;
		setExistentialDeposit(deposit);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loginWallet, loginAddress, api, apiReady]);

	const handleOnBalanceChange = (balanceStr: string, available: boolean) => {
		let balance = ZERO_BN;

		try {
			balance = new BN(balanceStr);
		} catch (err) {
			console.log(err);
		}

		if (available) {
			setAvailableBalance(balance);
		} else {
			setTipAmount(balance);
		}
	};
	const handleSetTip = async (txHash: any) => {
		const { error } = await nextApiClientFetch<MessageType>('/api/v1/Tipping', {
			amount: Number(tipInput) || 0,
			remark: `${remark}${remark.length ? (remark[remark.length - 1] !== '.' ? '.' : '') : ''} Tipped via Polkassembly`.trim(),
			tipFrom: address,
			tipTo: beneficiaryAddress || receiverAddress,
			txHash
		});
		if (error) {
			console.log(error);
		}
	};

	const onSuccess = async (txHash: any) => {
		await handleSetTip(txHash);
		queueNotification({
			header: 'Success!',
			message: `You have successfully tipped to ${username.length > 10 ? `${username.slice(0, 10)}...` : username}`,
			status: NotificationStatus.SUCCESS
		});
		setIsBalanceUpdated(true);
		setOpen(false);
		setLoadingStatus({ isLoading: false, message: '' });
		handleCancel();
	};
	const onFailed = async (message: string) => {
		queueNotification({
			header: 'Failed!',
			message,
			status: NotificationStatus.ERROR
		});

		setLoadingStatus({ isLoading: false, message: '' });
	};

	const handleTip = async () => {
		if (!api || !apiReady || disable || !(beneficiaryAddress || receiverAddress)) return;
		const destinationSubtrateAddress = getSubstrateAddress(beneficiaryAddress || receiverAddress) || beneficiaryAddress || receiverAddress;
		const tipTx = api.tx.balances?.transferKeepAlive(destinationSubtrateAddress, tipAmount as any);
		const remarkTx = api.tx.system.remarkWithEvent(`${remark}${remark.length ? (remark[remark.length - 1] !== '.' ? '.' : '') : ''} Tipped via Polkassembly`.trim().trim());
		setLoadingStatus({ isLoading: true, message: 'Awaiting Confirmation' });
		const tx = api.tx.utility.batchAll([tipTx, remarkTx]);

		await executeTx({
			address,
			api,
			apiReady,
			errorMessageFallback: 'Tipping Failed!',
			network,
			onFailed,
			onSuccess: (hash) => onSuccess(hash),
			setStatus: (status: string) => setLoadingStatus({ isLoading: true, message: status }),
			tx
		});
	};

	const handleConfirm = (address: string) => {
		setAddress(address);
		setOpen(true);
	};

	return (
		<div
			onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
			}}
		>
			<Modal
				title={
					<div className='-mx-6 mb-6 flex items-center border-0 border-b-[1px] border-solid border-[#D2D8E0] px-6 pb-4 text-[20px] font-semibold text-bodyBlue dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-blue-dark-medium'>
						<TipIcon className='mr-[6px]' />
						Give a Tip
					</div>
				}
				open={open}
				zIndex={1056}
				onCancel={handleCancel}
				closeIcon={<CloseIcon />}
				className={`${poppins.className} ${poppins.variable} w-[604px] max-sm:w-full ${className}`}
				footer={
					<div className='-mx-6 flex items-center justify-end gap-1 border-0 border-t-[1px] border-solid border-[#D2D8E0] px-6 pt-4 text-sm dark:border-[#3B444F]'>
						<Button
							key='back'
							className='h-[40px] w-[134px] rounded-[4px] border-pink_primary font-semibold tracking-wide text-pink_primary dark:bg-transparent'
							onClick={handleCancel}
							disabled={loadingStatus.isLoading}
						>
							Go Back
						</Button>
						<Button
							disabled={disable}
							htmlType='submit'
							key='submit'
							onClick={handleTip}
							className={`h-[40px] w-[134px] rounded-[4px] border-pink_primary bg-pink_primary font-semibold tracking-wide text-white hover:bg-pink_secondary ${
								disable && 'opacity-50'
							}`}
						>
							Tip
						</Button>
					</div>
				}
			>
				<Spin
					spinning={loadingStatus.isLoading}
					tip={loadingStatus.message}
				>
					{!tipAmount.eq(ZERO_BN) && availableBalance.lte(tipAmount.add(existentialDeposit)) ? (
						<Alert
							className='mt-6 rounded-[4px] text-bodyBlue dark:border-[#FF3C5F] dark:bg-[rgba(255_60_95_0.2)]'
							showIcon
							type='error'
							message={<span className='dark:text-blue-dark-high'>Insufficient Balance for Tipping</span>}
						/>
					) : null}
					<div className='mt-6 flex items-center justify-between text-lightBlue dark:text-blue-dark-medium'>
						<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>Your Address</label>
						{address && (
							<Balance
								isBalanceUpdated={isBalanceUpdated}
								address={address}
								onChange={(balance) => handleOnBalanceChange(balance, true)}
							/>
						)}
					</div>
					<div className='flex w-full items-end gap-2 text-sm '>
						<div className='flex h-10 w-full items-center justify-between rounded-[4px] border-[1px] border-solid border-[#D2D8E0] bg-[#f5f5f5] px-2 dark:border-[#3B444F] dark:bg-transparent'>
							<Address
								address={address || loginAddress}
								isTruncateUsername={false}
								displayInline
								disableTooltip
							/>
							<Button
								onClick={() => {
									setOpenAddressChangeModal(true);
									setOpen(false);
								}}
								className='flex h-[26px] w-[70px] items-center justify-center rounded-[4px] border-none bg-pink_primary text-xs text-white'
							>
								Change
							</Button>
						</div>
					</div>

					{filterDuplicateAddresses(userAddresses.concat(kiltAccounts)).length > 1 && (
						<div className='mt-6 '>
							<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>Receiver Address</label>
							<Select
								placeholder='Select recriver address'
								suffixIcon={<DownArrow />}
								className={`flex h-full w-full items-center justify-center rounded-[4px] ${poppins.className} ${poppins.variable} dark:bg-section-dark-overlay ${className}`}
								value={filterDuplicateAddresses(userAddresses.concat(kiltAccounts)).length > 0 ? beneficiaryAddress || receiverAddress : null}
								onChange={setBeneficiaryAddress}
								options={
									filterDuplicateAddresses(userAddresses.concat(kiltAccounts))?.map((userAddress) => {
										return {
											label: (
												<Address
													address={userAddress}
													key={userAddress}
													disableTooltip
													disableAddressClick
													showKiltAddress
													displayInline={network !== 'kilt'}
												/>
											),
											value: userAddress
										};
									}) || []
								}
								popupClassName={`${poppins.className} ${poppins.variable} z-[2000] dark:bg-section-dark-overlay dark:[&>.ant-select-item-option-content]:text-blue-dark-high`}
							/>
						</div>
					)}
					<div
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
						}}
					>
						<Form
							form={form}
							disabled={loadingStatus.isLoading || !network}
						>
							<div className='mt-0 border-0 pt-6'>
								<span className='text-[15px] font-medium tracking-wide text-bodyBlue dark:text-blue-dark-medium'>
									Please select a tip you would like to give to {username.length > 20 ? `${username.slice(0, 20)}...` : username} :
								</span>
								<div className='mt-3 flex items-center justify-between text-sm font-medium text-bodyBlue dark:text-blue-dark-medium'>
									{TIPS.map((tip) => {
										const [tipBlance] = inputToBn(String(Number(dollarToTokenBalance[tip.key]).toFixed(2)), network, false);
										return (
											<span
												className={`flex h-[36px] w-[102px] cursor-pointer items-center justify-center gap-1 rounded-[28px] border-[1px] border-solid ${
													tipBlance.eq(tipAmount) ? 'border-pink_primary bg-[#FAE7EF]' : 'border-[#D2D8E0] dark:border-[#3B444F]'
												}`}
												key={tip.key}
												onClick={() => {
													form.setFieldValue('balance', '');
													setTipAmount(tipBlance);
													setTipInput(String(Number(dollarToTokenBalance[tip.key]).toFixed(2)));
													form.setFieldValue('balance', Number(dollarToTokenBalance[tip.key]).toFixed(2));
												}}
											>
												{tip.value === 3 && <Tip1Icon />}
												{tip.value === 5 && <Tip2Icon />}
												{tip.value === 10 && <Tip3Icon />}
												{tip.value === 15 && <Tip4Icon />}
												<span>${tip.value}</span>
											</span>
										);
									})}
								</div>
								<BalanceInput
									setInputValue={setTipInput}
									label='Or enter the custom amount you would like to Tip'
									placeholder='Enter Amount'
									address={address}
									onAccountBalanceChange={(balance) => handleOnBalanceChange(balance, false)}
									onChange={(tip) => setTipAmount(tip)}
									isBalanceUpdated={open}
									className='mt-6'
									noRules
									theme={theme}
								/>
								{!!form.getFieldValue('balance')?.length &&
								(isNaN(Number(form.getFieldValue('balance'))) ||
									(Number(form.getFieldValue('balance')) > 0 &&
										!!form.getFieldValue('balance')?.split('.')?.[1]?.length &&
										chainProperties[network]?.tokenDecimals < (form.getFieldValue('balance')?.split('.')?.[1].length || 0)) ||
									(!!form.getFieldValue('balance').length && Number(form.getFieldValue('balance')) <= 0)) ? (
									<span className='mt-[-24px] text-sm text-red-500'>Invalid Balance</span>
								) : null}

								{!tipAmount.eq(ZERO_BN) && availableBalance.gt(tipAmount.add(existentialDeposit)) && (
									<div className='mt-12'>
										<Input
											name='remark'
											value={remark}
											onChange={(e) => setRemark(e.target.value)}
											className='ml-4 h-[40px] w-[524px] rounded-[4px] max-sm:w-full'
											placeholder='Say something nice with your tip(optional)'
										/>
										<SaySomethingIcon className='-ml-2.5 mt-[-68.8px]' />
									</div>
								)}
							</div>
						</Form>
						{!!existentialDeposit && (
							<div className='mt-4 flex items-center gap-4 text-sm'>
								<span className='font-medium tracking-wide text-lightBlue dark:text-blue-dark-medium'>
									Existential Deposit
									<HelperTooltip
										className='ml-1'
										text='Minimum balance to keep address live'
									/>
								</span>
								<span className='rounded-2xl bg-[#EDEFF3] px-3 py-1 font-medium text-bodyBlue dark:text-blue-dark-medium'>
									{formatedBalance(existentialDeposit.toString(), unit, 2)} {unit}
								</span>
							</div>
						)}
					</div>
				</Spin>
			</Modal>
			<AddressConnectModal
				open={openAddressChangeModal}
				onConfirm={handleConfirm}
				setOpen={setOpenAddressChangeModal}
				walletAlertTitle='Please install a web3 wallet to access Tipping'
				isBalanceUpdated={isBalanceUpdated}
			/>
		</div>
	);
};

export default styled(Tipping)`
	input::placeholder {
		font-weight: 400 !important;
		font-size: 14px !important;
		line-height: 21px !important;
		letter-spacing: 0.0025em !important;
	}
	.ant-form-item {
		margin-bottom: 0px !important;
	}
	.ant-select .ant-select-selector {
		height: 40px !important;
		display: flex;
		align-items: center;
		color: var(--bodyBlue) !important;
		border-radius: 4px !important;
	}
	.ant-select .ant-select-selector .ant-select-selection-item {
		display: flex;
		align-items: center;
		color: var(--bodyBlue);
		font-size: 14px;
	}
	.ant-select .ant-select-selection-placeholder {
		font-weight: 400;
		color: #7c899b;
	}
`;
