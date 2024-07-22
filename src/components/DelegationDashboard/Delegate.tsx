// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import dynamic from 'next/dynamic';
import DelegateCard from './DelegateCard';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useApiContext } from '~src/context';
import { IDelegate } from '~src/types';
import { isAddress } from 'ethers';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { trackEvent } from 'analytics';
import DelegatesProfileIcon from '~assets/icons/white-delegated-profile.svg';
import DelegatedIcon from '~assets/icons/delegate.svg';
import ExpandIcon from '~assets/icons/expand.svg';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import Input from '~src/basic-components/Input';
import Alert from '~src/basic-components/Alert';
import Skeleton from '~src/basic-components/Skeleton';

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
	const currentUser = useUserDetailsSelector();
	const { network } = useNetworkSelector();
	const [expandProposals, setExpandProposals] = useState<boolean>(false);
	const [address, setAddress] = useState<string>('');
	const [open, setOpen] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [delegatesData, setDelegatesData] = useState<IDelegate[]>([]);
	const [addressAlert, setAddressAlert] = useState<boolean>(false);

	useEffect(() => {
		if (!address) return;
		if ((getEncodedAddress(address, network) || isAddress(address)) && address !== getEncodedAddress(address, network)) {
			setAddressAlert(true);
		}
		setTimeout(() => {
			setAddressAlert(false);
		}, 5000);
	}, [network, address]);

	const getData = async () => {
		if (!api || !apiReady) return;

		if (!((getEncodedAddress(address, network) || isAddress(address)) && address.length > 0)) return;
		setLoading(true);

		const { data, error } = await nextApiClientFetch<IDelegate[]>('api/v1/delegations/delegates', {
			address: address
		});
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
	}, [address, currentUser?.delegationDashboardAddress, api, apiReady]);

	const addressess = [
		getSubstrateAddress('1wpTXaBGoyLNTDF9bosbJS3zh8V8D2ta7JKacveCkuCm7s6'),
		getSubstrateAddress('F1wAMxpzvjWCpsnbUMamgKfqFM7LRvNdkcQ44STkeVbemEZ'),
		getSubstrateAddress('5CJX6PHkedu3LMdYqkHtGvLrbwGJustZ78zpuEAaxhoW9KbB')
	];

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
				<div className='p-2'>{<ExpandIcon className={`${expandProposals && 'rotate-180'}`} />}</div>
			</div>

			{expandProposals && (
				<div className='mt-[24px]'>
					{disabled && (
						<Alert
							className='text-sm font-normal text-bodyBlue '
							showIcon
							message={<span className='dark:text-blue-dark-high'>You have already delegated for this track.</span>}
							type='info'
						/>
					)}
					<h4 className={`mb-4 mt-4 text-sm font-normal text-bodyBlue dark:text-white ${disabled && 'opacity-50'}`}>
						Enter an address or Select from the list below to delegate your voting power
					</h4>

					<div className='flex items-center gap-4'>
						<div className='dark:placeholder:white flex h-[48px] w-full items-center justify-between rounded-md border-[1px] border-solid border-section-light-container text-sm font-normal text-[#576D8BCC] dark:border-[#3B444F] dark:border-separatorDark dark:text-white'>
							{/* Input Component */}
							<Input
								disabled={disabled}
								placeholder='Enter address to Delegate vote'
								onChange={(e) => setAddress(e.target.value)}
								value={address}
								className='h-[44px] dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
							/>

							<CustomButton
								variant='primary'
								className={`ml-1 mr-1 justify-around gap-2 px-4 py-1 ${disabled && 'opacity-50'}`}
								height={40}
								onClick={() => {
									setOpen(true);
									setAddress(address);
								}}
								disabled={
									!address ||
									!(getEncodedAddress(address, network) || isAddress(address)) ||
									address === currentUser?.delegationDashboardAddress ||
									getEncodedAddress(address, network) === currentUser?.delegationDashboardAddress ||
									disabled
								}
							>
								<DelegatesProfileIcon />
								<span className='text-sm font-medium text-white'>Delegate</span>
							</CustomButton>
						</div>
					</div>

					{getEncodedAddress(address, network) === currentUser?.delegationDashboardAddress && (
						<label className='mt-1 text-sm font-normal text-red-500'>You cannot delegate to your own address. Please enter a different wallet address.</label>
					)}

					{!address || (!(getEncodedAddress(address, network) || isAddress(address)) && <label className='mt-1 text-sm font-normal text-red-500 '>Invalid Address.</label>)}
					{addressAlert && (
						<Alert
							className='mb-4 mt-4 '
							showIcon
							type='info'
							message={<span className='dark:text-blue-dark-high'>The substrate address has been changed to {network} address.</span>}
						/>
					)}

					{
						<Spin spinning={loading}>
							<div className='mt-6 grid grid-cols-2 gap-6 max-lg:grid-cols-1'>
								{[
									...delegatesData.filter((item) => addressess.includes(getSubstrateAddress(item?.address))),
									...delegatesData.filter((item) => !addressess.includes(getSubstrateAddress(item?.address))).sort((a, b) => b.active_delegation_count - a.active_delegation_count)
								].map((delegate, index) => (
									<DelegateCard
										trackNum={trackDetails?.trackId}
										key={index}
										delegate={delegate}
										disabled={disabled}
									/>
								))}
							</div>
						</Spin>
					}
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
