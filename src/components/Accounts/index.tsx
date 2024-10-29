// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { poppins } from 'pages/_app';
import React from 'react';
import AddressesComponent from './AddressesComponent';

const AccountsMain = () => {
	return (
		<div>
			<div className='flex items-center justify-between'>
				<h2 className={`${poppins.className} ${poppins.variable} text-2xl font-semibold text-blue-light-high dark:text-blue-dark-high md:text-[28px]`}>Accounts</h2>{' '}
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
		</div>
	);
};

export default AccountsMain;
