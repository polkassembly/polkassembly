// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import WalletButton from '~src/components/WalletButton';
import { useApiContext } from '~src/context';
import { useNetworkSelector } from '~src/redux/selectors';
import { Wallet } from '~src/types';
import { WalletIcon } from '~src/components/Login/MetamaskLogin';

interface Props {
	className?: string;
	handleWalletClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, wallet: Wallet) => void;
	isMetamaskWallet: boolean;
	wallet: Wallet;
	availableWallets: any;
}
const AvailableWallets = ({ className, handleWalletClick, isMetamaskWallet, wallet, availableWallets }: Props) => {
	const { network } = useNetworkSelector();
	const { apiReady } = useApiContext();

	return (
		<div className={className}>
			{['moonbase', 'moonbeam', 'moonriver'].includes(network) ? (
				<>
					{availableWallets[Wallet.TALISMAN] && (
						<WalletButton
							className={`h-[44px] w-[70px] rounded-[7px] ${wallet === Wallet.TALISMAN && 'border border-solid border-pink_primary'}`}
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
							className={`h-[44px] w-[70px] rounded-[7px] ${wallet === Wallet.METAMASK && 'border border-solid border-pink_primary'}`}
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
							className={` h-[44px] w-[70px] rounded-[7px] ${wallet === Wallet.NOVAWALLET && 'border border-solid border-pink_primary'}`}
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
							className={`h-[44px] w-[70px] rounded-[7px] ${wallet === Wallet.POLKADOT && 'border border-solid border-pink_primary'}`}
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
							className={` h-[44px] w-[70px] rounded-[7px] ${wallet === Wallet.TALISMAN && 'border border-solid border-pink_primary'}`}
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
							className={`h-[44px] w-[70px] rounded-[7px] ${wallet === Wallet.SUBWALLET && 'border border-solid border-pink_primary'}`}
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
							className={`h-[44px] w-[70px] rounded-[7px] ${wallet === Wallet.POLKAGATE && 'border border-solid border-pink_primary'}`}
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
							className={`h-[44px] w-[70px] rounded-[7px] ${wallet === Wallet.POLYWALLET && 'border border-solid border-pink_primary'}`}
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
				</>
			)}
		</div>
	);
};
export default AvailableWallets;
