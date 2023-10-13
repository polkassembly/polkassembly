// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { Button, Dropdown, Tag } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { poppins } from 'pages/_app';
import React, { useState } from 'react';
import Address from 'src/ui-components/Address';
import { useUserDetailsContext } from '~src/context';
import DownIcon from '~assets/icons/down-icon.svg';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { EAddressOtherTextType } from '~src/types';

export type InjectedTypeWithCouncilBoolean = InjectedAccount & {
	isCouncil?: boolean;
};

interface Props {
	defaultAddress?: string;
	accounts: InjectedTypeWithCouncilBoolean[];
	className?: string;
	filterAccounts?: string[];
	onAccountChange: (address: string) => void;
	isDisabled?: boolean;
	isSwitchButton?: boolean;
	setSwitchModalOpen?: (pre: boolean) => void;
	isMultisig?: boolean;
	linkAddressTextDisabled?: boolean;
	addressTextClassName?: string;
	isTruncateUsername?: boolean;
}

const AddressDropdown = ({
	defaultAddress,
	className = 'px-3 py-1 border-solid border-gray-300 border-[1px] rounded-md h-[48px]',
	accounts,
	filterAccounts,
	isDisabled,
	onAccountChange,
	isSwitchButton,
	setSwitchModalOpen,
	isMultisig,
	linkAddressTextDisabled = false,
	addressTextClassName,
	isTruncateUsername = true
}: Props) => {
	const [selectedAddress, setSelectedAddress] = useState(defaultAddress || '');
	const filteredAccounts = !filterAccounts ? accounts : accounts.filter((elem) => filterAccounts.includes(elem.address));
	const dropdownList: { [index: string]: string } = {};
	const addressItems: ItemType[] = [];
	const { setUserDetailsContextState, addresses } = useUserDetailsContext();
	const substrate_address = getSubstrateAddress(selectedAddress || '');
	const substrate_addresses = (addresses || []).map((address) => getSubstrateAddress(address));

	const getOtherTextType = (account?: InjectedTypeWithCouncilBoolean) => {
		if (linkAddressTextDisabled) return;
		const account_substrate_address = getSubstrateAddress(account?.address || '');
		const isConnected = account_substrate_address?.toLowerCase() === (substrate_address || '').toLowerCase();
		if (account?.isCouncil) {
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

	filteredAccounts.forEach((account) => {
		addressItems.push({
			key: account.address,
			label: (
				<Address
					className={`flex items-center ${poppins.className} ${poppins.className}`}
					addressOtherTextType={getOtherTextType(account)}
					addressClassName='text-lightBlue'
					extensionName={account.name}
					address={account.address}
					disableAddressClick
					isTruncateUsername={isTruncateUsername}
				/>
			)
		});

		if (account.address && account.name) {
			dropdownList[account.address] = account.name;
		}
	});

	isSwitchButton &&
		setSwitchModalOpen &&
		addressItems.push({
			key: 1,
			label: (
				<div className='mt-2 flex items-center justify-center'>
					<Button
						onClick={() => setSwitchModalOpen(true)}
						className={`flex h-[40px] w-full items-center justify-center rounded-[8px] bg-pink_primary text-sm font-medium tracking-wide text-[#fff] ${poppins.variable} ${poppins.className}`}
					>
						Switch Wallet
					</Button>
				</div>
			)
		});
	return (
		<Dropdown
			trigger={['click']}
			className={className}
			disabled={isDisabled}
			overlayClassName='z-[1056]'
			menu={{
				items: addressItems,
				onClick: (e) => {
					if (e.key !== '1') {
						setSelectedAddress(e.key);
						onAccountChange(e.key);
						setSwitchModalOpen &&
							setUserDetailsContextState((prev) => {
								return { ...prev, delegationDashboardAddress: e.key };
							});
					}
				}
			}}
		>
			<div className='flex items-center justify-between '>
				{isMultisig && (
					<Tag
						color='blue'
						className='absolute z-10 -ml-2 -mt-4 h-[18px] rounded-xl text-[8px]'
					>
						Multi
					</Tag>
				)}
				<Address
					usernameClassName={addressTextClassName}
					extensionName={dropdownList[selectedAddress]}
					address={defaultAddress || selectedAddress}
					addressOtherTextType={getOtherTextType(
						filteredAccounts.find(
							(account) => account.address === getSubstrateAddress(selectedAddress) || getSubstrateAddress(account.address) === getSubstrateAddress(defaultAddress || '')
						)
					)}
					className={`flex flex-1 items-center ${isMultisig ? 'ml-4' : ''}`}
					addressClassName='text-lightBlue'
					disableAddressClick
					isTruncateUsername={isTruncateUsername}
				/>
				<span className='mx-2 mb-1'>
					<DownIcon />
				</span>
			</div>
		</Dropdown>
	);
};

export default AddressDropdown;
