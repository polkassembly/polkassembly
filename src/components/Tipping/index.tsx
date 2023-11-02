// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, Input, Modal, Spin } from 'antd';
import { useCurrentTokenDataSelector, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useApiContext } from '~src/context';
import { LoadingStatusType, NotificationStatus, Wallet } from '~src/types';
import getAccountsFromWallet from '~src/util/getAccountsFromWallet';
import { InjectedTypeWithCouncilBoolean } from '~src/ui-components/AddressDropdown';
import { InjectedWindow } from '@polkadot/extension-inject/types';
import AvailableWallets from '~src/ui-components/AvailableWallet';
import AccountSelectionForm from '~src/ui-components/AccountSelectionForm';
import BN from 'bn.js';
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

const ZERO_BN = new BN(0);

interface Props {
	open: boolean;
	setOpen: (pre: boolean) => void;
	className?: string;
	destinationAddress: string;
	username: string;
}

const TIPS: { key: 'threeDollar' | 'fiveDollar' | 'tenDollar' | 'fifteenDollar'; value: number }[] = [
	{ key: 'threeDollar', value: 3 },
	{ key: 'fiveDollar', value: 5 },
	{ key: 'tenDollar', value: 10 },
	{ key: 'fifteenDollar', value: 15 }
];

const Tipping = ({ className, destinationAddress, open, setOpen, username }: Props) => {
	const { network } = useNetworkSelector();
	const { loginWallet, loginAddress } = useUserDetailsSelector();
	const { currentTokenPrice } = useCurrentTokenDataSelector();
	const { api, apiReady } = useApiContext();
	const [form] = Form.useForm();
	const [wallet, setWallet] = useState<Wallet>(loginWallet as Wallet);
	const [address, setAddress] = useState<string>('');
	const [availableWallets, setAvailableWallets] = useState<any>({});
	const [accounts, setAccounts] = useState<InjectedTypeWithCouncilBoolean[]>([]);
	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: true, message: '' });
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);
	const [tipAmount, setTipAmount] = useState<BN>(ZERO_BN);
	const [tipInput, setTipInput] = useState<string>('0');
	const disable = loadingStatus.isLoading || availableBalance.lte(tipAmount) || !address || tipAmount.eq(ZERO_BN);
	const [remark, setRemark] = useState<string>('');
	const [existentialDeposit, setExistentialDeposi] = useState<BN>(ZERO_BN);
	const unit = chainProperties[network]?.tokenSymbol;
	const [isBalanceUpdated, setIsBalanceUpdated] = useState<boolean>(false);
	const dispatch = useDispatch();
	const [dollarToTokenBalance, setDollarToTokenBalance] = useState<{ threeDollar: string; fiveDollar: string; tenDollar: string; fifteenDollar: string }>({
		fifteenDollar: '0',
		fiveDollar: '0',
		tenDollar: '0',
		threeDollar: '0'
	});

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
		setRemark('');
		form.setFieldValue('balance', '');
		setLoadingStatus({ isLoading: false, message: '' });
		setOpen(false);
	};

	const getWallet = () => {
		const injectedWindow = window as Window & InjectedWindow;
		setAvailableWallets(injectedWindow.injectedWeb3);
	};

	useEffect(() => {
		setIsBalanceUpdated(false);
		getWallet();
		const wallet = localStorage.getItem('loginWallet') || '';
		const address = localStorage.getItem('loginAddress');
		setWallet((loginWallet || wallet) as Wallet);
		if (!api || !apiReady) return;
		(async () => {
			const accountData = await getAccountsFromWallet({
				api,
				apiReady,
				chosenAddress: (loginAddress || address) as string,
				chosenWallet: (loginWallet || wallet) as Wallet,
				loginAddress,
				network
			});
			setAccounts(accountData?.accounts || []);
			setAddress(accountData?.account || '');
		})();
		const deposit = api.consts.balances.existentialDeposit;
		setExistentialDeposi(deposit);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loginWallet, loginAddress, api, apiReady]);

	const handleWalletClick = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, wallet: Wallet) => {
		if (!api || !apiReady) return;
		setLoadingStatus({ isLoading: true, message: '' });
		localStorage.setItem('selectedWallet', wallet);
		setAccounts([]);
		setAddress('');
		event.preventDefault();
		setWallet(wallet);
		(async () => {
			const accountData = await getAccountsFromWallet({ api, apiReady, chosenWallet: wallet, loginAddress, network });
			setAccounts(accountData?.accounts || []);
			setAddress(accountData?.account || '');
			setLoadingStatus({ isLoading: false, message: '' });
		})();
	};

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
			tipTo: destinationAddress,
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
		if (!api || !apiReady || disable || !destinationAddress) return;
		const destinationSubtrateAddress = getSubstrateAddress(destinationAddress) || destinationAddress;
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
	return (
		<div
			onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
			}}
		>
			<Modal
				title={
					<div className='-mx-6 mb-6 flex items-center border-0 border-b-[1px] border-solid border-[#D2D8E0] px-6 pb-4 text-[20px] font-semibold text-bodyBlue'>
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
					<div className='-mx-6 flex items-center justify-end gap-1 border-0 border-t-[1px] border-solid border-[#D2D8E0] px-6 pt-4 text-sm'>
						<Button
							key='back'
							className='h-[40px] w-[134px] rounded-[4px] border-pink_primary font-semibold tracking-wide text-pink_primary'
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
					<div
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
						}}
					>
						<div className='flex flex-col items-center'>
							<h3 className='text-sm font-normal tracking-wide text-lightBlue'>Select a wallet</h3>
							<AvailableWallets
								className='flex items-center justify-center gap-x-4'
								handleWalletClick={handleWalletClick}
								availableWallets={availableWallets}
								isMetamaskWallet={false}
								wallet={wallet}
							/>
							{!!Object.keys(availableWallets || {})?.length && !accounts.length && !!wallet && !loadingStatus.isLoading && (
								<Alert
									message={'For using Tipping:'}
									description={
										<ul className='mt-[-5px] text-sm'>
											<li>Give access to Polkassembly on your selected wallet.</li>
											<li>Add an address to the selected wallet.</li>
										</ul>
									}
									showIcon
									className='mt-4 w-full'
									type='info'
								/>
							)}
							{Object.keys(availableWallets || {}).length === 0 && !loadingStatus.isLoading && (
								<Alert
									message={'Wallet extension not detected.'}
									description={`${'No web 3 account integration could be found. To be able to use this feature, visit this page on a computer with polkadot-js extension.'}`}
									type='info'
									showIcon
									className='changeColor text-md text-bodyBlue'
								/>
							)}
						</div>
						{!tipAmount.eq(ZERO_BN) && availableBalance.lte(tipAmount.add(existentialDeposit)) ? (
							<Alert
								className='mt-6 rounded-[4px] text-bodyBlue'
								showIcon
								type='error'
								message='Insufficient Balance for Tipping'
							/>
						) : null}
						<Form
							form={form}
							disabled={loadingStatus.isLoading || !network}
						>
							{accounts.length > 0 ? (
								<AccountSelectionForm
									isBalanceUpdated={isBalanceUpdated}
									isTruncateUsername={false}
									title='Tip with account'
									accounts={accounts}
									address={address}
									withBalance={true}
									onAccountChange={(address) => setAddress(address)}
									onBalanceChange={(balance) => handleOnBalanceChange(balance, true)}
									className='mt-6 text-sm text-lightBlue'
								/>
							) : !wallet && Object.keys(availableWallets || {}).length !== 0 ? (
								<Alert
									type='info'
									className='mt-4 rounded-[4px]'
									showIcon
									message='Please select a wallet.'
								/>
							) : null}
							<div className='mt-6 border-0 border-t-[1px] border-dashed border-[#D2D8E0] pt-6'>
								<span className='text-[15px] font-medium tracking-wide text-bodyBlue'>
									Please select a tip you would like to give to {username.length > 20 ? `${username.slice(0, 20)}...` : username} :
								</span>
								<div className='mt-3 flex items-center justify-between text-sm font-medium text-bodyBlue'>
									{TIPS.map((tip) => {
										const [tipBlance] = inputToBn(String(Number(dollarToTokenBalance[tip.key]).toFixed(2)), network, false);
										return (
											<span
												className={`flex h-[36px] w-[102px] cursor-pointer items-center justify-center gap-1 rounded-[28px] border-[1px] border-solid ${
													tipBlance.eq(tipAmount) ? 'border-pink_primary bg-[#FAE7EF]' : 'border-[#D2D8E0]'
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
								<span className='font-medium tracking-wide text-lightBlue'>
									Existential Deposit
									<HelperTooltip
										className='ml-1'
										text='Minimum balance to keep address live'
									/>
								</span>
								<span className='rounded-2xl bg-[#EDEFF3] px-3 py-1 font-medium text-bodyBlue'>
									{formatedBalance(existentialDeposit.toString(), unit, 2)} {unit}
								</span>
							</div>
						)}
					</div>
				</Spin>
			</Modal>
		</div>
	);
};

export default styled(Tipping)`
	input::placeholder {
		font-weight: 400 !important;
		font-size: 14px !important;
		line-height: 21px !important;
		letter-spacing: 0.0025em !important;
		color: rgba(87, 109, 139, 0.8) !important;
	}
	.ant-form-item {
		margin-bottom: 0px !important;
	}
`;
