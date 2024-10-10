// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useEffect, useState } from 'react';
import OptionWrapper from './OptionWrapper';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { ILastVote, Wallet } from '~src/types';
import Alert from '~src/basic-components/Alert';
import { ProposalType } from '~src/global/proposalType';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { useAppDispatch } from '~src/redux/store';
import { batchVotesActions } from '~src/redux/batchVoting';
import AddressDropdown from '~src/ui-components/AddressDropdown';
import getAccountsFromWallet from '~src/util/getAccountsFromWallet';
import { InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { useApiContext } from '~src/context';
import { IDefaultOptions } from '../types';
import Balance from '~src/components/Balance';
import BN from 'bn.js';
import { canUsePolkasafe } from '~src/util/canUsePolkasafe';
import WalletButton from '~src/components/WalletButton';
import { WalletIcon } from '~src/components/Login/MetamaskLogin';
const ZERO_BN = new BN(0);

const DefaultOptions: FC<IDefaultOptions> = ({ forSpecificPost, postEdit }) => {
	const dispatch = useAppDispatch();
	const [lastVote, setLastVote] = useState<ILastVote | null>(null);
	const { loginAddress, loginWallet } = useUserDetailsSelector();
	const [address, setAddress] = useState<string>(loginAddress);
	const onAccountChange = (address: string) => {
		setAddress(address);
	};
	const [availableWallets, setAvailableWallets] = useState<any>({});
	const { api, apiReady } = useApiContext();
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [extensionNotFound, setExtensionNotFound] = useState<boolean>(false);
	const { network } = useNetworkSelector();
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [availableBalance, setAvailableBalance] = useState<BN | null>(null);
	const [wallet, setWallet] = useState<Wallet>();
	const [showMultisig, setShowMultisig] = useState<boolean>(false);

	const getWallet = () => {
		const injectedWindow = window as Window & InjectedWindow;
		setAvailableWallets(injectedWindow.injectedWeb3);
	};

	useEffect(() => {
		getWallet();
		if (!api || !apiReady) return;
		if (loginWallet) {
			const injectedWindow = window as Window & InjectedWindow;
			const extensionAvailable = isWeb3Injected ? injectedWindow.injectedWeb3[loginWallet] : null;
			if (!extensionAvailable) {
				setExtensionNotFound(true);
			} else {
				setExtensionNotFound(false);
			}
			(async () => {
				const accountsData = await getAccountsFromWallet({ api, apiReady, chosenWallet: loginWallet, loginAddress, network });
				setAccounts(accountsData?.accounts || []);
				onAccountChange(accountsData?.account || '');
			})();
		} else {
			if (!window) return;
			const loginWallet = localStorage.getItem('loginWallet');
			if (loginWallet) {
				const injectedWindow = window as Window & InjectedWindow;
				const extensionAvailable = isWeb3Injected ? injectedWindow.injectedWeb3[loginWallet] : null;
				if (!extensionAvailable) {
					setExtensionNotFound(true);
				} else {
					setExtensionNotFound(false);
				}
				(async () => {
					const accountsData = await getAccountsFromWallet({ api, apiReady, chosenWallet: loginWallet as Wallet, loginAddress, network });
					setAccounts(accountsData?.accounts || []);
					onAccountChange(accountsData?.account || '');
				})();
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loginAddress]);

	const handleWalletClick = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, wallet: Wallet) => {
		localStorage.setItem('selectedWallet', wallet);
		// setLoadingStatus({ ...loadingStatus, isLoading: true });
		setAccounts([]);
		onAccountChange('');
		event.preventDefault();
		setWallet(wallet);
		if (!api || !apiReady) return;
		(async () => {
			const accountsData = await getAccountsFromWallet({ api, apiReady, chosenWallet: wallet, loginAddress, network });
			setAccounts(accountsData?.accounts || []);
			onAccountChange(accountsData?.account || '');
		})();

		// setLoadingStatus({ ...loadingStatus, isLoading: false });
	};

	const handleOnAvailableBalanceChange = async (balanceStr: string) => {
		if (!api || !apiReady) {
			return;
		}
		let balance = ZERO_BN;

		try {
			balance = new BN(balanceStr);
			setAvailableBalance(balance);
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<section className='h-full w-full items-center justify-start gap-x-3 rounded-xl bg-white dark:bg-black'>
			<header>
				<div className='mb-4 mt-4 h-[48px] border-0 border-b-[1px] border-solid border-section-light-container px-6 text-lg font-semibold tracking-wide text-bodyBlue dark:border-separatorDark dark:text-blue-dark-high'>
					Set Defaults
				</div>
			</header>
			<article className='-full w-full items-center justify-start gap-x-3 px-6'>
				{!forSpecificPost && (
					<Alert
						type='info'
						showIcon
						message={<span className='text-[13px] dark:text-white'>Select default values for votes. These can be edited before making a final transaction</span>}
					/>
				)}
				<div className='my-6'>
					<div className='mt-1 flex items-center justify-center text-sm font-normal text-lightBlue dark:text-blue-dark-medium'>Select a wallet</div>
					<div className='mt-1 flex items-center justify-center gap-x-2'>
						{availableWallets[Wallet.POLKADOT] && (
							<WalletButton
								className={`${wallet === Wallet.POLKADOT ? 'h-12 w-16 border border-solid border-pink_primary hover:border-pink_primary' : 'h-[48px] w-[64px]'}`}
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
								className={`${wallet === Wallet.TALISMAN ? 'h-[48px] w-16 border border-solid border-pink_primary hover:border-pink_primary' : 'h-[48px] w-[64px]'}`}
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
								className={`${wallet === Wallet.SUBWALLET ? 'h-[48px] w-16 border border-solid border-pink_primary hover:border-pink_primary' : 'h-[48px] w-[64px]'}`}
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
								className={`${wallet === Wallet.POLKAGATE ? 'h-[48px] w-16 border border-solid border-pink_primary hover:border-pink_primary' : 'h-[48px] w-[64px]'}`}
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
						{(window as any).walletExtension?.isNovaWallet && availableWallets[Wallet.NOVAWALLET] && (
							<WalletButton
								disabled={!apiReady}
								className={`${wallet === Wallet.NOVAWALLET ? 'h-[48px] w-16 border  border-solid border-pink_primary' : 'h-[48px] w-[64px]'}`}
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
						{['polymesh'].includes(network) && availableWallets[Wallet.POLYWALLET] ? (
							<WalletButton
								disabled={!apiReady}
								onClick={(event) => handleWalletClick(event as any, Wallet.POLYWALLET)}
								className={`${wallet === Wallet.POLYWALLET ? 'h-[48px] w-16 border  border-solid border-pink_primary' : 'h-[48px] w-[64px]'}`}
								name='PolyWallet'
								icon={
									<WalletIcon
										which={Wallet.POLYWALLET}
										className='h-6 w-6'
									/>
								}
							/>
						) : null}
						{canUsePolkasafe(network) && !showMultisig && (
							<div className='flex-col'>
								<div className='flex w-full justify-center'>
									<WalletButton
										className='h-[50px] w-16 !border-section-light-container text-sm font-semibold text-bodyBlue dark:border-[#3B444F] dark:text-blue-dark-high'
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
										text={'Cast Vote with Multisig'}
									/>
								</div>
							</div>
						)}
					</div>
				</div>
				<div className='mt-6'>
					<div className='mt-1 flex justify-end'>
						<Balance
							address={address}
							onChange={handleOnAvailableBalanceChange}
						/>
					</div>
					<AddressDropdown
						accounts={accounts}
						defaultAddress={address}
						onAccountChange={onAccountChange}
					/>
				</div>

				<OptionWrapper
					address={String(address)}
					onAccountChange={onAccountChange}
					proposalType={ProposalType.TREASURY_PROPOSALS}
					lastVote={lastVote}
					setLastVote={setLastVote}
					forSpecificPost={forSpecificPost}
					postEdit={postEdit}
				/>
			</article>
			<div className='mb-2 mt-9 flex items-center justify-end gap-x-2 border-0 border-t-[1px] border-solid border-section-light-container px-6 pb-2 pt-4'>
				<CustomButton
					variant='default'
					text='Skip'
					buttonsize='sm'
					onClick={() => {
						dispatch(batchVotesActions.setIsDefaultSelected(false));
					}}
				/>
				<CustomButton
					variant='primary'
					text='Next'
					buttonsize='sm'
					onClick={() => {
						dispatch(batchVotesActions.setIsDefaultSelected(false));
					}}
				/>
			</div>
		</section>
	);
};

export default DefaultOptions;
