// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Divider } from 'antd';
import React from 'react';
import { Wallet } from 'src/types';

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
	optionalLogin?: boolean;
	forSignUpModal?: boolean;
}

const WalletButtons = ({ onWalletSelect, disabled, showPolkasafe, onPolkasafeSelect, noHeader = false, selectedWallet, optionalLogin, forSignUpModal }: Props) => {
	const { network } = useNetworkSelector();
	function handleWalletClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, wallet: Wallet) {
		event.preventDefault();
		onWalletSelect(wallet);
	}

	return (
		<div className='w-full'>
			{!noHeader && !optionalLogin && (
				<div className={`${forSignUpModal ? '-mt-10' : ''} flex items-center gap-x-2`}>
					<Divider className='text-grey_primary'>Or Login with</Divider>
				</div>
			)}
			<div className={`wallet-buttons-container ${optionalLogin ? '' : 'flex'} mt-3 max-w-xs flex-col items-center justify-center gap-4 sm:mx-2 sm:max-w-none sm:flex-row`}>
				<div className={`${optionalLogin ? '' : 'flex'} gap-x-4`}>
					<WalletButton
						className={`wallet-buttons ${optionalLogin ? 'mb-3' : ''} ${selectedWallet && selectedWallet === Wallet.POLKADOT ? 'border border-solid border-pink_primary' : ''}`}
						disabled={disabled}
						onClick={(event) => handleWalletClick(event as any, Wallet.POLKADOT)}
						name='Polkadot.js'
						icon={
							<WalletIcon
								which={Wallet.POLKADOT}
								className='h-6 w-6'
							/>
						}
						optionalLogin={optionalLogin}
						text='Polkadot.js'
					/>
					<WalletButton
						className={`wallet-buttons ${optionalLogin ? 'mb-3' : ''} ${selectedWallet && selectedWallet === Wallet.TALISMAN ? 'border border-solid border-pink_primary' : ''}`}
						disabled={disabled}
						onClick={(event) => handleWalletClick(event as any, Wallet.TALISMAN)}
						name='Talisman'
						icon={
							<WalletIcon
								which={Wallet.TALISMAN}
								className='h-6 w-6'
							/>
						}
						optionalLogin={optionalLogin}
						text='Talisman'
					/>
					<WalletButton
						className={`wallet-buttons ${optionalLogin ? 'mb-3' : ''} ${selectedWallet && selectedWallet === Wallet.SUBWALLET ? 'border border-solid border-pink_primary' : ''}`}
						disabled={disabled}
						onClick={(event) => handleWalletClick(event as any, Wallet.SUBWALLET)}
						name='SubWallet'
						icon={
							<WalletIcon
								which={Wallet.SUBWALLET}
								className={`h-8 w-8 px-1 ${optionalLogin ? 'mr-2' : ''}`}
							/>
						}
						optionalLogin={optionalLogin}
						text='SubWallet'
					/>
				</div>
				<div className={`${optionalLogin ? '' : 'flex'} gap-x-4`}>
					<WalletButton
						className={`wallet-buttons ${optionalLogin ? 'mb-3' : ''} ${selectedWallet && selectedWallet === Wallet.POLKAGATE ? 'border border-solid border-pink_primary' : ''}`}
						disabled={disabled}
						onClick={(event) => handleWalletClick(event as any, Wallet.POLKAGATE)}
						name='PolkaGate'
						icon={
							<WalletIcon
								which={Wallet.POLKAGATE}
								className='h-8 w-8'
							/>
						}
						optionalLogin={optionalLogin}
						text='PolkaGate'
					/>
					{showPolkasafe && onPolkasafeSelect && (
						<WalletButton
							className={`wallet-buttons ${optionalLogin ? 'mb-3' : ''}`}
							disabled={disabled}
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
							optionalLogin={optionalLogin}
							text='Polkasafe (Multisig)'
						/>
					)}
					{(window as any).walletExtension?.isNovaWallet && (
						<WalletButton
							className={`wallet-buttons ${optionalLogin ? 'mb-3' : ''}`}
							disabled={disabled}
							onClick={(event) => handleWalletClick(event as any, Wallet.NOVAWALLET)}
							name='Nova Wallet'
							icon={
								<WalletIcon
									which={Wallet.NOVAWALLET}
									className='h-6 w-6'
								/>
							}
							optionalLogin={optionalLogin}
							text='Nova Wallet'
						/>
					)}
				</div>
				{['moonbase', 'moonbeam', 'moonriver'].includes(network) || ['polymesh'].includes(network) ? (
					<div className={`${optionalLogin ? '' : 'flex'} gap-x-4`}>
						{['moonbase', 'moonbeam', 'moonriver'].includes(network) ? (
							<WalletButton
								className={`wallet-buttons ${optionalLogin ? 'mb-3' : ''}`}
								disabled={disabled}
								onClick={(event) => handleWalletClick(event as any, Wallet.METAMASK)}
								name='MetaMask'
								icon={
									<WalletIcon
										which={Wallet.METAMASK}
										className='h-6 w-6'
									/>
								}
								optionalLogin={optionalLogin}
								text='MetaMask'
							/>
						) : null}
						{['polymesh'].includes(network) ? (
							<WalletButton
								className={`wallet-buttons ${optionalLogin ? 'mb-3' : ''}`}
								disabled={disabled}
								onClick={(event) => handleWalletClick(event as any, Wallet.POLYWALLET)}
								name='PolyWallet'
								icon={
									<WalletIcon
										which={Wallet.POLYWALLET}
										className='h-6 w-6'
									/>
								}
								optionalLogin={optionalLogin}
								text='PolyWallet'
							/>
						) : null}
					</div>
				) : null}
			</div>
		</div>
	);
};

export default WalletButtons;
