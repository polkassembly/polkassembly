import { poppins } from 'pages/_app';
import React from 'react';
import BalanceDetails from './utils/BalanceDetails';
import Image from 'next/image';
import { Button } from 'antd';
import SendFundsComponent from './utils/SendFundsComponent';
import AddressActionDropdown from './utils/AddressActionDropdown';

const AddressesComponent = () => {
	return (
		<section>
			<h3 className='mt-5 text-2xl font-semibold text-blue-light-high dark:text-blue-dark-high'>Addresses</h3>
			<div
				className={`${poppins.className} ${poppins.variable} flex w-full items-center justify-between rounded-md bg-white p-3 drop-shadow-md dark:bg-section-dark-overlay lg:p-6`}
			>
				<div>
					<span>Paste here Address</span>
					<BalanceDetails />
				</div>
				<div className='flex items-center gap-2'>
					<SendFundsComponent />
					<AddressActionDropdown />
				</div>
			</div>
			<div
				className={`${poppins.className} ${poppins.variable} mt-5 flex w-full items-center justify-between rounded-md bg-white p-3 drop-shadow-md dark:bg-section-dark-overlay lg:p-6`}
			>
				<div>
					<span>Proxy Address</span>
					<BalanceDetails />
				</div>
				<div className='flex items-center gap-2'>
					<SendFundsComponent />
					<AddressActionDropdown />
				</div>
			</div>
			<h3 className='mt-5 text-2xl font-semibold text-blue-light-high dark:text-blue-dark-high'>Multisigs</h3>
			<div
				className={`${poppins.className} ${poppins.variable} mt-5 flex w-full items-center justify-between rounded-md bg-white p-3 drop-shadow-md dark:bg-section-dark-overlay lg:p-6`}
			>
				<div>
					<span> Multisig Address</span>
					<BalanceDetails />
				</div>
				<div className='flex items-center gap-2'>
					<SendFundsComponent />
					<AddressActionDropdown />
				</div>
			</div>
		</section>
	);
};

export default AddressesComponent;
