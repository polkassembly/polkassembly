// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { isWeb3Injected } from '@polkadot/extension-dapp';
import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { Alert, Button, Form, Modal, Spin } from 'antd';
import BN from 'bn.js';
import { useRouter } from 'next/router';
import { poppins } from 'pages/_app';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import CautionIcon from '~assets/icons/grey-caution.svg';
import { useApiContext, usePostDataContext } from '~src/context';
import { APPNAME } from '~src/global/appName';
import { NotificationStatus, Wallet } from '~src/types';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { LoadingOutlined } from '@ant-design/icons';
import queueNotification from '~src/ui-components/QueueNotification';
import WalletButton from '../WalletButton';
import AccountSelectionForm from '~src/ui-components/AccountSelectionForm';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import { WalletIcon } from '../Login/MetamaskLogin';
import { chainProperties } from '~src/global/networkConstants';
import { formatedBalance } from '~src/util/formatedBalance';
import { formatBalance } from '@polkadot/util';
import executeTx from '~src/util/executeTx';
import GovSidebarCard from '~src/ui-components/GovSidebarCard';
import { gov2ReferendumStatus } from '~src/global/statuses';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { getTrackData } from '../Listing/Tracks/AboutTrackCard';
import { CloseIcon } from '~src/ui-components/CustomIcons';

const ZERO_BN = new BN(0);

interface Props {
	className?: string;
	trackName: string;
}

