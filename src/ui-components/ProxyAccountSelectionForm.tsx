// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Dropdown } from '~src/ui-components/Dropdown';
import React, { useState } from 'react';
import { ItemType } from 'antd/es/menu/hooks/useItems';
import Address from './Address';
import { poppins } from 'pages/_app';
import DownIcon from '~assets/icons/down-icon.svg';
import styled from 'styled-components';
import Balance from '~src/components/Balance';
import { Button, Modal } from 'antd';
import Web2Login from '~src/components/Login/Web2Login';
import { CloseIcon } from './CustomIcons';
import getAccountsFromWallet from '~src/util/getAccountsFromWallet';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useApiContext } from '~src/context';

interface Props {
	proxyAddresses: string[];
	className?: string;
	theme?: string;
	withBalance?: boolean;
	address?: string;
	onBalanceChange?: (balance: string) => void;
	isBalanceUpdated?: boolean;
	inputClassName?: string;
	setShowWalletModal?: (pre: boolean) => void;
	showWalletModal?: boolean;
	wallet?: any;
	setIsProxyExistsOnWallet?: (pre: boolean) => void;
}

const ProxyAccountSelectionForm = ({
	isBalanceUpdated,
	onBalanceChange,
	withBalance,
	address,
	proxyAddresses,
	className,
	theme,
	inputClassName,
	wallet,
	setIsProxyExistsOnWallet
}: Props) => {
	const [showWalletModal, setShowWalletModal] = useState(false);
	const [selectedProxyAddress, setSelectedProxyAddress] = useState(proxyAddresses[0] || '');
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const [changedWallet, setChangedWallet] = useState('');
	const { loginAddress } = useUserDetailsSelector();

	console.log(wallet);

	const dropdownMenuItems: ItemType[] = proxyAddresses.map((proxyAddress) => {
		return {
			key: proxyAddress,
			label: (
				<Address
					className={`flex items-center ${poppins.className} ${poppins.className}`}
					addressClassName='text-lightBlue text-xs dark:text-blue-dark-medium'
					address={proxyAddress}
					disableAddressClick
					disableTooltip
				/>
			)
		};
	});

	const getAllAccounts = async () => {
		if (!api || !apiReady || !wallet) return;
		const addressData = await getAccountsFromWallet({ api, apiReady, chosenWallet: changedWallet || wallet, loginAddress, network });
		const exists = addressData?.accounts.some((account) => account.address === selectedProxyAddress);
		setIsProxyExistsOnWallet?.(exists || true);
	};

	return (
		<>
			<article className='mt-2 flex w-full flex-col'>
				<div className='mb-1 ml-[-6px] flex items-center gap-x-2'>
					<h3 className='inner-headings mb-[1px] ml-1.5 dark:text-blue-dark-medium'>Vote with Proxy</h3>
					{address && withBalance && (
						<Balance
							address={address}
							onChange={onBalanceChange}
							isBalanceUpdated={isBalanceUpdated}
						/>
					)}
				</div>
				<Dropdown
					trigger={['click']}
					overlayClassName='z-[2000]'
					className={`${className} ${inputClassName} h-[48px] rounded-md border-[1px] border-solid border-gray-300 px-3 py-1 text-xs dark:border-[#3B444F] dark:border-separatorDark`}
					menu={{
						items: dropdownMenuItems,
						onClick: (e: any) => {
							if (e.key !== '1') {
								setSelectedProxyAddress(e.key);
							}
						}
					}}
					theme={theme}
				>
					<div className='flex items-center justify-between '>
						<Address
							address={selectedProxyAddress || proxyAddresses[0]}
							className='flex flex-1 items-center'
							addressClassName='text-lightBlue text-xs dark:text-blue-dark-medium'
							disableAddressClick
							disableTooltip
						/>
						<Button
							className='flex h-[25px] items-center border bg-transparent text-xs text-bodyBlue dark:border-separatorDark dark:text-white'
							onClick={(e) => {
								e.preventDefault;
								e.stopPropagation();
								setShowWalletModal?.(!showWalletModal);
							}}
						>
							Change Wallet
						</Button>
						<span className='mx-2 mb-1'>
							<DownIcon />
						</span>
					</div>
				</Dropdown>
			</article>

			<Modal
				open={showWalletModal}
				footer={false}
				className={`${poppins.variable} ${poppins.className} -mt-2 border dark:border-separatorDark dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
				wrapClassName='vaibhav'
				closeIcon={<CloseIcon className='mt-6 text-lightBlue dark:text-icon-dark-inactive' />}
				onCancel={() => {
					setShowWalletModal?.(false);
				}}
			>
				<Web2Login
					theme={theme}
					isModal={true}
					onWalletSelect={(e) => {
						setChangedWallet(e);
						getAllAccounts();
					}}
					showWeb2Option={false}
					// setLoginOpen={setLoginOpen}
					// isDelegation={isDelegation}
					// setSignupOpen={setSignupOpen}
					// onWalletSelect={onWalletSelect}
					// walletError={walletError}
					// setWithPolkasafe={setWithPolkasafe}
				/>
			</Modal>
		</>
	);
};

export default styled(ProxyAccountSelectionForm)`
	.ant-dropdown-trigger {
		border: ${(props) => (props.theme == 'dark' ? '1px solid #4B4B4B' : '1px solid #d2d8e0')} !important;
	}
`;
