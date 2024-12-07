// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IAccountData } from '~src/types';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { Spin } from 'antd';
import Image from 'next/image';
import AccountInfo from './AccountInfo';
import ProxyDetails from './ProxyDetails';
import Signatories from './Signatories';
import MultisigDetails from './MultisigDetails';
import useImagePreloader from '~src/hooks/useImagePreloader';
import Alert from '~src/basic-components/Alert';

const AddressesComponent = () => {
	const userDetails = useUserDetailsSelector();
	const { loginAddress } = userDetails;
	const [accountData, setAccountData] = useState<IAccountData | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isError, setIsError] = useState<boolean>(false);
	const [linkedAddresses, setLinkedAddresses] = useState<Array<{ linked_address: string; is_linked: boolean }>>([]);
	const isGifLoaded = useImagePreloader('/assets/Gifs/search.gif');

	const gatherAddresses = (data: IAccountData) => {
		const addresses: Array<{ linked_address: string; type: string }> = [];

		// Signatories
		data?.multisig?.multi_account_member?.forEach((signatory) => {
			if (signatory?.address) {
				addresses.push({ linked_address: signatory.address, type: 'SIGNATORY' });
			}
		});

		// Proxy Details - Real Accounts
		data?.proxy?.real_account?.forEach((realAccount) => {
			if (realAccount?.account_display?.address) {
				addresses.push({ linked_address: realAccount.account_display.address, type: 'PROXY' });
			}
		});

		// Proxy Details - Proxy Accounts
		data?.proxy?.proxy_account?.forEach((proxyAccount) => {
			if (proxyAccount?.account_display?.address) {
				addresses.push({ linked_address: proxyAccount.account_display.address, type: 'PUREPROXY' });
			}
		});

		// Multisig Details
		data?.multisig?.multi_account?.forEach((multisigAddress) => {
			if (multisigAddress?.address) {
				addresses.push({ linked_address: multisigAddress.address, type: 'MULTISIG' });
			}
		});

		return addresses;
	};

	const fetchLinkedStatus = async (addresses: Array<{ linked_address: string; type: string }>) => {
		if (!loginAddress) return;
		try {
			const { data, error } = await nextApiClientFetch<any>('/api/v1/accounts/checkIsLinkedProxy', {
				address: loginAddress,
				linked_addresses: addresses
			});

			if (error || !data) {
				console.error('Error fetching linked address status:', error);
				return;
			}
			setLinkedAddresses(data?.data);
		} catch (error) {
			console.error('An error occurred while fetching linked addresses:', error);
		}
	};

	const fetchData = async () => {
		setIsLoading(true);
		try {
			const { data, error } = await nextApiClientFetch<{ data: { account: IAccountData } }>('api/v1/accounts', {
				address: loginAddress
			});

			if (error || !data?.data) {
				console.error('Error while fetching accounts', error);
				setIsError(true);
				setIsLoading(false);
				return;
			}

			if (data?.data?.account) {
				setAccountData(data?.data?.account);
				setIsError(false);

				const addresses = gatherAddresses(data.data.account);

				await fetchLinkedStatus(addresses);
			}
		} catch (err) {
			console.error('An error occurred while fetching data:', err);
			setIsError(true);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (!loginAddress) return;
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loginAddress]);

	if (!loginAddress) {
		return (
			<div className='mx-auto max-w-[600px]'>
				<Alert
					type='info'
					showIcon
					className={'my-5 dark:text-white'}
					message='Please Login to continue'
				/>
				<div className='flex items-center justify-center'>
					<Image
						src={!isGifLoaded ? '/assets/Gifs/search.svg' : '/assets/Gifs/search.gif'}
						alt='search-icon'
						width={400}
						height={400}
						className='-my-[40px]'
						priority={true}
					/>
				</div>
			</div>
		);
	}
	if (isError) {
		return (
			<div className='mx-auto max-w-[600px]'>
				<Alert
					type='info'
					showIcon
					className={'my-5 dark:text-white'}
					message='Something wrong , while fetching data. Please try again after sometime '
				/>
				<div className='flex items-center justify-center'>
					<Image
						src={!isGifLoaded ? '/assets/Gifs/search.svg' : '/assets/Gifs/search.gif'}
						alt='search-icon'
						width={400}
						height={400}
						className='-my-[40px]'
						priority={true}
					/>
				</div>
			</div>
		);
	}

	return (
		<Spin spinning={!accountData}>
			<section className='min-h-[80vh]'>
				<h3 className='mt-2 text-xl font-semibold text-blue-light-high dark:text-blue-dark-high md:mt-5 md:text-2xl'>
					{accountData && accountData?.multisig?.multi_account_member?.length > 0 ? 'Multisig Address' : 'Addresses'}
				</h3>
				<Spin
					spinning={isLoading}
					className='min-h-screen'
				>
					{accountData && (
						<div className='w-full rounded-[14px] bg-white p-[10px] drop-shadow-md dark:bg-section-dark-overlay lg:p-4'>
							<AccountInfo
								accountData={accountData}
								loginAddress={loginAddress}
							/>
							<Signatories
								accountData={accountData}
								linkedAddresses={linkedAddresses}
							/>
							<ProxyDetails
								accountData={accountData}
								linkedAddresses={linkedAddresses}
							/>
							<MultisigDetails
								accountData={accountData}
								linkedAddresses={linkedAddresses}
							/>
						</div>
					)}
				</Spin>
			</section>
		</Spin>
	);
};

export default AddressesComponent;
