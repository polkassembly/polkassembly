// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import AddressesComponent from './AddressesComponent';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { useUserDetailsSelector } from '~src/redux/selectors';
import Image from 'next/image';
import ProxyMain from '~src/components/createProxy';
import { dmSans } from 'pages/_app';

const AccountsMain = () => {
	const { id } = useUserDetailsSelector();
	const [openProxyModal, setOpenProxyModal] = useState<boolean>(false);
	return (
		<div>
			<div className='flex items-center justify-between'>
				<h2 className={`${dmSans.className} ${dmSans.variable} text-2xl font-semibold text-blue-light-high dark:text-blue-dark-high md:text-[28px]`}>Accounts</h2>{' '}
				{id && (
					<CustomButton
						variant='link'
						className={`px-2 text-xs font-normal ${!id && 'opacity-50'}`}
						onClick={() => setOpenProxyModal(true)}
						disabled={!id}
						height={42}
						width={178}
						buttonsize={'14'}
					>
						<div className='flex items-center gap-[6px]'>
							<Image
								src={'/assets/icons/proxy-main.svg'}
								alt='search-icon'
								className=''
								height={18}
								width={18}
								priority={true}
							/>
							<span className={' text-sm font-medium'}>Add Proxy</span>
						</div>
					</CustomButton>
				)}
			</div>
			{/* <Alert
				showIcon
				type='warning'
				className='mt-2 px-4 py-2'
				description={
					<span className={`${poppins.className} ${poppins.variable} text-sm text-blue-light-high dark:text-blue-dark-high`}>To view all accounts from polkadot.js wallet</span>
				}
			/> */}
			<AddressesComponent />
			<ProxyMain
				openProxyModal={openProxyModal}
				setOpenProxyModal={setOpenProxyModal}
			/>
		</div>
	);
};

export default AccountsMain;
