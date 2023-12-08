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
	accounts: InjectedAccount[];
	address: string;
	onAccountChange: (address: string) => void;
	title?: string;
	withBalance?: boolean;
	isBalanceUpdated?: boolean;
	onBalanceChange?: (balance: string) => void;
	className?: string;
	isDisabled?: boolean;
	inputClassName?: string;
	isSwitchButton?: boolean;
	setSwitchModalOpen?: (pre: boolean) => void;
	withoutInfo?: boolean;
	linkAddressTextDisabled?: boolean;
	addressTextClassName?: string;
	isTruncateUsername?: boolean;
	theme?: string;
}

const AccountSelectionForm = ({
	accounts,
	address,
	onAccountChange,
	title,
	withBalance = false,
	onBalanceChange,
	className,
	isBalanceUpdated,
	isDisabled,
	inputClassName,
	isSwitchButton,
	setSwitchModalOpen,
	withoutInfo,
	linkAddressTextDisabled = false,
	addressTextClassName,
	isTruncateUsername = true,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	theme
}: Props) => {
	const [isSelectedAddressMultisig, setIsSelectedAddressMultisig] = useState(false);
	useEffect(() => {
		setIsSelectedAddressMultisig(false);
		if (address) {
			checkIsAddressMultisig(address).then((isMulti) => setIsSelectedAddressMultisig(isMulti));
		}
	}, [address]);
	return (
		<article className={`flex w-full flex-col ${className}`}>
			<div className='mb-1 ml-[-6px] flex items-center gap-x-2'>
				<h3 className='inner-headings mb-[1px] ml-1.5 dark:text-blue-dark-medium'>{title}</h3>
				{!withoutInfo && (
					<HelperTooltip
						className='-mt-1 dark:text-grey_primary'
						text='You can choose an account from the extension.'
					/>
				)}
				{address && withBalance && (
					<Balance
						address={address}
						onChange={onBalanceChange}
						isBalanceUpdated={isBalanceUpdated}
					/>
				)}
			</div>
			<AddressDropdown
				addressTextClassName={addressTextClassName}
				linkAddressTextDisabled={linkAddressTextDisabled}
				isDisabled={isDisabled}
				accounts={accounts}
				defaultAddress={address}
				onAccountChange={onAccountChange}
				className={inputClassName}
				isSwitchButton={isSwitchButton}
				setSwitchModalOpen={setSwitchModalOpen}
				isMultisig={isSelectedAddressMultisig}
				isTruncateUsername={isTruncateUsername}
			/>
		</article>
	);
};
export default styled(AccountSelectionForm)`
	.ant-dropdown-trigger {
		border: ${(props) => (props.theme == 'dark' ? '1px solid #4B4B4B' : '1px solid #d2d8e0')} !important;
	}
`;
