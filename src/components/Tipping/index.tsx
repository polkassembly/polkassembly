// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, Input, Modal, Spin } from 'antd';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useApiContext } from '~src/context';
import { LoadingStatusType, NotificationStatus, Wallet } from '~src/types';

import CloseIcon from '~assets/icons/close.svg';
import TipIcon from '~assets/icons/tip-title.svg';
import getAccountsFromWallet from '~src/util/getAccountsFromWallet';
import { InjectedTypeWithCouncilBoolean } from '~src/ui-components/AddressDropdown';
import { InjectedWindow } from '@polkadot/extension-inject/types';
import AvailableWallets from '~src/ui-components/AvailableWallet';
import AccountSelectionForm from '~src/ui-components/AccountSelectionForm';
import BN from 'bn.js';
import { poppins } from 'pages/_app';
import BalanceInput from '~src/ui-components/BalanceInput';

import Tip1Icon from '~assets/icons/tip-1.svg';
import Tip2Icon from '~assets/icons/tip-2.svg';
import Tip3Icon from '~assets/icons/tip-3.svg';
import Tip4Icon from '~assets/icons/tip-4.svg';
import SaySomethingIcon from '~assets/icons/say-something.svg';

import styled from 'styled-components';
import queueNotification from '~src/ui-components/QueueNotification';
import executeTx from '~src/util/executeTx';
import { inputToBn } from '~src/util/inputToBn';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { MessageType } from '~src/auth/types';
import getSubstrateAddress from '~src/util/getSubstrateAddress';

const ZERO_BN = new BN(0);
const ONE_DOLLAR_IN_DOT = '0.230658';

interface Props {
	open: boolean;
	setOpen: (pre: boolean) => void;
	className?: string;
	destinationAddress: string;
	username: string;
}

const TIPS = [3, 5, 10, 15];

const Tipping = ({ className, destinationAddress, open, setOpen, username }: Props) => {
	const { network } = useNetworkSelector();
	const { loginWallet, loginAddress } = useUserDetailsSelector();
	const { api, apiReady } = useApiContext();
	const [form] = Form.useForm();
	const [wallet, setWallet] = useState<Wallet>(loginWallet as Wallet);
	const [address, setAddress] = useState<string>('');
	const [availableWallets, setAvailableWallets] = useState<any>({});
	const [accounts, setAccounts] = useState<InjectedTypeWithCouncilBoolean[]>([]);
	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: false, message: '' });
	const [isMetamaskWallet, setIsMetamaskWallet] = useState<boolean>(false);
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);
	const [tipAmount, setTipAmount] = useState<BN>(ZERO_BN);
	const disable = loadingStatus.isLoading || availableBalance.lte(tipAmount) || !address || tipAmount.eq(ZERO_BN);
	const [remark, setRemark] = useState<string>('');

	const handleCancel = (e: any) => {
		e.preventDefault();
		e.stopPropagation();
		setTipAmount(ZERO_BN);
		setRemark('');
		form.setFieldValue('balance', '');
		setLoadingStatus({ isLoading: false, message: '' });
		setOpen(false);
	};

	const getWallet = () => {
		const injectedWindow = window as Window & InjectedWindow;
		setAvailableWallets(injectedWindow.injectedWeb3);
		setIsMetamaskWallet((injectedWindow as any)?.ethereum?.isMetaMask);
	};

	useEffect(() => {
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
	const handleTipChangeToDollar = (value: number) => {
		const bnValue = new BN(value);
		const [balance] = inputToBn(`${ONE_DOLLAR_IN_DOT}`, network, false);
		const tip = balance.mul(bnValue);
		return tip;
	};
	const handleSetTip = async () => {
		const { data, error } = await nextApiClientFetch<MessageType>('api/v1/Tipping', {
			amount: Number(tipAmount.toString()) || 0,
			remark: `${remark} tipped via Polkassembly`.trim(),
			tipFrom: address,
			tipTo: destinationAddress
		});
		if (data) {
			console.log(data.message);
		} else {
			console.log(error);
		}
	};

	const onSuccess = async () => {
		queueNotification({
			header: 'Success!',
			message: `You have successfully tipped to ${username.length > 10 ? `${username.slice(0, 10)}...` : username}`,
			status: NotificationStatus.SUCCESS
		});
		await handleSetTip();
		setOpen(false);
		setLoadingStatus({ isLoading: false, message: '' });
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
		const remarkTx = api.tx.system.remarkWithEvent(`${remark} tipped via Polkassembly`.trim());
		setLoadingStatus({ isLoading: true, message: 'Awaiting Confirmation' });
		const tx = api.tx.utility.batchAll([tipTx, remarkTx]);

		await executeTx({
			address,
			api,
			apiReady,
			errorMessageFallback: 'Tipping Failed!',
			network,
			onFailed,
			onSuccess,
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
								isMetamaskWallet={isMetamaskWallet}
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
						{!tipAmount.eq(ZERO_BN) && availableBalance.lte(tipAmount) && (
							<Alert
								className='mt-6 rounded-[4px] text-bodyBlue'
								showIcon
								type='error'
								message='Insufficient Balance for Tip'
							/>
						)}
						<Form
							form={form}
							disabled={loadingStatus.isLoading}
						>
							{accounts.length > 0 ? (
								<AccountSelectionForm
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
									{TIPS.map((tip) => (
										<span
											className={`flex h-[36px] w-[102px] cursor-pointer items-center justify-center gap-1 rounded-[28px] border-[1px] border-solid ${
												handleTipChangeToDollar(tip).eq(tipAmount) ? 'border-pink_primary bg-[#FAE7EF]' : 'border-[#D2D8E0]'
											}`}
											key={tip}
											onClick={() => {
												const tipBlance = handleTipChangeToDollar(tip);
												setTipAmount(tipBlance);
												form.setFieldValue('balance', tipBlance);
											}}
										>
											{tip === 3 && <Tip1Icon />}
											{tip === 5 && <Tip2Icon />}
											{tip === 10 && <Tip3Icon />}
											{tip === 15 && <Tip4Icon />}
											<span>${tip}</span>
										</span>
									))}
								</div>
								<BalanceInput
									label='Or enter the custom amount you would like to Tip'
									placeholder='Enter Amount'
									address={address}
									onAccountBalanceChange={(balance) => handleOnBalanceChange(balance, false)}
									onChange={(tip) => setTipAmount(tip)}
									className='mt-6'
								/>
								{!tipAmount.eq(ZERO_BN) && availableBalance.gt(tipAmount) && (
									<div className='mt-6'>
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
`;
