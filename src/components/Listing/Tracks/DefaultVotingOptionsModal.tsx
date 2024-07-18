// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Alert, Skeleton } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { ProposalType } from '~src/global/proposalType';
import { ILastVote, Wallet } from '~src/types';
import dynamic from 'next/dynamic';
import AccountSelectionForm from '~src/ui-components/AccountSelectionForm';
import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { APPNAME } from '~src/global/appName';
import getEncodedAddress from '~src/util/getEncodedAddress';
import ExtensionNotDetected from '~src/components/ExtensionNotDetected';
const VoteReferendumCard = dynamic(() => import('src/components/Post/GovernanceSideBar/Referenda/VoteReferendumCard'), {
	loading: () => <Skeleton active />,
	ssr: false
});

interface IDefaultVotingOptionsModal {
	theme?: string;
	forSpecificPost?: boolean;
	postEdit?: any;
}

const DefaultVotingOptionsModal: FC<IDefaultVotingOptionsModal> = (props) => {
	const { forSpecificPost, postEdit } = props;
	const { network } = useNetworkSelector();
	const { loginAddress } = useUserDetailsSelector();
	const [lastVote, setLastVote] = useState<ILastVote | null>(null);
	const [address, setAddress] = useState<string>(loginAddress);
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [extensionNotFound, setExtensionNotFound] = useState(false);
	const [accountsNotFound, setAccountsNotFound] = useState(false);

	const onAccountChange = (address: string) => {
		console.log(address);
		setAddress(address);
	};

	const getAccounts = async (chosenWallet: Wallet): Promise<undefined> => {
		if (['moonbase', 'moonbeam', 'moonriver'].includes(network)) {
			const wallet = chosenWallet === Wallet.SUBWALLET ? (window as any).SubWallet : (window as any).talismanEth;
			if (!wallet) {
				setExtensionNotFound(true);
				return;
			} else {
				setExtensionNotFound(false);
			}
			const accounts: string[] = (await wallet.request({ method: 'eth_requestAccounts' })) || [];

			if (accounts.length === 0) {
				setAccountsNotFound(true);
				return;
			} else {
				setAccountsNotFound(false);
			}

			const walletName = chosenWallet === Wallet.SUBWALLET ? Wallet.SUBWALLET : chosenWallet === Wallet.TALISMAN ? Wallet.TALISMAN : 'MetaMask';

			const injectedAccounts = accounts.map(
				(account) =>
					({
						address: account,
						name: walletName,
						source: walletName
					}) as InjectedAccount
			);

			setAccounts(injectedAccounts);
			if (injectedAccounts.length > 0) {
				setAddress(injectedAccounts[0].address);
			}
			return;
		} else {
			const injectedWindow = window as Window & InjectedWindow;
			const wallet = isWeb3Injected ? injectedWindow.injectedWeb3[chosenWallet] : null;
			if (!wallet) {
				setExtensionNotFound(true);
				return;
			} else {
				setExtensionNotFound(false);
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
				console.log(err);
			}
			if (!injected) {
				return;
			}

			const accounts = await injected.accounts.get();
			if (accounts.length === 0) {
				setAccountsNotFound(true);
				return;
			} else {
				setAccountsNotFound(false);
			}

			accounts.forEach((account) => {
				account.address = getEncodedAddress(account.address, network) || account.address;
			});

			setAccounts(accounts);
			if (accounts.length > 0) {
				setAddress(accounts[0].address);
			}
			return;
		}
	};

	useEffect(() => {
		getAccounts(Wallet.NOVAWALLET);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [accounts.length]);

	console.log(accounts);
	return (
		<section className='mt-4'>
			{!forSpecificPost && (
				<Alert
					type='info'
					showIcon
					message='Select default values for votes. These can be edited before making a final transaction'
				/>
			)}
			{extensionNotFound && forSpecificPost ? (
				<div>
					<div className='-mt-1 mb-5 flex items-center justify-center'>
						<ExtensionNotDetected chosenWallet={Wallet.NOVAWALLET} />
					</div>
				</div>
			) : null}
			{accountsNotFound && forSpecificPost && (
				<div className='my-5 flex items-center justify-center px-4'>
					<Alert
						message={<span className='dark:text-blue-dark-high'>You need at least one account in Polkadot-js extension to login.</span>}
						description={<span className='dark:text-blue-dark-high'>Please reload this page after adding accounts.</span>}
						type='info'
						showIcon
					/>
				</div>
			)}
			{forSpecificPost && (
				<AccountSelectionForm
					isTruncateUsername={false}
					title='Vote with account'
					accounts={accounts}
					address={address}
					onAccountChange={onAccountChange}
					linkAddressTextDisabled
				/>
			)}
			<VoteReferendumCard
				address={String(address)}
				onAccountChange={onAccountChange}
				proposalType={ProposalType.TREASURY_PROPOSALS}
				lastVote={lastVote as any}
				setLastVote={setLastVote}
				forSpecificPost={forSpecificPost}
				postEdit={postEdit}
			/>
		</section>
	);
};

export default DefaultVotingOptionsModal;
