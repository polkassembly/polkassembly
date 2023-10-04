// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Alert, Button, Input, Skeleton } from 'antd';

import dynamic from 'next/dynamic';
import DelegateCard from './DelegateCard';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useApiContext, useNetworkContext, useUserDetailsContext } from '~src/context';
import { IDelegate } from '~src/types';

import Web3 from 'web3';
import getEncodedAddress from '~src/util/getEncodedAddress';

import DelegatesProfileIcon from '~assets/icons/white-delegated-profile.svg';
import DelegatedIcon from '~assets/icons/delegate.svg';
import { ExpandIcon, CollapseIcon } from '~src/ui-components/CustomIcons';
import styled from 'styled-components';

const DelegateModal = dynamic(() => import('../Listing/Tracks/DelegateModal'), {
	loading: () => <Skeleton active />,
	ssr: false
});

<<<<<<< HEAD
interface Props{
  className?: string;
  trackDetails: any;
  disabled?: boolean;
  theme?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Delegate = ( { className, trackDetails, disabled , theme }: Props ) => {

=======
interface Props {
	className?: string;
	trackDetails: any;
	disabled?: boolean;
}

const Delegate = ({ className, trackDetails, disabled }: Props) => {
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
	const { api, apiReady } = useApiContext();
	const [expandProposals, setExpandProposals] = useState<boolean>(false);
	const [address, setAddress] = useState<string>('');
	const { delegationDashboardAddress } = useUserDetailsContext();
	const [open, setOpen] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [delegatesData, setDelegatesData] = useState<IDelegate[]>([]);
	const { network } = useNetworkContext();
	const [addressAlert, setAddressAlert] = useState<boolean>(false);

	useEffect(() => {
		address && (getEncodedAddress(address, network) || Web3.utils.isAddress(address)) && address !== getEncodedAddress(address, network) && setAddressAlert(true);
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

<<<<<<< HEAD
	return <div className=  {`${className} rounded-[14px] bg-white dark:bg-section-dark-overlay py-6 px-[37px] mt-[22px]`}>
		<div onClick={() => setExpandProposals(!expandProposals) } className='shadow-[0px 4px 6px rgba(0, 0, 0, 0.08] flex items-center justify-between cursor-pointer'>
			<div  className='flex jutify-center items-center gap-2'>
				<DelegatedIcon className='mr-[4px]'/>
				<span className='text-[24px] font-semibold tracking-[0.0015em] text-blue-light-high dark:text-blue-dark-high'>
          Delegate
				</span>
			</div>
			<div className='p-2'>{!expandProposals ? <ExpandIcon className='text-lightBlue dark:text-blue-dark-medium'/> : <CollapseIcon className='text-lightBlue dark:text-blue-dark-medium'/>}</div>
		</div>

		{expandProposals && <div className='mt-[24px]'>
			{disabled && <Alert className='text-sm font-normal text-blue-light-high dark:text-blue-dark-high' showIcon message='You have already delegated for this track.'/>}
			<h4 className={`text-sm font-normal text-blue-light-high dark:text-blue-dark-high mb-4 mt-4 ${disabled && 'opacity-50'}`}>
        Enter an address or Select from the list below to delegate your voting power
			</h4>

			<div className='flex gap-4 items-center'>
				<div className='text-[#576D8BCC] font-normal text-[14px] h-[48px] border-[1px] border-solid border-[#D2D8E0] rounded-md flex items-center justify-between w-full dark:border-separatorDark'>

					<Input disabled={disabled} placeholder='Enter address to Delegate vote' onChange={(e) => setAddress(e.target.value)} value={address} className='h-[44px] border-none dark:bg-transparent dark:text-white'/>

					<Button onClick={handleClick} disabled={!address || !(getEncodedAddress(address, network) || Web3.utils.isAddress(address)) || address === delegationDashboardAddress || getEncodedAddress(address, network) === delegationDashboardAddress || disabled } className={`h-[40px] py-1 px-4 flex justify-around items-center rounded-md bg-pink_primary gap-2 mr-1 ml-1 border-none ${disabled && 'opacity-50'}`}>
						<DelegatesProfileIcon/>
						<span className='text-white text-sm font-medium'>
              Delegate
						</span>
					</Button>
=======
	return (
		<div className={`${className} mt-[22px] rounded-[14px] bg-white px-[37px] py-6`}>
			<div
				onClick={() => setExpandProposals(!expandProposals)}
				className='shadow-[0px 4px 6px rgba(0, 0, 0, 0.08] flex cursor-pointer items-center justify-between'
			>
				<div className='jutify-center flex items-center gap-2'>
					<DelegatedIcon className='mr-[4px]' />
					<span className='text-[24px] font-semibold tracking-[0.0015em] text-[#243A57]'>Delegate</span>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
				</div>
				<div className='p-2'>{!expandProposals ? <ExpandIcon /> : <CollapseIcon />}</div>
			</div>

			{expandProposals && (
				<div className='mt-[24px]'>
					{disabled && (
						<Alert
							className='text-sm font-normal text-[#243A57]'
							showIcon
							message='You have already delegated for this track.'
						/>
					)}
					<h4 className={`mb-4 mt-4 text-sm font-normal text-[#243A57] ${disabled && 'opacity-50'}`}>
						Enter an address or Select from the list below to delegate your voting power
					</h4>

					<div className='flex items-center gap-4'>
						<div className='flex h-[48px] w-full items-center justify-between rounded-md border-[1px] border-solid border-[#D2D8E0] text-[14px] font-normal text-[#576D8BCC]'>
							<Input
								disabled={disabled}
								placeholder='Enter address to Delegate vote'
								onChange={(e) => setAddress(e.target.value)}
								value={address}
								className='h-[44px] border-none'
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
								className={`ml-1 mr-1 flex h-[40px] items-center justify-around gap-2 rounded-md bg-pink_primary px-4 py-1 ${disabled && 'opacity-50'}`}
							>
								<DelegatesProfileIcon />
								<span className='text-sm font-medium text-white'>Delegate</span>
							</Button>
						</div>
						{/* <Popover
					showArrow={false}
					placement='bottomLeft'
					content={<>
						<div className='py-1 flex items-center gap-[11px] cursor-pointer'
							// onClick={() => { setSelectedWallet('nova-wallet');filterByWallet('nova-wallet');}}
						>
							<NovaWalletIcon/>
							<span className='text-sm text-blue-light-high dark:text-blue-dark-high'>Nova Wallet Delegates</span>
						</div>
						<div className='py-1 flex items-center gap-[11px] cursor-pointer'
							//  onClick={() => { setSelectedWallet('others');filterByWallet('others');}}
						>
							<ProfileIcon/>
							<span className='text-sm text-blue-light-high dark:text-blue-dark-high'>Others</span>
						</div>
					</>}>
					<DelegateMenuIcon/>
				</Popover> */}
					</div>

					{getEncodedAddress(address, network) === delegationDashboardAddress && (
						<label className='mt-1 text-sm font-normal text-red-500'>You cannot delegate to your own address. Please enter a different wallet address.</label>
					)}

					{!address ||
						(!(getEncodedAddress(address, network) || Web3.utils.isAddress(address)) && <label className='mt-1 text-sm font-normal text-red-500 '>Invalid Address.</label>)}
					{addressAlert && (
						<Alert
							className='mb-4 mt-4'
							showIcon
							message='The substrate address has been changed to Kusama address.'
						/>
					)}

<<<<<<< HEAD
			{!loading ? <div className='mt-6 grid grid-cols-2 max-lg:grid-cols-1 gap-6'>
				{delegatesData.filter((item) => item?.address === 'F1wAMxpzvjWCpsnbUMamgKfqFM7LRvNdkcQ44STkeVbemEZ').map((delegate, index) => <DelegateCard trackNum={trackDetails?.trackId} key={ index }  delegate={ delegate } disabled={disabled} />)}
				{delegatesData.filter((item) => item?.address !== 'F1wAMxpzvjWCpsnbUMamgKfqFM7LRvNdkcQ44STkeVbemEZ').sort((a, b) => b.active_delegation_count - a.active_delegation_count).map((delegate, index) => <DelegateCard trackNum={trackDetails?.trackId} key={ index }  delegate={ delegate } disabled={disabled} />)}
			</div> : <Skeleton className='mt-6'/>}

		</div>}
		<DelegateModal theme={theme} trackNum={trackDetails?.trackId} defaultTarget={address} open={open} setOpen={setOpen} />

	</div>;
};
export default styled(Delegate)`
	.ant-input::placeholder{
		color: ${props => props.theme=='dark' ? '#909090' : '#576D8BCC'} !important;
	}
`;
=======
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
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
