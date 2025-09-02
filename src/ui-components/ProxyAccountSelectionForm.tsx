// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Dropdown } from '~src/ui-components/Dropdown';
import React, { useEffect, useState } from 'react';
import Address from './Address';
import { dmSans } from 'pages/_app';
import DownIcon from '~assets/icons/down-icon.svg';
import styled from 'styled-components';
import Balance from '~src/components/Balance';
import { Button, Modal } from 'antd';
import Web2Login from '~src/components/Login/Web2Login';
import { CloseIcon } from './CustomIcons';
import { WalletIcon } from '~src/components/Login/MetamaskLogin';
import getAccountsFromWallet from '~src/util/getAccountsFromWallet';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useApiContext } from '~src/context';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import NetworkIcon from '~assets/icons/USB.svg';

interface Props {
	proxyAddresses: string[];
	className?: string;
	theme?: string;
	withBalance?: boolean;
	address?: string;
	isBalanceUpdated?: boolean;
	inputClassName?: string;
	setShowWalletModal?: (pre: boolean) => void;
	showWalletModal?: boolean;
	isUsedInIdentity?: boolean;
	wallet?: any;
	setIsProxyExistsOnWallet?: (pre: boolean) => void;
	setSelectedProxyAddress?: (pre: string) => void;
	selectedProxyAddress?: string;
	heading?: string;
	onBalanceChange?: (pre: string) => void;
}

const ProxyAccountSelectionForm = ({
	isBalanceUpdated,
	withBalance,
	address,
	proxyAddresses,
	className,
	theme,
	inputClassName,
	wallet,
	setSelectedProxyAddress,
	selectedProxyAddress,
	setIsProxyExistsOnWallet,
	heading,
	isUsedInIdentity,
	onBalanceChange
}: Props) => {
	const [showWalletModal, setShowWalletModal] = useState(false);
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const [changedWallet, setChangedWallet] = useState(wallet);
	const [walletType, setWalletType] = useState<any>();
	const { loginAddress } = useUserDetailsSelector();

	const dropdownMenuItems: any[] = proxyAddresses.map((proxyAddress) => {
		return {
			key: proxyAddress,
			label: (
				<Address
					className={`flex items-center ${dmSans.className} ${dmSans.className}`}
					addressClassName='text-lightBlue text-xs dark:text-blue-dark-medium'
					address={proxyAddress}
					disableAddressClick
					disableTooltip
					iconSize={22}
					disableHeader
				/>
			)
		};
	});

	const getAllAccounts = async () => {
		if (!api || !apiReady || !wallet) return;
		setWalletType(changedWallet);
		const addressData = await getAccountsFromWallet({ api, apiReady, chosenWallet: changedWallet || wallet, loginAddress, network });
		if (addressData?.accounts?.length && selectedProxyAddress) {
			const exists = addressData?.accounts.filter((account) => getSubstrateAddress(account.address) === getSubstrateAddress(selectedProxyAddress))?.length;
			setIsProxyExistsOnWallet?.(!!exists);
		}
	};

	useEffect(() => {
		getAllAccounts();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedProxyAddress, changedWallet]);

	return (
		<>
			<article className={`${isUsedInIdentity ? 'mt-3' : 'mt-2'} flex w-full flex-col`}>
				<div className={`${isUsedInIdentity ? '-mb-[10px]' : 'mb-1'} ml-[-6px] flex items-center gap-x-2`}>
					<h3 className={`inner-headings mb-[1px] ml-1.5 ${isUsedInIdentity ? 'dark:text-white' : 'dark:text-blue-dark-medium'}`}>{heading ? heading : 'Vote with Proxy'}</h3>
					{!!address && !!withBalance && (
						<Balance
							address={selectedProxyAddress || ''}
							isBalanceUpdated={isBalanceUpdated}
							onChange={(balance: string | undefined) => onBalanceChange?.(balance || '')}
						/>
					)}
				</div>
				<Dropdown
					trigger={['click']}
					overlayClassName='z-[2000]'
					className={`${className} ${inputClassName} ${
						isUsedInIdentity ? 'h-10' : 'h-12 py-1'
					} rounded-md border-[1px] border-solid border-gray-300 px-3 text-xs dark:border-[#3B444F] dark:border-separatorDark`}
					menu={{
						items: dropdownMenuItems,
						onClick: (e: any) => {
							if (e.key !== '1') {
								setSelectedProxyAddress?.(e.key);
							}
						}
					}}
					theme={theme}
				>
					<div className='flex items-center justify-between '>
						<Address
							address={selectedProxyAddress || ''}
							className='flex flex-1 items-center'
							addressClassName='text-lightBlue text-xs dark:text-blue-dark-medium'
							disableAddressClick
							iconSize={22}
							disableTooltip
							disableHeader
						/>
						<div
							className='mr-[154px] flex h-[18px] items-center justify-center gap-x-1 whitespace-nowrap rounded-[10px] px-3'
							style={{ background: 'rgba(64, 123, 255, 0.06)' }}
						>
							<NetworkIcon />
							<p className='m-0 p-0 text-[10px] text-lightBlue'>Proxy Address</p>
						</div>
						<Button
							className='flex h-[25px] items-center border border-section-light-container bg-[#F9FAFB] p-0 px-2 text-xs text-bodyBlue hover:border-section-light-container hover:bg-[#EFF0F1] dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-medium hover:dark:bg-transparent'
							onClick={(e) => {
								e.preventDefault;
								e.stopPropagation();
								setShowWalletModal?.(!showWalletModal);
							}}
						>
							<WalletIcon
								which={walletType}
								isProxyAccountForm={true}
								className='walletIcon-container mr-[2px]'
							/>
							Change Wallet
						</Button>
						<span className='ml-1'>
							<DownIcon />
						</span>
					</div>
				</Dropdown>
			</article>

			<Modal
				open={showWalletModal}
				footer={false}
				className={`${className} ${dmSans.variable} ${dmSans.className} alignment-close -mt-2 border dark:border-separatorDark dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
				wrapClassName={`custom-modal-backdrop ${className} dark:bg-modalOverlayDark`}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
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
					setShowWalletModal={setShowWalletModal}
				/>
			</Modal>
		</>
	);
};

export default styled(ProxyAccountSelectionForm)`
	.ant-dropdown-trigger {
		border: ${(props: any) => (props.theme == 'dark' ? '1px solid #4B4B4B' : '1px solid #d2d8e0')} !important;
	}
	.ant-modal-content {
		border: ${(props: any) => (props.theme == 'dark' ? '1px solid #4B4B4B' : '1px solid #d2d8e0')} !important;
		padding: 0 !important;
		padding-bottom: 8px !important;
	}
	.custom-modal-backdrop {
		background-color: rgba(0, 0, 0, 0.2);
	}
`;
