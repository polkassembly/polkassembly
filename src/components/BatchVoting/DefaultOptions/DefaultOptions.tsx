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

const DefaultOptions: FC<IDefaultOptions> = ({ forSpecificPost, postEdit }) => {
	const dispatch = useAppDispatch();
	const [lastVote, setLastVote] = useState<ILastVote | null>(null);
	const { loginAddress, loginWallet } = useUserDetailsSelector();
	const [address, setAddress] = useState<string>(loginAddress);
	const onAccountChange = (address: string) => {
		setAddress(address);
	};

	const { api, apiReady } = useApiContext();
	const [extensionNotFound, setExtensionNotFound] = useState<boolean>(false);
	const { network } = useNetworkSelector();
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);

	useEffect(() => {
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
				<div className='mt-8'>
					{!extensionNotFound && !accounts.length ? (
						<Alert
							description={
								<div className=' text-xs text-lightBlue dark:text-blue-dark-high'>
									<h3 className='p-0 text-[13px] text-lightBlue dark:text-blue-dark-high'>Link your wallet</h3>
									<div className='p-0 text-[13px] text-lightBlue dark:text-blue-dark-high'>Add an address to the selected wallet by your extension.</div>
								</div>
							}
							showIcon
							className='mb-2 mt-1 p-3'
							type='info'
						/>
					) : (
						<AddressDropdown
							accounts={accounts}
							defaultAddress={address}
							onAccountChange={onAccountChange}
						/>
					)}
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
