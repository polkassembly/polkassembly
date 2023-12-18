// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Divider } from 'antd';
import React, { useEffect, useState } from 'react';
import { Wallet } from 'src/types';
import { InjectedWindow } from '@polkadot/extension-inject/types';

import WalletButton from '../WalletButton';
import { WalletIcon } from './MetamaskLogin';
import { useNetworkSelector } from '~src/redux/selectors';

interface Props {
	disabled: boolean;
	onWalletSelect: (wallet: Wallet) => void;
	showPolkasafe?: boolean;
	onPolkasafeSelect?: any;
	noHeader?: boolean;
	selectedWallet?: Wallet;
	isOptionalLogin?: boolean;
	isSigningUp?: boolean;
	isLoginFlow?: boolean;
}

const WalletButtons = ({ onWalletSelect, disabled, showPolkasafe, onPolkasafeSelect, noHeader = false, selectedWallet, isOptionalLogin, isSigningUp, isLoginFlow }: Props) => {
	const { network } = useNetworkSelector();
	const [availableWallets, setAvailableWallets] = useState<any>({});
	const [isMetamaskWallet, setIsMetamaskWallet] = useState<boolean>(false);

	function handleWalletClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, wallet: Wallet) {
		event.preventDefault();
		onWalletSelect(wallet);
	}
	const getWallet = () => {
		const injectedWindow = window as Window & InjectedWindow;
		setAvailableWallets(injectedWindow.injectedWeb3);
		setIsMetamaskWallet((injectedWindow as any)?.ethereum?.isMetaMask);
	};

	useEffect(() => {
		getWallet();
	}, [onWalletSelect, disabled, showPolkasafe, onPolkasafeSelect, selectedWallet, isOptionalLogin, isSigningUp]);

	return (
		<div className='w-full'>
			{!noHeader && !isOptionalLogin && (
				<div className={`${isSigningUp ? '-mt-10' : ''} flex items-center gap-x-2`}>
					<Divider className='text-grey_primary dark:text-blue-dark-medium'>Or Login with</Divider>
				</div>
			)}
			<div className={`wallet-buttons-container ${isOptionalLogin ? '' : 'flex'} mt-3 max-w-xs flex-col items-center justify-center gap-4 sm:mx-2 sm:max-w-none sm:flex-row`}>
				<div className={`${isOptionalLogin ? '' : 'flex'} gap-x-4`}>
					<WalletButton
						className={`wallet-buttons ${isOptionalLogin ? 'mb-3' : ''} ${selectedWallet && selectedWallet === Wallet.POLKADOT ? 'border border-solid border-pink_primary' : ''}`}
						disabled={!availableWallets[Wallet.POLKADOT]}
						onClick={(event) => handleWalletClick(event as any, Wallet.POLKADOT)}
						name='Polkadot.js'
						icon={
							<WalletIcon
								which={Wallet.POLKADOT}
								className='h-6 w-6'
							/>
						}
						isOptionalLogin={isOptionalLogin}
						isAvailable={availableWallets[Wallet.POLKADOT]}
						isLoginFlow={isLoginFlow}
						text='Polkadot.js'
					/>
					<WalletButton
						className={`wallet-buttons ${isOptionalLogin ? 'mb-3' : ''} ${selectedWallet && selectedWallet === Wallet.TALISMAN ? 'border border-solid border-pink_primary' : ''}`}
						// disabled={!availableWallets[Wallet.TALISMAN]}
						onClick={(event) => handleWalletClick(event as any, Wallet.TALISMAN)}
						name='Talisman'
						icon={
							<WalletIcon
								which={Wallet.TALISMAN}
								className='h-6 w-6'
							/>
						}
						isOptionalLogin={isOptionalLogin}
						isAvailable={availableWallets[Wallet.TALISMAN]}
						text='Talisman'
						isLoginFlow={isLoginFlow}
					/>
					<WalletButton
						className={`wallet-buttons ${isOptionalLogin ? 'mb-3' : ''} ${selectedWallet && selectedWallet === Wallet.SUBWALLET ? 'border border-solid border-pink_primary' : ''}`}
						// disabled={!availableWallets[Wallet.SUBWALLET]}
						onClick={(event) => handleWalletClick(event as any, Wallet.SUBWALLET)}
						name='SubWallet'
						icon={
							<WalletIcon
								which={Wallet.SUBWALLET}
								className={`h-8 w-8 px-1 ${isOptionalLogin ? 'mr-1' : ''}`}
							/>
						}
						isAvailable={availableWallets[Wallet.SUBWALLET]}
						isOptionalLogin={isOptionalLogin}
						text='SubWallet'
						isLoginFlow={isLoginFlow}
					/>
				</div>
				<div className={`${isOptionalLogin ? '' : 'flex'} gap-x-4`}>
					<WalletButton
						className={`wallet-buttons ${isOptionalLogin ? 'mb-3' : ''} ${selectedWallet && selectedWallet === Wallet.POLKAGATE ? 'border border-solid border-pink_primary' : ''}`}
						// disabled={!availableWallets[Wallet.POLKAGATE]}
						onClick={(event) => handleWalletClick(event as any, Wallet.POLKAGATE)}
						name='PolkaGate'
						icon={
							<WalletIcon
								which={Wallet.POLKAGATE}
								className='h-8 w-8'
							/>
						}
						isAvailable={availableWallets[Wallet.POLKAGATE]}
						isOptionalLogin={isOptionalLogin}
						text='PolkaGate'
						isLoginFlow={isLoginFlow}
					/>
					{showPolkasafe && onPolkasafeSelect && (
						<WalletButton
							className={`wallet-buttons ${isOptionalLogin ? 'mb-3' : ''}`}
							// disabled={!availableWallets[Wallet.POLKASAFE]}
							onClick={(event) => {
								onPolkasafeSelect(true);
								handleWalletClick(event as any, Wallet.POLKASAFE);
							}}
							name='polkasafe'
							icon={
								<WalletIcon
									which={Wallet.POLKASAFE}
									className='ml-1 mt-3 h-9 w-7'
								/>
							}
							isAvailable={availableWallets[Wallet.POLKASAFE]}
							isOptionalLogin={isOptionalLogin}
							text='Polkasafe (Multisig)'
							isLoginFlow={isLoginFlow}
						/>
					)}
					{(window as any).walletExtension?.isNovaWallet && (
						<WalletButton
							className={`wallet-buttons ${isOptionalLogin ? 'mb-3' : ''}`}
							// disabled={!availableWallets[Wallet.NOVAWALLET]}
							onClick={(event) => handleWalletClick(event as any, Wallet.NOVAWALLET)}
							name='Nova Wallet'
							icon={
								<WalletIcon
									which={Wallet.NOVAWALLET}
									className='h-6 w-6'
								/>
							}
							isAvailable={availableWallets[Wallet.NOVAWALLET]}
							isOptionalLogin={isOptionalLogin}
							text='Nova Wallet'
							isLoginFlow={isLoginFlow}
						/>
					)}
				</div>
				{['moonbase', 'moonbeam', 'moonriver'].includes(network) || ['polymesh'].includes(network) ? (
					<div className={`${isOptionalLogin ? '' : 'flex'} gap-x-4`}>
						{['moonbase', 'moonbeam', 'moonriver'].includes(network) ? (
							<WalletButton
								className={`wallet-buttons ${isOptionalLogin ? 'mb-3' : ''}`}
								// disabled={!isMetamaskWallet}
								onClick={(event) => handleWalletClick(event as any, Wallet.METAMASK)}
								name='MetaMask'
								icon={
									<WalletIcon
										which={Wallet.METAMASK}
										className='h-6 w-6'
									/>
								}
								isAvailable={isMetamaskWallet}
								isOptionalLogin={isOptionalLogin}
								text='MetaMask'
								isLoginFlow={isLoginFlow}
							/>
						) : null}
						{['polymesh'].includes(network) ? (
							<WalletButton
								className={`wallet-buttons ${isOptionalLogin ? 'mb-3' : ''}`}
								// disabled={!availableWallets[Wallet.POLYWALLET]}
								onClick={(event) => handleWalletClick(event as any, Wallet.POLYWALLET)}
								name='PolyWallet'
								icon={
									<WalletIcon
										which={Wallet.POLYWALLET}
										className='h-6 w-6'
									/>
								}
								isAvailable={availableWallets[Wallet.POLYWALLET]}
								isOptionalLogin={isOptionalLogin}
								text='PolyWallet'
								isLoginFlow={isLoginFlow}
							/>
						) : null}
					</div>
				) : null}
			</div>
		</div>
	);
};

export default WalletButtons;
