// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { DownOutlined } from '@ant-design/icons';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { Dropdown } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import React, { useState } from 'react';
import Address from 'src/ui-components/Address';

interface Props {
	defaultAddress?: string;
  accounts: InjectedAccount[];
  className?: string;
  filterAccounts?: string[]
  onAccountChange: (address: string) => void;
}

const AddressDropdown = ({
	defaultAddress,
	className = 'px-3 py-1 border-solid border-gray-300 border-2 rounded-md',
	accounts,
	filterAccounts,
	onAccountChange
}: Props) => {
	const [selectedAddress, setSelectedAddress] = useState(defaultAddress || '');
	const filteredAccounts = !filterAccounts
		? accounts
		: accounts.filter( elem =>
			filterAccounts.includes(elem.address)
		);

	const dropdownList: {[index: string]: string} = {};
	const addressItems: ItemType[] = [];

	filteredAccounts.forEach(account => {
		addressItems.push({
			key: account.address,
			label: (
				<Address disableAddressClick={true} extensionName={account.name} address={account.address} />
			)
		});

		if (account.address && account.name){
			dropdownList[account.address] = account.name;
		}
	}
	);
	return (
		<Dropdown
			trigger={['click']}
			className={className}

			menu={{
				items: addressItems,
				onClick: (e) => {
					setSelectedAddress(e.key);
					onAccountChange(e.key);
				}
			}}
		>
			<div className="flex justify-between items-center">
				<Address
					disableAddressClick={true}
					extensionName={dropdownList[selectedAddress]}
					address={selectedAddress}
				/>
				<span>
					<DownOutlined />
				</span>
			</div>
		</Dropdown>
	);
};

export default AddressDropdown;
