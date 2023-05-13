// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { InjectedAccount } from '@polkadot/extension-inject/types';
import React from 'react';
import Balance from 'src/components/Balance';

import AddressDropdown from './AddressDropdown';
import HelperTooltip from './HelperTooltip';
import styled from 'styled-components';

interface Props{
	accounts: InjectedAccount[]
	address: string
	onAccountChange: (address: string) => void
	title?: string
	withBalance?: boolean
	onBalanceChange?: (balance: string) => void
  className?: string;
  isDisabled?: boolean;
  inputClassName?: string;
  isSwitchButton?: boolean,
	setSwitchModalOpen?: (pre: boolean) => void;
  withoutInfo?: boolean;
}

const AccountSelectionForm = ({ accounts, address, onAccountChange, title, withBalance = false, onBalanceChange,className }: Props) =>
	<article className={`w-full flex flex-col ${className}`}>
		<div className='flex items-center gap-x-2 ml-[-6px]'>
			<h3 className='inner-headings mb-0 ml-1'>{title}</h3>
			{address && withBalance &&
			<Balance address={address} onChange={onBalanceChange} />
			}
		</div>
		<AddressDropdown
			isDisabled={isDisabled}
			accounts={accounts}
			defaultAddress={address}
			onAccountChange={onAccountChange}
			className={inputClassName}
			isSwitchButton={isSwitchButton}
			setSwitchModalOpen={setSwitchModalOpen}
		/>

	</article>;

export default styled(AccountSelectionForm)`
.ant-dropdown-trigger{
	height: 39.85px !important;
border: 1px solid #F8E3EE !important;
border-radius: 7px !important;

font-family: 'Poppins'  !important;
font-style: normal !important;
font-weight: 500 !important;
font-size: 14px !important;
line-height: 21px !important;
color: #90A0B7 !important;

}
.anticon-down{
	color: #E5007A;
}
`;