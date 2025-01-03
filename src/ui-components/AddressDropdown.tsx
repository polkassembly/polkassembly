// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { Tag } from 'antd';
import { Dropdown } from '~src/ui-components/Dropdown';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { dmSans } from 'pages/_app';
import React, { useState } from 'react';
import Address from 'src/ui-components/Address';
import DownIcon from '~assets/icons/down-icon.svg';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { EAddressOtherTextType } from '~src/types';
import { useDispatch } from 'react-redux';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { userDetailsActions } from '~src/redux/userDetails';
import classNames from 'classnames';

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
	showProxyDropdown?: boolean;
}

const AddressDropdown = ({
	defaultAddress,
	className = 'px-3 py-1 border-solid border-gray-300 dark:border-[#3B444F] dark:border-separatorDark border-[1px] rounded-md h-[48px]',
	accounts,
	filterAccounts,
	isDisabled,
	onAccountChange,
	isSwitchButton,
	setSwitchModalOpen,
	isMultisig,
	linkAddressTextDisabled = false,
	addressTextClassName,
	isTruncateUsername = true,
	showProxyDropdown
}: Props) => {
	const [selectedAddress, setSelectedAddress] = useState(defaultAddress || '');
	const filteredAccounts = !filterAccounts ? accounts : accounts.filter((elem) => filterAccounts.includes(elem.address));
	const dropdownList: { [index: string]: string } = {};
	const addressItems: ItemType[] = [];
	const currentUser = useUserDetailsSelector();
	const { addresses } = currentUser;
	const dispatch = useDispatch();
	const substrate_address = getSubstrateAddress(selectedAddress || '');
	const substrate_addresses = (addresses || []).map((address) => getSubstrateAddress(address));
	const { resolvedTheme: theme } = useTheme();
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
					className={`flex items-center ${dmSans.className} ${dmSans.className}`}
					addressOtherTextType={getOtherTextType(account)}
					addressClassName='text-lightBlue text-xs dark:text-blue-dark-medium'
					extensionName={account.name}
					address={account.address}
					disableAddressClick
					isTruncateUsername={isTruncateUsername}
					disableTooltip
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
					<CustomButton
						variant='primary'
						onClick={() => setSwitchModalOpen(true)}
						text='Switch Wallet'
						className={`w-full ${dmSans.variable} ${dmSans.className}`}
					/>
				</div>
			)
		});
	return (
		<Dropdown
			theme={theme}
			trigger={['click']}
			className={`${className} dark:border-separatorDark ${isDisabled || showProxyDropdown ? 'cursor-not-allowed opacity-70' : ''}`}
			disabled={isDisabled || showProxyDropdown}
			overlayClassName='z-[2000]'
			menu={{
				items: addressItems,
				onClick: (e: any) => {
					if (e.key !== '1') {
						setSelectedAddress(e.key);
						onAccountChange(e.key);
						if (setSwitchModalOpen) {
							dispatch(userDetailsActions.updateDelegationDashboardAddress(e?.key));
						}
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
					addressClassName={classNames('text-lightBlue text-xs dark:text-blue-dark-medium', isSwitchButton ? 'text-white' : '')}
					disableAddressClick
					isTruncateUsername={isTruncateUsername}
					disableTooltip
				/>
				<span className='mx-2 mb-1'>
					<DownIcon />
				</span>
			</div>
		</Dropdown>
	);
};

export default AddressDropdown;
