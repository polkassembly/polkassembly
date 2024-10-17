// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { MenuProps } from 'antd';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import { poppins } from 'pages/_app';
import React, { useState } from 'react';
import ThreeDotsIcon from '~assets/icons/three-dots.svg';
import Skeleton from '~src/basic-components/Skeleton';
import { Dropdown } from '~src/ui-components/Dropdown';

const AddressConnectModal = dynamic(() => import('~src/ui-components/AddressConnectModal'), {
	loading: () => <Skeleton active />,
	ssr: false
});

const OnchainIdentity = dynamic(() => import('~src/components/OnchainIdentity'), {
	ssr: false
});

const AddressActionDropdown = ({ address }: { address: string }) => {
	const { resolvedTheme: theme } = useTheme();
	const [isDropdownActive, setIsDropdownActive] = useState(false);
	const [openAddressLinkModal, setOpenAddressLinkModal] = useState<boolean>(false);
	const [openSetIdentityModal, setOpenSetIdentityModal] = useState(false);
	const [openAddressLinkedModal, setOpenAddressLinkedModal] = useState<boolean>(false);

	const items: MenuProps['items'] = [
		{
			key: '1',
			label: (
				<div
					onClick={() => setOpenAddressLinkModal(true)}
					className='mt-1 flex items-center space-x-2'
				>
					<span className={`${poppins.className} ${poppins.variable} text-sm text-blue-light-medium dark:text-blue-dark-medium`}>Link Address</span>
				</div>
			)
		},
		{
			key: '2',
			label: (
				<div className='mt-1 flex items-center space-x-2'>
					<span className={`${poppins.className} ${poppins.variable} text-sm text-blue-light-medium dark:text-blue-dark-medium`}>Add Proxy</span>
				</div>
			)
		},
		{
			key: '3',
			label: (
				<div
					onClick={() => (!address ? setOpenAddressLinkedModal(true) : setOpenSetIdentityModal(true))}
					className='mt-1 flex items-center space-x-2'
				>
					<span className={`${poppins.className} ${poppins.variable} text-sm text-blue-light-medium dark:text-blue-dark-medium`}>Set Identity</span>
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
					theme === 'dark' ? 'border-none bg-section-dark-overlay' : isDropdownActive ? 'bg-section-light-container' : 'bg-white'
				}`}
				overlayClassName='z-[1056]'
				placement='bottomRight'
				menu={{ items }}
				onOpenChange={() => setIsDropdownActive(!isDropdownActive)}
			>
				<span className=' dark:bg-section-dark-background'>
					<ThreeDotsIcon />
				</span>
			</Dropdown>
			<AddressConnectModal
				linkAddressNeeded
				open={openAddressLinkModal}
				setOpen={setOpenAddressLinkModal}
				closable
				onConfirm={() => setOpenAddressLinkModal(false)}
				usedInIdentityFlow={false}
			/>
			<OnchainIdentity
				open={openSetIdentityModal}
				setOpen={setOpenSetIdentityModal}
				openAddressModal={openAddressLinkedModal}
				setOpenAddressModal={setOpenAddressLinkedModal}
			/>
		</div>
	);
};

export default AddressActionDropdown;