const DecisionDepositCard = ({ className, trackName }: Props) => {
	const [openModal, setOpenModal] = useState<boolean>(false);
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const router = useRouter();
	const { loginWallet, loginAddress } = useUserDetailsSelector();
	const [address, setAddress] = useState<string>('');
	const [form] = Form.useForm();
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [availableWallets, setAvailableWallets] = useState<any>({});
	const [wallet, setWallet] = useState<Wallet>();
	const [extensionOpen, setExtensionOpen] = useState<boolean>(false);
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);
	const unit = chainProperties[network]?.tokenSymbol;
	const [amount, setAmount] = useState<BN>(ZERO_BN);
	const [balance, setBalance] = useState<BN>(ZERO_BN);
	const [isMetamaskWallet, setIsMetamaskWallet] = useState<boolean>(false);
	const { setPostData } = usePostDataContext();

	useEffect(() => {
		const trackData = getTrackData(network, trackName);
		const decisionDeposit = trackData.decisionDeposit.toString();
		setBalance(new BN(decisionDeposit.startsWith('0x') ? new BN(`${decisionDeposit}`.slice(2), 'hex') : decisionDeposit));
	}, [network, trackName]);

	const handleOnBalanceChange = (balanceStr: string) => {
		setAvailableBalance(new BN(balanceStr.toString() || ZERO_BN));
	};

	const getAvailableWallets = () => {
		const injectedWindow = window as Window & InjectedWindow;
		setAvailableWallets(injectedWindow.injectedWeb3);
		setIsMetamaskWallet((injectedWindow as any)?.ethereum?.isMetaMask);
	};

	const getMetamaskAccounts = async (): Promise<InjectedAccount[]> => {
		const ethereum = (window as any).ethereum;
		if (!ethereum) return [];

		let addresses = await ethereum.request({ method: 'eth_requestAccounts' });
		addresses = addresses.map((address: string) => address);

		if (addresses.length > 0) {
			addresses = addresses.map((address: string): InjectedAccount => {
				return {
					address: address.toLowerCase(),
					genesisHash: null,
					name: 'metamask',
					type: 'ethereum'
				};
			});
		}

		return addresses as InjectedAccount[];
	};
	const getAccounts = async (chosenWallet: Wallet, defaultWalletAddress?: string | null): Promise<undefined> => {
		if (!api || !apiReady) return;
		setLoading(true);

		setExtensionOpen(false);

		if (chosenWallet === Wallet.METAMASK) {
			const accounts = await getMetamaskAccounts();
			setAccounts(accounts);
			setAddress(accounts?.[0]?.address || '');
			if (defaultWalletAddress) {
				setAddress(accounts?.filter((account) => account?.address === defaultWalletAddress)?.[0]?.address || '');
			}
		} else {
			const injectedWindow = window as Window & InjectedWindow;

			const wallet = isWeb3Injected ? injectedWindow?.injectedWeb3?.[chosenWallet] : null;

			if (!wallet) {
				setExtensionOpen(true);
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

			const accounts = await injected.accounts.get();
			if (accounts.length === 0) {
				return;
			}

			accounts.forEach((account) => {
				account.address = getEncodedAddress(account.address, network) || account.address;
			});

			setAccounts(accounts);
			if (accounts.length > 0) {
				if (api && apiReady) {
					api.setSigner(injected.signer);
				}

				setAddress(accounts[0].address);
				if (defaultWalletAddress) {
					setAddress(accounts.filter((account) => account.address === (getEncodedAddress(defaultWalletAddress, network) || defaultWalletAddress))[0].address);
				}
			}
		}
		setLoading(false);
		return;
	};

	const handleWalletClick = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, wallet: Wallet) => {
		setAccounts([]);
		setAddress('');
		event.preventDefault();
		setWallet(wallet);
		await getAccounts(wallet);
	};

	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});

		getAvailableWallets();

		const wallet = localStorage.getItem('loginWallet') || '';
		const address = localStorage.getItem('loginAddress');
		setWallet((loginWallet || wallet) as Wallet);
		getAccounts((loginWallet || wallet) as Wallet, loginAddress || address);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loginWallet, network]);

	const handleSubmit = async () => {
		const bnValue: BN = new BN(balance.toString() || ZERO_BN);
		setAmount(bnValue);
		if (!api || !apiReady || !router?.query?.id || availableBalance.lte(bnValue)) return;

		const tx = api.tx.referenda.placeDecisionDeposit(Number(router?.query?.id));

		const onSuccess = () => {
			queueNotification({
				header: 'Success!',
				message: 'Decision Deposit successful.',
				status: NotificationStatus.SUCCESS
			});
			setPostData((prev: any) => {
				return {
					...prev,
					status: gov2ReferendumStatus.DECISION_DEPOSIT_PLACED,
					statusHistory: [...(prev?.statusHistory || []), { status: gov2ReferendumStatus.DECISION_DEPOSIT_PLACED }]
				};
			});
			setLoading(false);
			setOpenModal(false);
		};

		const onFailed = () => {
			queueNotification({
				header: 'Failed!',
				message: 'Transaction failed!',
				status: NotificationStatus.ERROR
			});
			setLoading(false);
		};

		setLoading(true);
		await executeTx({ address, api, apiReady, errorMessageFallback: 'failed.', network, onFailed, onSuccess, tx });
	};
	return (
		<GovSidebarCard className='overflow-y-hidden'>
			<h2 className='text-xl font-medium tracking-[0.015em] dark:text-blue-dark-high'>Decision Deposit</h2>
			<div className='mt-6 flex gap-2'>
				<span>
					<CautionIcon />
				</span>
				<span className='text-sm tracking-wide dark:text-blue-dark-high'>
					This should be paid before completion of the decision period for a proposal to pass. It can be paid by anyone.
				</span>
			</div>
			<Button
				onClick={() => setOpenModal(true)}
				className='mt-4 h-[40px] w-full rounded-[4px] bg-pink_primary text-sm font-medium tracking-wide text-white dark:border-none dark:text-blue-dark-high'
			>
				Pay Decision Deposit
			</Button>
			<Modal
				wrapClassName={`${className} dark:bg-modalOverlayDark`}
				className={`${poppins.className} ${poppins.variable} pay-decision-deposite dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
				open={openModal}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
				onCancel={() => setOpenModal(false)}
				title={
					<div className='items-center gap-2 border-0 border-b-[1px] border-solid border-[#D2D8E0] px-6 pb-4 text-lg font-semibold text-bodyBlue dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-blue-dark-high'>
						Pay Decision Deposit
					</div>
				}
				footer={
					<div className='border-0 border-t-[1px] border-solid border-[#D2D8E0] px-6 pt-4 dark:border-[#3B444F]'>
						<Button
							onClick={() => setOpenModal(false)}
							className='h-[40px] w-[134px] rounded-[4px] border border-solid border-pink_primary text-sm  font-medium tracking-wider text-pink_primary dark:bg-transparent'
						>
							Back
						</Button>
						<Button
							onClick={handleSubmit}
							disabled={!accounts.length || availableBalance.lte(amount)}
							className={`h-[40px] w-[134px] rounded-[4px] bg-pink_primary text-sm font-medium tracking-wider text-white ${
								!accounts.length || (availableBalance.lte(amount) && 'opacity-50')
							} dark:border-none dark:text-blue-dark-high`}
						>
							Continue
						</Button>
					</div>
				}
			>
				<Spin
					spinning={loading}
					indicator={<LoadingOutlined />}
				>
					<div className='flex flex-col px-6'>
						<h3 className='text-center text-sm font-normal text-[#485F7D] dark:text-blue-dark-medium'>Select a wallet</h3>
						<div className='mb-6 flex items-center justify-center gap-x-4'>
							{['moonbase', 'moonbeam', 'moonriver'].includes(network) ? (
								<>
									{availableWallets[Wallet.TALISMAN] && (
										<WalletButton
											className={`${wallet === Wallet.TALISMAN ? 'h-[44px] w-[56px] border border-solid border-pink_primary' : 'h-[44px] w-[56px]'}`}
											disabled={!apiReady}
											onClick={(event) => handleWalletClick(event as any, Wallet.TALISMAN)}
											name='Talisman'
											icon={
												<WalletIcon
													which={Wallet.TALISMAN}
													className='h-6 w-6'
												/>
											}
										/>
									)}
									{['moonbase', 'moonbeam', 'moonriver'].includes(network) && isMetamaskWallet && (
										<WalletButton
											disabled={!apiReady}
											className={`${wallet === Wallet.METAMASK ? 'h-[44px] w-[56px] border border-solid border-pink_primary' : 'h-[44px] w-[56px]'}`}
											onClick={(event) => handleWalletClick(event as any, Wallet.METAMASK)}
											name='MetaMask'
											icon={
												<WalletIcon
													which={Wallet.METAMASK}
													className='h-6 w-6'
												/>
											}
										/>
									)}
									{(window as any).walletExtension?.isNovaWallet && availableWallets[Wallet.NOVAWALLET] && (
										<WalletButton
											disabled={!apiReady}
											className={`${wallet === Wallet.NOVAWALLET ? 'h-[44px] w-[56px] border border-solid border-pink_primary' : 'h-[44px] w-[56px]'}`}
											onClick={(event) => handleWalletClick(event as any, Wallet.NOVAWALLET)}
											name='Nova Wallet'
											icon={
												<WalletIcon
													which={Wallet.NOVAWALLET}
													className='h-6 w-6'
												/>
											}
										/>
									)}
								</>
							) : (
								<>
									{availableWallets[Wallet.POLKADOT] && (
										<WalletButton
											className={`${wallet === Wallet.POLKADOT ? 'h-[44px] w-[56px] border border-solid border-pink_primary' : 'h-[44px] w-[56px]'}`}
											disabled={!apiReady}
											onClick={(event) => handleWalletClick(event as any, Wallet.POLKADOT)}
											name='Polkadot'
											icon={
												<WalletIcon
													which={Wallet.POLKADOT}
													className='h-6 w-6'
												/>
											}
										/>
									)}
									{availableWallets[Wallet.TALISMAN] && (
										<WalletButton
											className={`${wallet === Wallet.TALISMAN ? 'h-[44px] w-[56px] border border-solid border-pink_primary' : 'h-[44px] w-[56px]'}`}
											disabled={!apiReady}
											onClick={(event) => handleWalletClick(event as any, Wallet.TALISMAN)}
											name='Talisman'
											icon={
												<WalletIcon
													which={Wallet.TALISMAN}
													className='h-6 w-6'
												/>
											}
										/>
									)}
									{availableWallets[Wallet.SUBWALLET] && (
										<WalletButton
											className={`${wallet === Wallet.SUBWALLET ? 'h-[44px] w-[56px] border border-solid border-pink_primary' : 'h-[44px] w-[56px]'}`}
											disabled={!apiReady}
											onClick={(event) => handleWalletClick(event as any, Wallet.SUBWALLET)}
											name='Subwallet'
											icon={
												<WalletIcon
													which={Wallet.SUBWALLET}
													className='h-6 w-6'
												/>
											}
										/>
									)}
									{availableWallets[Wallet.POLKAGATE] && (
										<WalletButton
											className={`${wallet === Wallet.POLKAGATE ? 'h-[44px] w-[56px] border border-solid border-pink_primary' : 'h-[44px] w-[56px]'}`}
											disabled={!apiReady}
											onClick={(event) => handleWalletClick(event as any, Wallet.POLKAGATE)}
											name='PolkaGate'
											icon={
												<WalletIcon
													which={Wallet.POLKAGATE}
													className='h-6 w-6'
												/>
											}
										/>
									)}
									{['polymesh'].includes(network) && availableWallets[Wallet.POLYWALLET] && (
										<WalletButton
											disabled={!apiReady}
											className={`${wallet === Wallet.POLYWALLET ? 'h-[44px] w-[56px] border border-solid border-pink_primary' : 'h-[44px] w-[56px]'}`}
											onClick={(event) => handleWalletClick(event as any, Wallet.POLYWALLET)}
											name='PolyWallet'
											icon={
												<WalletIcon
													which={Wallet.POLYWALLET}
													className='h-6 w-6'
												/>
											}
										/>
									)}
									{(window as any).walletExtension?.isNovaWallet && availableWallets[Wallet.NOVAWALLET] && (
										<WalletButton
											disabled={!apiReady}
											className={`${wallet === Wallet.NOVAWALLET ? 'h-[44px] w-[56px] border border-solid border-pink_primary' : 'h-[44px] w-[56px]'}`}
											onClick={(event) => handleWalletClick(event as any, Wallet.NOVAWALLET)}
											name='Nova Wallet'
											icon={
												<WalletIcon
													which={Wallet.NOVAWALLET}
													className='h-6 w-6'
												/>
											}
										/>
									)}
								</>
							)}
						</div>
						{availableBalance.lte(amount) && accounts.length > 0 && (
							<Alert
								showIcon
								type='error'
								className='mb-4 h-10 rounded-[4px] text-sm text-bodyBlue dark:text-blue-dark-high'
								message='Insufficient available balance.'
							/>
						)}

						{Object.keys(availableWallets || {}).length !== 0 && accounts.length === 0 && wallet && wallet?.length !== 0 && !loading && (
							<Alert
								message='For paying decision deposite:'
								description={
									<ul className='mt-[-5px] text-sm'>
										<li>Give access to Polkassembly on your selected wallet.</li>
										<li>Add an address to the selected wallet.</li>
									</ul>
								}
								showIcon
								className='mb-4'
								type='info'
							/>
						)}
						{Object.keys(availableWallets || {}).length === 0 && !loading && (
							<Alert
								message='Wallet extension not detected.'
								description='No web 3 account integration could be found. To be able to use this feature, visit this page on a computer with polkadot-js extension.'
								type='info'
								showIcon
								className='changeColor text-blue-light-high dark:bg-[var(--inactiveIconDark)] dark:text-white'
							/>
						)}

						{!extensionOpen && (
							<Form
								form={form}
								disabled={loading}
							>
								<>
									{accounts.length > 0 ? (
										<AccountSelectionForm
											isTruncateUsername={false}
											title='Beneficiary Address'
											accounts={accounts}
											address={address}
											withBalance={true}
											onAccountChange={(address) => setAddress(address)}
											onBalanceChange={handleOnBalanceChange}
											className='text-sm text-[#485F7D] dark:text-blue-dark-medium'
										/>
									) : !wallet && Object.keys(availableWallets || {}).length !== 0 ? (
										<Alert
											type='info'
											showIcon
											message='Please select a wallet.'
										/>
									) : null}

									<div className='mb-4 mt-6 flex items-center gap-4'>
										<span className='flex gap-1.5 text-sm tracking-wide text-lightBlue dark:text-blue-dark-medium'>
											Decision Deposit
											<HelperTooltip text='Decision deposit should be paid before completion of the decision period for a proposal to pass. It can be paid by anyone.' />
										</span>
										<span className='rounded-[16px] bg-[#EDEFF3] px-3 py-0.5 text-sm font-semibold tracking-wide text-bodyBlue dark:bg-section-dark-background dark:text-blue-dark-high'>
											{formatedBalance(balance.toString(), unit)} {unit}
										</span>
									</div>
								</>
							</Form>
						)}
					</div>
				</Spin>
			</Modal>
		</GovSidebarCard>
	);
};

export default styled(DecisionDepositCard)`
	.pay-decision-deposite .ant-modal-content {
		padding: 16px 0px !important;
	}
`;
