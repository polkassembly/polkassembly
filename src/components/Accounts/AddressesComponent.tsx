// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { poppins } from 'pages/_app';
import React, { useEffect, useState } from 'react';
import BalanceDetails from './utils/BalanceDetails';
import SendFundsComponent from './utils/SendFundsComponent';
import AddressActionDropdown from './utils/AddressActionDropdown';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IAccountData } from '~src/types';
import Address from '~src/ui-components/Address';
import AddressComponent from './utils/AddressComponent';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { Spin } from 'antd';

const AddressesComponent = () => {
	const userDetails = useUserDetailsSelector();
	const { loginAddress } = userDetails;
	const [accountData, setAccountData] = useState<IAccountData | null>(null);
	const [isMultisigAddress, setIsMultisigAddress] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const fetchData = async () => {
		setIsLoading(true);
		const { data, error } = await nextApiClientFetch<{ data: { account: IAccountData } }>('api/v1/accounts', { address: '5HLNsGxpwQrV5ZfHAjZsHkjQJA7gKyFsYMTmzAjeG8s1pbvM' });

		if (error || !data) {
			console.log('Error While fetching accounts');
		}
		if (data?.data?.account) {
			console.log('data', data?.data?.account);
			setAccountData(data?.data?.account);
			setIsMultisigAddress(data?.data?.account?.multisig?.multi_account_member?.length > 0);
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	return (
		<section>
			<h3 className='mt-5 text-2xl font-semibold text-blue-light-high dark:text-blue-dark-high'>{isMultisigAddress ? 'Multisig Address' : 'Addresses'}</h3>
			<Spin spinning={isLoading}>
				<div className={`${poppins.className} ${poppins.variable} w-full rounded-[14px] bg-white p-2 drop-shadow-md dark:bg-section-dark-overlay lg:p-4`}>
					<div className='relative flex w-full items-start justify-between '>
						<div>
							{accountData?.address && (
								<div className=''>
									{' '}
									<Address
										address={accountData?.address}
										displayInline
										iconSize={90}
										isUsedInAccountsPage={true}
										isTruncateUsername={false}
									/>
								</div>
							)}
						</div>
						<div className='flex items-center gap-2'>
							{accountData?.address && loginAddress != accountData?.address && <SendFundsComponent address={accountData?.address} />}
							{accountData?.address && <AddressActionDropdown address={loginAddress || accountData.address} />}
						</div>
						<span className='absolute left-[104px] top-10'>
							<BalanceDetails address={accountData?.address ? accountData.address : loginAddress} />
						</span>
					</div>
					{accountData?.multisig?.multi_account_member && (
						<div
							className={`${poppins.className} ${poppins.variable} mt-5 w-full rounded-[14px] border border-solid border-[#F6F8FA] bg-[#F6F8FA] p-2 dark:border-separatorDark dark:bg-section-dark-background lg:p-4`}
						>
							<h3 className=' text-xl font-semibold text-blue-light-high dark:text-blue-dark-high'>Signatories</h3>
							{/* MultiSig addressess */}
							{accountData?.multisig?.multi_account_member?.length > 0 && (
								<div>
									{accountData?.multisig?.multi_account_member.map((signatories, index) => {
										return (
											<div key={index}>
												<AddressComponent
													address={signatories?.address}
													isMultisigAddress={true}
												/>
											</div>
										);
									})}
								</div>
							)}
						</div>
					)}
					<div
						className={`${poppins.className} ${poppins.variable} mt-5 w-full rounded-[14px] border border-solid border-[#F6F8FA] bg-[#F6F8FA] p-2 dark:border-separatorDark dark:bg-section-dark-background lg:p-4`}
					>
						<h3 className=' text-xl font-semibold text-blue-light-high dark:text-blue-dark-high'>Proxy</h3>

						{accountData?.proxy && (
							<div className='flex w-full flex-col '>
								{/* Pure Proxy Addresses */}
								{accountData?.proxy?.real_account?.length > 0 && (
									<div>
										{accountData?.proxy?.real_account.map((realAccount, index) => {
											return (
												<div key={index}>
													<AddressComponent
														address={realAccount?.account_display?.address}
														proxyType={realAccount?.proxy_type}
														isPureProxy={true}
													/>
												</div>
											);
										})}
									</div>
								)}

								{/* Proxy Addresses */}
								{accountData?.proxy?.proxy_account?.length > 0 && (
									<div>
										{accountData.proxy.proxy_account.map((proxyAccount, index) => {
											return (
												<div key={index}>
													<AddressComponent
														address={proxyAccount?.account_display?.address}
														proxyType={proxyAccount?.proxy_type}
													/>
												</div>
											);
										})}
									</div>
								)}
							</div>
						)}

						{/* <Alert
						message={'this is the text here'}
						type='info'
						showIcon
						className='mt-3 rounded-md border-none dark:bg-infoAlertBgDark'
					/> */}
					</div>
				</div>
				{accountData?.multisig?.multi_account && accountData?.multisig?.multi_account.length > 0 && (
					<>
						<h3 className='mt-5 text-2xl font-semibold text-blue-light-high dark:text-blue-dark-high'>Multisigs</h3>
						<div>
							{accountData?.multisig?.multi_account.map((multisigAddress, index) => {
								return (
									<div key={index}>
										<AddressComponent address={multisigAddress?.address} />
									</div>
								);
							})}
						</div>
					</>
				)}
			</Spin>
		</section>
	);
};

export default AddressesComponent;
