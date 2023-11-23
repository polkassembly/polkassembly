// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Alert, Button, Input, Skeleton } from 'antd';

import dynamic from 'next/dynamic';
import DelegateCard from './DelegateCard';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useApiContext } from '~src/context';
import { IDelegate } from '~src/types';

import Web3 from 'web3';
import getEncodedAddress from '~src/util/getEncodedAddress';

import DelegatesProfileIcon from '~assets/icons/white-delegated-profile.svg';
import DelegatedIcon from '~assets/icons/delegate.svg';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { trackEvent } from 'analytics';

const DelegateModal = dynamic(() => import('../Listing/Tracks/DelegateModal'), {
	loading: () => <Skeleton active />,
	ssr: false
});

interface Props {
	className?: string;
	trackDetails: any;
	disabled?: boolean;
}

const Delegate = ({ className, trackDetails, disabled }: Props) => {
	const { api, apiReady } = useApiContext();
	const { network } = useNetworkSelector();
	const [expandProposals, setExpandProposals] = useState<boolean>(false);
	const [address, setAddress] = useState<string>('');
	const { delegationDashboardAddress } = useUserDetailsSelector();
	const [open, setOpen] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [delegatesData, setDelegatesData] = useState<IDelegate[]>([]);
	const [addressAlert, setAddressAlert] = useState<boolean>(false);
	const currentUser = useUserDetailsSelector();

	useEffect(() => {
		if (!address) return;
		if ((getEncodedAddress(address, network) || Web3.utils.isAddress(address)) && address !== getEncodedAddress(address, network)) {
			setAddressAlert(true);
		}
		setTimeout(() => {
			setAddressAlert(false);
		}, 5000);
	}, [network, address]);

	const handleClick = () => {
		setOpen(true);
		setAddress(address);
	};

	const getData = async () => {
		if (!api || !apiReady) return;

		if (!(getEncodedAddress(address, network) || Web3.utils.isAddress(address)) && address.length > 0) return;
		setLoading(true);

		const { data, error } = await nextApiClientFetch<IDelegate[]>(`api/v1/delegations/delegates?address=${address}`);
		if (data) {
			setDelegatesData(data);
		} else {
			console.log(error);
		}
		setLoading(false);
	};

	useEffect(() => {
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, delegationDashboardAddress, api, apiReady]);

	return (
		<div className={`${className} mt-[22px] rounded-[14px] bg-white px-[37px] py-6 dark:bg-section-dark-overlay`}>
			<div
				onClick={() => {
					// GAEvent for delegate dropdown clicked
					trackEvent('delegate_dropdown_clicked', 'clicked_delegate_dropdown', {
						userId: currentUser?.id || '',
						userName: currentUser?.username || ''
					});
					setExpandProposals(!expandProposals);
				}}
				className='shadow-[0px 4px 6px rgba(0, 0, 0, 0.08] flex cursor-pointer items-center justify-between'
			>
				<div className='jutify-center flex items-center gap-2'>
					<DelegatedIcon className='mr-[4px]' />
					<span className='text-[24px] font-semibold tracking-[0.0015em] text-bodyBlue dark:text-white'>Delegate</span>
				</div>
				<div className='p-2'>{!expandProposals ? <ExpandIcon /> : <CollapseIcon />}</div>
			</div>

			{expandProposals && (
				<div className='mt-[24px]'>
					{disabled && (
						<Alert
							className='text-sm font-normal text-bodyBlue dark:border-[#125798] dark:bg-[#05263F]'
							showIcon
							message={<span className='dark:text-blue-dark-high'>You have already delegated for this track.</span>}
						/>
					)}
					<h4 className={`mb-4 mt-4 text-sm font-normal text-bodyBlue dark:text-white ${disabled && 'opacity-50'}`}>
						Enter an address or Select from the list below to delegate your voting power
					</h4>

					<div className='flex items-center gap-4'>
						<div className='dark:placeholder:white flex h-[48px] w-full items-center justify-between rounded-md border-[1px] border-solid border-[#D2D8E0] text-[14px] font-normal text-[#576D8BCC] dark:border-[#3B444F] dark:border-separatorDark dark:text-white'>
							<Input
								disabled={disabled}
								placeholder='Enter address to Delegate vote'
								onChange={(e) => setAddress(e.target.value)}
								value={address}
								className='h-[44px] border-none dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
							/>

							<Button
								onClick={handleClick}
								disabled={
									!address ||
									!(getEncodedAddress(address, network) || Web3.utils.isAddress(address)) ||
									address === delegationDashboardAddress ||
									getEncodedAddress(address, network) === delegationDashboardAddress ||
									disabled
								}
								className={`ml-1 mr-1 flex h-[40px] items-center justify-around gap-2 rounded-md bg-pink_primary px-4 py-1 dark:border-pink_primary dark:bg-[#33071E] ${
									disabled && 'opacity-50'
								}`}
							>
								<DelegatesProfileIcon />
								<span className='text-sm font-medium text-white'>Delegate</span>
							</Button>
						</div>
					</div>

					{getEncodedAddress(address, network) === delegationDashboardAddress && (
						<label className='mt-1 text-sm font-normal text-red-500'>You cannot delegate to your own address. Please enter a different wallet address.</label>
					)}

					{!address ||
						(!(getEncodedAddress(address, network) || Web3.utils.isAddress(address)) && <label className='mt-1 text-sm font-normal text-red-500 '>Invalid Address.</label>)}
					{addressAlert && (
						<Alert
							className='mb-4 mt-4 dark:border-[#125798] dark:bg-[#05263F]'
							showIcon
							type='info'
							message={<span className='dark:text-blue-dark-high'>The substrate address has been changed to Kusama address.</span>}
						/>
					)}

					{!loading ? (
						<div className='mt-6 grid grid-cols-2 gap-6 max-lg:grid-cols-1'>
							{delegatesData
								.filter((item) => item?.address === 'F1wAMxpzvjWCpsnbUMamgKfqFM7LRvNdkcQ44STkeVbemEZ')
								.map((delegate, index) => (
									<DelegateCard
										trackNum={trackDetails?.trackId}
										key={index}
										delegate={delegate}
										disabled={disabled}
									/>
								))}
							{delegatesData
								.filter((item) => item?.address !== 'F1wAMxpzvjWCpsnbUMamgKfqFM7LRvNdkcQ44STkeVbemEZ')
								.sort((a, b) => b.active_delegation_count - a.active_delegation_count)
								.map((delegate, index) => (
									<DelegateCard
										trackNum={trackDetails?.trackId}
										key={index}
										delegate={delegate}
										disabled={disabled}
									/>
								))}
						</div>
					) : (
						<Skeleton className='mt-6' />
					)}
				</div>
			)}
			<DelegateModal
				trackNum={trackDetails?.trackId}
				defaultTarget={address}
				open={open}
				setOpen={setOpen}
			/>
		</div>
	);
};
export default Delegate;
