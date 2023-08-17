// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { InjectedAccount } from '@polkadot/extension-inject/types';
import React, { useEffect, useState } from 'react';
import Balance from 'src/components/Balance';

import AddressDropdown from './AddressDropdown';
import styled from 'styled-components';
import HelperTooltip from './HelperTooltip';
import { checkIsAddressMultisig } from '~src/components/DelegationDashboard/utils/checkIsAddressMultisig';

interface Props {
	accounts: InjectedAccount[]
	address: string
	onAccountChange: (address: string) => void
	title?: string
	withBalance?: boolean
	isBalanceUpdated?: boolean
	onBalanceChange?: (balance: string) => void
	className?: string;
	isDisabled?: boolean;
	inputClassName?: string;
	isSwitchButton?: boolean,
	setSwitchModalOpen?: (pre: boolean) => void;
	withoutInfo?: boolean;
	linkAddressTextDisabled?: boolean;
}

const AccountSelectionForm = ({ accounts, address, onAccountChange, title, withBalance = false, onBalanceChange, className, isBalanceUpdated, isDisabled, inputClassName, isSwitchButton, setSwitchModalOpen, withoutInfo, linkAddressTextDisabled= false }: Props) => {

	const [isSelectedAddressMultisig, setIsSelectedAddressMultisig] = useState(false);
	useEffect(() => {
		setIsSelectedAddressMultisig(false);
		if(address){
			checkIsAddressMultisig(address).then((isMulti) => setIsSelectedAddressMultisig(isMulti));
		}
	},[address]);
	return (
		<article className={`w-full flex flex-col ${className}`}>
			<div className='flex items-center gap-x-2 ml-[-6px]'>
				<h3 className='inner-headings mb-[2px] ml-1.5'>{title}</h3>
				{!withoutInfo && <HelperTooltip text='You can choose an account from the extension.' />}
				{address && withBalance &&
				<Balance address={address} onChange={onBalanceChange} isBalanceUpdated={isBalanceUpdated} />
				}
			</div>
			<AddressDropdown
				linkAddressTextDisabled ={linkAddressTextDisabled}
				isDisabled={isDisabled}
				accounts={accounts}
				defaultAddress={address}
				onAccountChange={onAccountChange}
				className={inputClassName}
				isSwitchButton={isSwitchButton}
				setSwitchModalOpen={setSwitchModalOpen}
				isMultisig={isSelectedAddressMultisig}
			/>
		</article>
	);
};
export default styled(AccountSelectionForm)`
.ant-dropdown-trigger{
	border: 1px solid #D2D8E0 !important;
}

`;