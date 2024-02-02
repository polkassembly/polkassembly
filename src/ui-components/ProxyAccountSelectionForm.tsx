// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Dropdown } from '~src/ui-components/Dropdown';
import React from 'react';
import { ItemType } from 'antd/es/menu/hooks/useItems';
import Address from './Address';
import { poppins } from 'pages/_app';
import DownIcon from '~assets/icons/down-icon.svg';
import styled from 'styled-components';
import Balance from '~src/components/Balance';
import { Button } from 'antd';

interface Props {
	proxyAddresses: string[];
	className?: string;
	theme?: string;
	withBalance?: boolean;
	address?: string;
	onBalanceChange?: (balance: string) => void;
	isBalanceUpdated?: boolean;
}

const ProxyAccountSelectionForm = ({ isBalanceUpdated, onBalanceChange, withBalance, address, proxyAddresses, className, theme }: Props) => {
	console.log(proxyAddresses);
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

	return (
		<article className='mt-2 flex w-full flex-col'>
			<div className='mb-1 ml-[-6px] flex items-center gap-x-2'>
				<h3 className='inner-headings mb-[1px] ml-1.5 dark:text-blue-dark-medium'>Vote with Proxy</h3>
				{/* {!withoutInfo && (
							<HelperTooltip
								className='-mt-1 dark:text-grey_primary'
								text='You can choose an account from the extension.'
							/>
						)} */}
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
				className={' proxyDropdown dark:border-separatorDark'}
				wrapClassName={`${className}`}
				menu={{ items: dropdownMenuItems }}
				theme={theme}
				style={{ border: '1px solid #d2d8e0' }}
			>
				<div className='flex items-center justify-between '>
					<Address
						address={proxyAddresses[0]}
						className='flex flex-1 items-center'
						addressClassName='text-lightBlue text-xs dark:text-blue-dark-medium'
						disableAddressClick
						disableTooltip
					/>
					<Button className='flex h-[25px] items-center border bg-transparent text-xs text-bodyBlue'>Change Wallet</Button>
					<span className='mx-2 mb-1'>
						<DownIcon />
					</span>
				</div>
			</Dropdown>
		</article>
	);
};

export default styled(ProxyAccountSelectionForm)`
	.ant-dropdown-trigger {
		border: ${(props) => (props.theme == 'dark' ? '1px solid #4B4B4B' : '1px solid #d2d8e0')} !important;
	}
`;
