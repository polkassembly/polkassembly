// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { Button, Dropdown } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { poppins } from 'pages/_app';
import React, { useState } from 'react';
import Address from 'src/ui-components/Address';
import { useUserDetailsContext } from '~src/context';
import DownIcon from '~assets/icons/down-icon.svg';

interface Props {
	defaultAddress?: string;
  accounts: InjectedAccount[];
  className?: string;
  filterAccounts?: string[]
  onAccountChange: (address: string) => void;
  isDisabled?: boolean;
  isSwitchButton?: boolean;
  setSwitchModalOpen?: (pre: boolean)=> void;
}

const AddressDropdown = ({
	defaultAddress,
	className = 'px-3 py-1 border-solid border-gray-300 border-[1px] rounded-md h-[48px]',
	accounts,
	filterAccounts,
	isDisabled,
	onAccountChange,
	isSwitchButton,
	setSwitchModalOpen
}: Props) => {
	const [selectedAddress, setSelectedAddress] = useState(defaultAddress || '');
	const filteredAccounts = !filterAccounts
		? accounts
		: accounts.filter( elem =>
			filterAccounts.includes(elem.address)
		);

	const dropdownList: {[index: string]: string} = {};
	const addressItems: ItemType[] = [];
	const { setUserDetailsContextState, loginAddress } = useUserDetailsContext();

	filteredAccounts.forEach(account => {
		addressItems.push({
			key: account.address,
			label: (
				<Address disableAddressClick={true} className='flex items-center' otherText={account.address.toLowerCase() === (loginAddress || '').toLowerCase()? 'Logged in address': ''} otherTextClassName='ml-auto' extensionName={account.name} address={account.address} />
			),
			title: account.address.toLowerCase() === (loginAddress || '').toLowerCase()? 'Logged in address': ''
		});

		if (account.address && account.name){
			dropdownList[account.address] = account.name;
		}
	}
	);

	isSwitchButton && setSwitchModalOpen && addressItems.push({
		key: 1,
		label: (
			<div className='flex items-center justify-center mt-2'>
				<Button onClick={() => setSwitchModalOpen(true)} className={`w-[164px] h-[40px] rounded-[8px] text-sm text-[#fff] bg-pink_primary font-medium flex justify-center items-center ${poppins.variable} ${poppins.className}`}>Switch Wallet</Button>
			</div>
		)
	});
	return (
		<Dropdown
			trigger={['click']}
			className={className}
			disabled={isDisabled}
			menu={{
				items: addressItems,
				onClick: (e) => {
					if(e.key !== '1'){
						setSelectedAddress(e.key);
						onAccountChange(e.key);
						setSwitchModalOpen && setUserDetailsContextState((prev) =>
						{
							return { ...prev, delegationDashboardAddress: e.key };
						});}
				}
			}}
		>
			<div className="flex justify-between items-center ">

				<Address
					disableAddressClick={true}
					extensionName={dropdownList[selectedAddress]}
					address={defaultAddress || selectedAddress}
				/>
				<span>
					<DownIcon className='mr-2'/>
				</span>
			</div>
		</Dropdown>
	);
};

export default AddressDropdown;
