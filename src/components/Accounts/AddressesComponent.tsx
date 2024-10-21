// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IAccountData } from '~src/types';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { Spin } from 'antd';
import ImageIcon from '~src/ui-components/ImageIcon';
import ErrorAlert from '~src/ui-components/ErrorAlert';
import AccountInfo from './AccountInfo';
import ProxyDetails from './ProxyDetails';
import Signatories from './Signatories';
import MultisigDetails from './MultisigDetails';

const AddressesComponent = () => {
	const userDetails = useUserDetailsSelector();
	const { loginAddress } = userDetails;
	const [accountData, setAccountData] = useState<IAccountData | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const fetchData = async () => {
		setIsLoading(true);
		try {
			const { data, error } = await nextApiClientFetch<{ data: { account: IAccountData } }>('api/v1/accounts', {
				address: loginAddress
			});

			if (error || !data) {
				console.error('Error while fetching accounts', error);
				return;
			}

			if (data?.data?.account) {
				setAccountData(data?.data?.account);
			}
		} catch (err) {
			console.error('An error occurred while fetching data:', err);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loginAddress]);

	if (!accountData) {
		return (
			<div className='mx-auto max-w-[600px]'>
				<ErrorAlert
					className={'my-5 dark:text-white'}
					errorMsg='Something went wrong while fetching Accounts data.'
				/>
				<ImageIcon
					src='/assets/user-not-found.svg'
					alt='user not found icon'
					imgWrapperClassName='w-full h-full flex justify-center items-center'
					imgClassName='max-w-[400px] max-h-[400px]'
				/>
			</div>
		);
	}

	return (
		<section>
			<h3 className='mt-5 text-2xl font-semibold text-blue-light-high dark:text-blue-dark-high'>
				{accountData?.multisig?.multi_account_member?.length > 0 ? 'Multisig Address' : 'Addresses'}
			</h3>
			<Spin
				spinning={isLoading}
				className='min-h-screen'
			>
				<div className='w-full rounded-[14px] bg-white p-2 drop-shadow-md dark:bg-section-dark-overlay lg:p-4'>
					<AccountInfo
						accountData={accountData}
						loginAddress={loginAddress}
					/>
					<Signatories accountData={accountData} />
					<ProxyDetails accountData={accountData} />
					<MultisigDetails accountData={accountData} />
				</div>
			</Spin>
		</section>
	);
};

export default AddressesComponent;
