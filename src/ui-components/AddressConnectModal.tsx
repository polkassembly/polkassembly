// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Alert, Button, Divider, Form, Modal, Spin } from 'antd';
import { poppins } from 'pages/_app';
import { EAddressOtherTextType, NotificationStatus, Wallet } from '~src/types';
import { ApiContext } from '~src/context/ApiContext';
import WalletButton from '~src/components/WalletButton';
import { LoadingOutlined } from '@ant-design/icons';
import { WalletIcon } from '~src/components/Login/MetamaskLogin';
import AccountSelectionForm from '~src/ui-components/AccountSelectionForm';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { inputToBn } from '~src/util/inputToBn';
import BN from 'bn.js';
import { APPNAME } from '~src/global/appName';
import styled from 'styled-components';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { InjectedTypeWithCouncilBoolean } from './AddressDropdown';
import ConnectAddressIcon from '~assets/icons/connect-address.svg';
import CloseIcon from '~assets/icons/close.svg';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import queueNotification from './QueueNotification';
import cleanError from '~src/util/cleanError';
import { ChallengeMessage, ChangeResponseType } from '~src/auth/types';
import { handleTokenChange } from '~src/services/auth.service';
import { stringToHex } from '@polkadot/util';
import { canUsePolkasafe } from '~src/util/canUsePolkasafe';
import MultisigAccountSelectionForm from '~src/ui-components/MultisigAccountSelectionForm';
import ArrowLeft from '~assets/icons/arrow-left.svg';
import formatBnBalance from '~src/util/formatBnBalance';
import getAccountsFromWallet from '~src/util/getAccountsFromWallet';
import { InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { setUserDetailsState } from '~src/redux/userDetails';
import { useDispatch } from 'react-redux';

interface Props {
	className?: string;
	open: boolean;
	setOpen: (pre: boolean) => void;
	closable?: boolean;
	localStorageWalletKeyName: string;
	localStorageAddressKeyName: string;
	onConfirm?: (pre?: any) => void;
	linkAddressNeeded?: boolean;
	usingMultisig?: boolean;
	walletAlertTitle: string;
	accountAlertTitle?: string;
	accountSelectionFormTitle?: string;
}

const ZERO_BN = new BN(0);

const AddressConnectModal = ({
	className,
	open,
	setOpen,
	closable,
	localStorageWalletKeyName,
	localStorageAddressKeyName,
	onConfirm,
	linkAddressNeeded = false,
	usingMultisig = false,
	walletAlertTitle,
	accountAlertTitle = 'Wallet extension not detected.',
	accountSelectionFormTitle = 'Select an address'
}: Props) => {
	const { network } = useNetworkSelector();
	const { api, apiReady } = useContext(ApiContext);
	const currentUser = useUserDetailsSelector();
	const { loginWallet, loginAddress, addresses } = currentUser;
	const dispatch = useDispatch();
	const [address, setAddress] = useState<string>('');
	const [form] = Form.useForm();
	const [accounts, setAccounts] = useState<InjectedTypeWithCouncilBoolean[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [availableWallets, setAvailableWallets] = useState<any>({});
	const [wallet, setWallet] = useState<Wallet>(loginWallet as Wallet);
	const [showMultisig, setShowMultisig] = useState<boolean>(false);
	const [multisig, setMultisig] = useState<string>('');
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);
	const [totalDeposit, setTotalDeposit] = useState<BN>(ZERO_BN);
	const [initiatorBalance, setInitiatorBalance] = useState<BN>(ZERO_BN);

	const substrate_address = getSubstrateAddress(loginAddress);
	const substrate_addresses = (addresses || []).map((address) => getSubstrateAddress(address));
	const [isMetamaskWallet, setIsMetamaskWallet] = useState<boolean>(false);
	const [multisigBalance, setMultisigBalance] = useState<BN>(ZERO_BN);

	const getAddressType = (account?: InjectedTypeWithCouncilBoolean) => {
		const account_substrate_address = getSubstrateAddress(account?.address || '');
		const isConnected = account_substrate_address?.toLowerCase() === (substrate_address || '').toLowerCase();
		if (account?.isCouncil || false) {
			if (isConnected) {
				return EAddressOtherTextType.COUNCIL_CONNECTED;
			}
			return EAddressOtherTextType.COUNCIL;
		} else if (isConnected && substrate_addresses.includes(account_substrate_address)) {
			return EAddressOtherTextType.LINKED_ADDRESS;
		} else if (substrate_addresses.includes(account_substrate_address)) {
			return EAddressOtherTextType.LINKED_ADDRESS;
		} else {
			return EAddressOtherTextType.UNLINKED_ADDRESS;
		}
	};

	const isUnlinkedAddress =
		getAddressType(accounts?.filter((account) => getSubstrateAddress(account.address) === getSubstrateAddress(address))?.[0]) === EAddressOtherTextType.UNLINKED_ADDRESS;

	const handleAddressLink = async (address: InjectedAccount['address'], chosenWallet: Wallet) => {
		setLoading(true);
		try {
			const injectedWindow = window as Window & InjectedWindow;
			const wallet = isWeb3Injected ? injectedWindow?.injectedWeb3?.[chosenWallet] : null;

			if (!wallet) return;

			const injected = wallet && wallet.enable && (await wallet.enable(APPNAME));

			const signRaw = injected && injected.signer && injected.signer.signRaw;
			if (!signRaw) return console.error('Signer not available');

			let substrate_address: string | null;
			if (!address.startsWith('0x')) {
				substrate_address = getSubstrateAddress(address);
				if (!substrate_address) {
					console.error('Invalid address');
					setLoading(false);
					return;
				}
			} else {
				substrate_address = address;
			}

			const { data, error } = await nextApiClientFetch<ChallengeMessage>('api/v1/auth/actions/addressLinkStart', { address: substrate_address });
			if (error || !data?.signMessage) {
				queueNotification({
					header: 'Failed!',
					message: cleanError(error || 'Something went wrong'),
					status: NotificationStatus.ERROR
				});
				setLoading(false);
				return;
			}

			let signature = '';

			if (substrate_address.startsWith('0x')) {
				const msg = stringToHex(data?.signMessage || '');
				const from = address;

				const params = [msg, from];
				const method = 'personal_sign';

				let sendAsyncQuery;
				if (isMetamaskWallet) {
					sendAsyncQuery = (window as any).ethereum;
				} else {
					sendAsyncQuery = (window as any).web3.currentProvider;
				}
				sendAsyncQuery.sendAsync(
					{
						from,
						method,
						params
					},
					async (err: any, result: any) => {
						if (result) {
							signature = result.result;
						}

						const { data: confirmData, error: confirmError } = await nextApiClientFetch<ChangeResponseType>('api/v1/auth/actions/addressLinkConfirm', {
							address: substrate_address,
							signature,
							wallet
						});

						if (confirmError) {
							console.error(confirmError);
							queueNotification({
								header: 'Failed!',
								message: cleanError(confirmError),
								status: NotificationStatus.ERROR
							});
							setLoading(false);
						}

						if (confirmData?.token) {
							handleTokenChange(confirmData.token, currentUser, dispatch);
							queueNotification({
								header: 'Success!',
								message: confirmData.message || '',
								status: NotificationStatus.SUCCESS
							});
							setLoading(false);
						}
					}
				);
			} else {
				if (signRaw) {
					const { signature: substrate_signature } = await signRaw({
						address: substrate_address,
						data: stringToHex(data?.signMessage || ''),
						type: 'bytes'
					});
					signature = substrate_signature;

					const { data: confirmData, error: confirmError } = await nextApiClientFetch<ChangeResponseType>('api/v1/auth/actions/addressLinkConfirm', {
						address: substrate_address,
						signature,
						wallet
					});

					if (confirmError) {
						console.error(confirmError);
						queueNotification({
							header: 'Failed!',
							message: cleanError(confirmError),
							status: NotificationStatus.ERROR
						});
						setLoading(false);
					}

					if (confirmData?.token) {
						handleTokenChange(confirmData.token, currentUser, dispatch);
						queueNotification({
							header: 'Success!',
							message: confirmData.message || '',
							status: NotificationStatus.SUCCESS
						});
						setLoading(false);
					}
				}
			}
		} catch (error) {
			queueNotification({
				header: 'Failed!',
				message: error,
				status: NotificationStatus.ERROR
			});
			setLoading(false);
		}
	};

	const handleSubmit = () => {
		if (!address || !wallet || !accounts) return;
		if (linkAddressNeeded && isUnlinkedAddress) {
			handleAddressLink(address, wallet as Wallet);
		} else {
			setLoading(true);
			localStorage.setItem(localStorageWalletKeyName, String(wallet));
			localStorage.setItem(localStorageAddressKeyName, showMultisig ? multisig : address);
			localStorage.setItem('delegationDashboardAddress', address);
			localStorage.setItem('multisigDelegationAssociatedAddress', address);
			dispatch(setUserDetailsState({ ...currentUser, delegationDashboardAddress: showMultisig ? multisig : address, loginWallet: wallet || null }));
			setShowMultisig(false);
			setMultisig('');
			onConfirm && onConfirm(address);
			setOpen(false);
			setLoading(false);
		}
	};

	const getWallet = () => {
		const injectedWindow = window as Window & InjectedWindow;
		setAvailableWallets(injectedWindow.injectedWeb3);
		setIsMetamaskWallet((injectedWindow as any)?.ethereum?.isMetaMask);
	};

	const handleWalletClick = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, wallet: Wallet) => {
		if (!api || !apiReady) return;
		localStorage.setItem('selectedWallet', wallet);
		setAccounts([]);
		setAddress('');
		event.preventDefault();
		setWallet(wallet);
		(async () => {
			setLoading(true);
			const accountData = await getAccountsFromWallet({ api, apiReady, chosenWallet: wallet, loginAddress, network });
			setAccounts(accountData?.accounts || []);
			setAddress(accountData?.account || '');
			setLoading(false);
		})();
	};

	const handleOnBalanceChange = async (balanceStr: string) => {
		if (!api || !apiReady) {
			return;
		}
		if (multisig) {
			balanceStr = (await api.query.system.account(multisig)).data.free.toString();
		}
		const [balance, isValid] = inputToBn(balanceStr, network, false);
		isValid ? setAvailableBalance(balance) : setAvailableBalance(ZERO_BN);
	};

	useEffect(() => {
		getWallet();
		const wallet = localStorage.getItem('loginWallet') || '';
		const address = localStorage.getItem('loginAddress');
		setWallet((loginWallet || wallet) as Wallet);
		if (!api || !apiReady) return;
		(async () => {
			setLoading(true);
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
			setLoading(false);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loginWallet, loginAddress, api, apiReady]);

	const handleInitiatorBalance = useCallback(
		async () => {
			if (!api || !apiReady) {
				return;
			}
			try {
				//deposit balance
				const depositBase = api.consts.multisig.depositBase?.toString() || '0';
				const depositFactor = api.consts.multisig.depositFactor?.toString() || '0';
				setTotalDeposit(new BN(depositBase).add(new BN(depositFactor)));
			} catch (e) {
				setTotalDeposit(ZERO_BN);
			} finally {
				//initiator balance
				if (multisig) {
					const initiatorBalance = await api?.query?.system?.account(address);
					setInitiatorBalance(new BN(initiatorBalance?.data?.free?.toString()));
				}
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[address, api, apiReady]
	);

	useEffect(() => {
		if (canUsePolkasafe(network)) {
			handleInitiatorBalance();
		}
	}, [address, handleInitiatorBalance, network]);

	return (
		<Modal
			wrapClassName={className}
			className={`${poppins.className} ${poppins.variable} radius`}
			open={open}
			title={
				<div className='text-center text-[20px] font-semibold text-bodyBlue'>
					{showMultisig && (
						<ArrowLeft
							className='absolute left-[24px] mt-1 cursor-pointer'
							onClick={() => {
								setShowMultisig(false);
								setMultisig('');
							}}
						/>
					)}
					{linkAddressNeeded ? 'Connect your Address' : 'Select your address'}
				</div>
			}
			footer={
				<Button
					onClick={handleSubmit}
					disabled={!accounts || (showMultisig && !multisig) || (showMultisig && initiatorBalance.lte(totalDeposit))}
					className={`mt-4 h-[40px] w-[134px] rounded-[4px] bg-pink_primary text-sm font-medium tracking-wide text-white ${
						accounts.length === 0 || (showMultisig && !multisig) || (showMultisig && initiatorBalance.lte(totalDeposit) && 'opacity-50')
					}`}
				>
					{isUnlinkedAddress && linkAddressNeeded ? 'Link Address' : linkAddressNeeded ? 'Next' : 'Confirm'}
				</Button>
			}
			closable={closable}
			onCancel={() => setOpen(!closable)}
			closeIcon={<CloseIcon />}
		>
			<Spin
				spinning={loading}
				indicator={<LoadingOutlined />}
			>
				<div className='flex flex-col'>
					{linkAddressNeeded && accounts?.length > 0 && isUnlinkedAddress && (
						<div className='mb-2 mt-6 flex flex-col items-center justify-center px-4'>
							<ConnectAddressIcon />
							<span className='mt-6 text-center text-sm text-bodyBlue'>
								Linking an address allows you to create proposals, edit their descriptions, add tags as well as submit updates regarding the proposal to the rest of the community
							</span>
						</div>
					)}
					<h3 className='text-center text-sm font-normal text-lightBlue'>Select a wallet</h3>
					<div className={`flex items-center justify-center gap-x-4 ${showMultisig ? 'mb-6' : ''}`}>
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
					{usingMultisig && (
						<div>
							{canUsePolkasafe(network) && !showMultisig && usingMultisig && (
								<div className='m-auto mb-6 mt-3 flex w-[50%] flex-col gap-3'>
									<Divider className='m-0'>OR</Divider>
									<div className='flex w-full justify-center'>
										<WalletButton
											className='border-[#D2D8E0] text-sm font-semibold text-bodyBlue'
											onClick={() => {
												setShowMultisig(!showMultisig);
											}}
											name='Polkasafe'
											icon={
												<WalletIcon
													which={Wallet.POLKASAFE}
													className='h-6 w-6'
												/>
											}
											text={'Use a multisig'}
										/>
									</div>
								</div>
							)}

							{showMultisig && initiatorBalance.lte(totalDeposit) && multisig && (
								<Alert
									message={`The Free Balance in your selected account is less than the Minimum Deposit ${formatBnBalance(
										totalDeposit,
										{ numberAfterComma: 3, withUnit: true },
										network
									)} required to create a Transaction.`}
									showIcon
									className='mb-6'
								/>
							)}
						</div>
					)}

					{!!Object.keys(availableWallets || {})?.length && !accounts.length && !!wallet && !loading && (
						<Alert
							message={`For using ${walletAlertTitle}:`}
							description={
								<ul className='mt-[-5px] text-sm'>
									<li>Give access to Polkassembly on your selected wallet.</li>
									<li>Add an address to the selected wallet.</li>
								</ul>
							}
							showIcon
							className='mt-4'
							type='info'
						/>
					)}
					{Object.keys(availableWallets || {}).length === 0 && !loading && (
						<Alert
							message={accountAlertTitle}
							description={`${
								linkAddressNeeded
									? 'No web 3 account integration could be found. To be able to use this feature, visit this page on a computer with polkadot-js extension.'
									: 'No web3 wallet was found with an active address.'
							}`}
							type='info'
							showIcon
							className='changeColor text-md text-bodyBlue'
						/>
					)}

					<Form
						form={form}
						disabled={loading}
					>
						{accounts.length > 0 ? (
							showMultisig ? (
								<MultisigAccountSelectionForm
									multisigBalance={multisigBalance}
									setMultisigBalance={setMultisigBalance}
									title='Select Address'
									accounts={accounts}
									address={address}
									withBalance
									onAccountChange={(address) => {
										setAddress(address);
										setMultisig('');
									}}
									onBalanceChange={handleOnBalanceChange}
									className='text-sm text-lightBlue'
									walletAddress={multisig}
									setWalletAddress={setMultisig}
									containerClassName='gap-[20px]'
									showMultisigBalance={true}
									canMakeTransaction={!initiatorBalance.lte(totalDeposit)}
								/>
							) : (
								<AccountSelectionForm
									isTruncateUsername={false}
									title={accountSelectionFormTitle}
									accounts={accounts}
									address={address}
									withBalance={true}
									onAccountChange={(address) => setAddress(address)}
									onBalanceChange={handleOnBalanceChange}
									className='mt-4 text-sm text-lightBlue'
								/>
							)
						) : !wallet && Object.keys(availableWallets || {}).length !== 0 ? (
							<Alert
								type='info'
								className='mt-4 rounded-[4px]'
								showIcon
								message='Please select a wallet.'
							/>
						) : null}
					</Form>
				</div>
			</Spin>
		</Modal>
	);
};

export default styled(AddressConnectModal)`
	.radius .ant-modal-content {
		border-radius: 4px !important;
	}
`;
