// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { InjectedAccount } from '@polkadot/extension-inject/types';
import React from 'react';
import Balance from 'src/components/Balance';

import AddressDropdown from './AddressDropdown';
import HelperTooltip from './HelperTooltip';

interface Props{
	accounts: InjectedAccount[]
	address: string
	onAccountChange: (address: string) => void
	title: string
	withBalance?: boolean
	onBalanceChange?: (balance: string) => void
}

const AccountSelectionForm = ({ accounts, address, onAccountChange, title, withBalance = false, onBalanceChange }: Props) =>
	<article className='w-full gap-y-2 flex flex-col p-2'>
		<div className='flex items-center gap-x-2'>
			<h3 className='text-sm mb-0'>{title}</h3>
			<HelperTooltip text='You can choose an account from the extension.' />
		</div>
		<AddressDropdown
			accounts={accounts}
			defaultAddress={address}
			onAccountChange={onAccountChange}
		/>
		{address && withBalance &&
			<Balance address={address} onChange={onBalanceChange} />
		}
	</article>;

export default AccountSelectionForm;