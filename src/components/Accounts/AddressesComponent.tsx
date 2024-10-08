import { poppins } from 'pages/_app';
import React, { useEffect, useState } from 'react';
import BalanceDetails from './utils/BalanceDetails';
import Image from 'next/image';
import { Button } from 'antd';
import SendFundsComponent from './utils/SendFundsComponent';
import AddressActionDropdown from './utils/AddressActionDropdown';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IAccountData } from '~src/types';
import Address from '~src/ui-components/Address';
import Alert from '~src/basic-components/Alert';

const AddressesComponent = () => {
	const [accountData, setAccountData] = useState<IAccountData | null>(null);

	const fetchData = async () => {
		const { data, error } = await nextApiClientFetch<{ data: { account: IAccountData } }>('api/v1/accounts', { address: '5EZX2urgRBbSFk1oCJ3PdkFB35nbB8rXhnTTqWDwhsyvLC2j' });

		if (error || !data) {
			console.log('Error While fetching accounts');
		}
		if (data?.data?.account) {
			console.log('data', data?.data?.account);
			setAccountData(data?.data?.account);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	return (
		<section>
			<h3 className='mt-5 text-2xl font-semibold text-blue-light-high dark:text-blue-dark-high'>Addresses</h3>
			<div className={`${poppins.className} ${poppins.variable} w-full rounded-[14px] bg-white p-2 drop-shadow-md dark:bg-section-dark-overlay lg:p-4`}>
				<div className='flex w-full items-center justify-between '>
					<div>
						{accountData?.address && (
							<Address
								address={accountData?.address}
								displayInline
								iconSize={18}
								isTruncateUsername={false}
							/>
						)}
						<BalanceDetails />
					</div>
					<div className='flex items-center gap-2'>
						<SendFundsComponent />
						<AddressActionDropdown />
					</div>
				</div>
				<div className={`${poppins.className} ${poppins.variable} mt-5 w-full rounded-[14px] bg-[#F6F8FA] p-2 dark:bg-section-dark-overlay lg:p-4`}>
					<h3 className=' text-xl font-semibold text-blue-light-high dark:text-blue-dark-high'>Proxy</h3>

					{accountData?.proxy && (
						<div className='flex w-full flex-col gap-4'>
							{accountData?.proxy?.proxy_account?.length > 0 && (
								<div className='w-full rounded-[14px] border border-solid border-[#D2D8E0] bg-white p-4'>
									<h3 className='mb-2 font-bold'>Proxy Accounts</h3>
									{accountData.proxy.proxy_account.map((proxyAccount, index) => (
										<div
											key={index}
											className='mb-2 flex items-center justify-between'
										>
											<div>
												{proxyAccount.account_display?.address && (
													<Address
														address={proxyAccount.account_display.address}
														displayInline
														iconSize={18}
														isTruncateUsername={false}
													/>
												)}
											</div>
											<BalanceDetails />
										</div>
									))}
								</div>
							)}

							{accountData?.proxy?.real_account?.length > 0 && (
								<div className='w-full rounded-[14px] border border-solid border-[#D2D8E0] bg-white p-4'>
									<h3 className='mb-2 font-bold'>Real Accounts</h3>
									{accountData.proxy.real_account.map((realAccount, index) => (
										<div
											key={index}
											className='mb-2 flex items-center justify-between'
										>
											<div>
												{realAccount.account_display?.address && (
													<Address
														address={realAccount.account_display.address}
														displayInline
														iconSize={18}
														isTruncateUsername={false}
													/>
												)}
											</div>
											<BalanceDetails />
										</div>
									))}
								</div>
							)}
						</div>
					)}

					<Alert
						message={'this is the text here'}
						type='info'
						showIcon
						className='mt-3 rounded-md border-none dark:bg-infoAlertBgDark'
					/>
				</div>
			</div>

			<h3 className='mt-5 text-2xl font-semibold text-blue-light-high dark:text-blue-dark-high'>Multisigs</h3>
			<div
				className={`${poppins.className} ${poppins.variable} mt-5 flex w-full items-center justify-between rounded-[14px] bg-white p-2 drop-shadow-md dark:bg-section-dark-overlay lg:p-4`}
			>
				<div>
					<span> Multisig Address</span>
					{accountData?.multisig?.multi_account?.[0].address && (
						<Address
							address={accountData?.multisig?.multi_account?.[0].address}
							displayInline
							iconSize={18}
							isTruncateUsername={false}
						/>
					)}
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
