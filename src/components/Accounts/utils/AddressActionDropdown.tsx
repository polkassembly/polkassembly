// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
import { MenuProps } from 'antd';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import ThreeDotsIcon from '~assets/icons/three-dots.svg';
import ProxyMain from '~src/components/createProxy';
import { Dropdown } from '~src/ui-components/Dropdown';

const AddressConnectModal = dynamic(() => import('~src/ui-components/AddressConnectModal'), {
	ssr: false
});

const AddressActionDropdown = () => {
	const { resolvedTheme: theme } = useTheme();
	const [state, setState] = useState({
		isDropdownActive: false,
		openAddressLinkModal: false,
		openAddressLinkedModal: false,
		openSetIdentityModal: false,
		openProxyModal: false
	});

	const items: MenuProps['items'] = [
		{
			key: '1',
			label: (
				<div
					onClick={() => setState((prevState) => ({ ...prevState, openAddressLinkModal: true }))}
					className='mt-1 flex items-center space-x-2'
				>
					<span className={' text-sm text-blue-light-medium dark:text-blue-dark-medium'}>Link Address</span>
				</div>
			)
		},
		{
			key: '2',
			label: (
				<div
					onClick={() => setState((prevState) => ({ ...prevState, openProxyModal: true }))}
					className='mt-1 flex items-center space-x-2'
				>
					<span className={' text-sm text-blue-light-medium dark:text-blue-dark-medium'}>Add Proxy</span>
				</div>
			)
		}
	];

	return (
		<div className='rounded-lg border border-solid border-[#F5F5F5] dark:border-separatorDark'>
			<Dropdown
				theme={theme}
				overlayStyle={{ marginTop: '20px' }}
				className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-solid border-section-light-container dark:border-separatorDark ${
					theme === 'dark' ? 'border-none bg-section-dark-overlay' : state.isDropdownActive ? 'bg-section-light-container' : 'bg-white'
				}`}
				overlayClassName='z-[1056]'
				placement='bottomRight'
				menu={{ items }}
				onOpenChange={() => setState((prevState) => ({ ...prevState, isDropdownActive: !prevState.isDropdownActive }))}
			>
				<span className=' dark:bg-section-dark-background'>
					<ThreeDotsIcon />
				</span>
			</Dropdown>
			<AddressConnectModal
				linkAddressNeeded
				open={state.openAddressLinkModal}
				setOpen={(open) => setState((prevState) => ({ ...prevState, openAddressLinkModal: open }))}
				closable
				onConfirm={() => setState((prevState) => ({ ...prevState, openAddressLinkModal: false }))}
				usedInIdentityFlow={false}
			/>
			<ProxyMain
				openProxyModal={state.openProxyModal}
				setOpenProxyModal={(open) => setState((prevState) => ({ ...prevState, openProxyModal: open }))}
			/>
		</div>
	);
};

export default AddressActionDropdown;
