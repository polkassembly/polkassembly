// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { IDelegate } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import DelegateCard from './DelegateCard';
import ImageIcon from '~src/ui-components/ImageIcon';
import { Pagination } from '~src/ui-components/Pagination';
import { useTheme } from 'next-themes';
import { Alert, Spin } from 'antd';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import Input from '~src/basic-components/Input';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import getEncodedAddress from '~src/util/getEncodedAddress';
import DelegatesProfileIcon from '~assets/icons/white-delegated-profile.svg';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import Web3 from 'web3';
import DelegateModal from '../Listing/Tracks/DelegateModal';
import { useApiContext } from '~src/context';

const TrendingDelegates = () => {
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const { delegationDashboardAddress } = useUserDetailsSelector();
	const [loading, setLoading] = useState<boolean>(false);
	const [delegatesData, setDelegatesData] = useState<IDelegate[]>([]);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [showMore, setShowMore] = useState<boolean>(false);
	const [addressAlert, setAddressAlert] = useState<boolean>(false);
	const [open, setOpen] = useState<boolean>(false);
	const { resolvedTheme: theme } = useTheme();
	const [address, setAddress] = useState<string>('');

	useEffect(() => {
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!address) return;
		if ((getEncodedAddress(address, network) || Web3.utils.isAddress(address)) && address !== getEncodedAddress(address, network)) {
			setAddressAlert(true);
		}
		setTimeout(() => {
			setAddressAlert(false);
		}, 5000);
	}, [network, address]);

	const getData = async () => {
		if (!api || !apiReady) return;

		if (!(getEncodedAddress(address, network) || Web3.utils.isAddress(address)) && address.length > 0) return;
		setLoading(true);

		const { data, error } = await nextApiClientFetch<IDelegate[]>('api/v1/delegations/delegates', {
			address: address
		});
		if (data) {
			setDelegatesData(data);
			setLoading(false);
		} else {
			console.log(error);
			setLoading(false);
		}
	};

	useEffect(() => {
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, delegationDashboardAddress]);

	const itemsPerPage = showMore ? delegatesData.length : 6;
	const totalPages = Math.ceil(delegatesData.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = showMore ? delegatesData.length : startIndex + itemsPerPage;

	const onChange = (page: number) => {
		setCurrentPage(page);
	};

	const prevPage = () => {
		setCurrentPage((oldPage) => {
			let prevPage = oldPage - 1;
			if (prevPage < 1) {
				prevPage = totalPages;
			}
			return prevPage;
		});
	};

	const nextPage = () => {
		setCurrentPage((oldPage) => {
			let nextPage = oldPage + 1;
			if (nextPage > totalPages) {
				nextPage = 1;
			}
			return nextPage;
		});
	};

	useEffect(() => {
		if (showMore && currentPage > totalPages) {
			setCurrentPage(totalPages);
		}
	}, [showMore, currentPage, delegatesData.length, itemsPerPage, totalPages]);
	const addressess = [
		getSubstrateAddress('1wpTXaBGoyLNTDF9bosbJS3zh8V8D2ta7JKacveCkuCm7s6'),
		getSubstrateAddress('F1wAMxpzvjWCpsnbUMamgKfqFM7LRvNdkcQ44STkeVbemEZ'),
		getSubstrateAddress('5CJX6PHkedu3LMdYqkHtGvLrbwGJustZ78zpuEAaxhoW9KbB')
	];

	return (
		<div className='mt-[32px] rounded-xxl bg-white p-5 drop-shadow-md dark:bg-section-dark-overlay md:p-6'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center space-x-3'>
					<ImageIcon
						src='/assets/delegation-tracks/trending-icon.svg'
						alt='trending icon'
						imgClassName='h-6 w-6 mt-[2.5px]'
					/>
					<span className='text-xl font-semibold'>Trending Delegates</span>
					<div className='flex space-x-[6px]'>
						<div
							onClick={prevPage}
							style={{ transform: 'rotateY(180deg)' }}
						>
							<ImageIcon
								src='/assets/delegation-tracks/chevron-right.svg'
								alt='chevron left icon'
								className='cursor-pointer'
							/>
						</div>
						<div onClick={nextPage}>
							<ImageIcon
								src='/assets/delegation-tracks/chevron-right.svg'
								alt='chevron right icon'
								className='cursor-pointer'
							/>
						</div>
					</div>
				</div>
				<span
					onClick={() => setShowMore(!showMore)}
					className='mr-[3px] cursor-pointer text-xs font-medium text-pink_primary'
				>
					{showMore ? 'Show Less' : 'Show All'}
				</span>
			</div>

			{/* {disabled && (
				<Alert
					className='text-sm font-normal text-bodyBlue dark:border-separatorDark dark:bg-[#05263F]'
					showIcon
					message={<span className='dark:text-blue-dark-high'>You have already delegated for this track.</span>}
				/>
			)} */}
			{/* <h4 className={`mb-4 mt-4 text-sm font-normal text-bodyBlue dark:text-white ${disabled && 'opacity-50'}`}> */}
			<h4 className={'mb-4 mt-4 text-sm font-normal text-bodyBlue dark:text-white '}>Enter an address or Select from the list below to delegate your voting power</h4>

			<div className='flex items-center gap-4'>
				<div className='dark:placeholder:white flex h-[48px] w-full items-center justify-between rounded-md border-[1px] border-solid border-[#D2D8E0] text-[14px] font-normal text-[#576D8BCC] dark:border-[#3B444F] dark:border-separatorDark dark:text-white'>
					{/* Input Component */}
					<Input
						// disabled={disabled}
						placeholder='Enter address to Delegate vote'
						onChange={(e) => setAddress(e.target.value)}
						value={address}
						className='h-[44px] dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
					/>

					<CustomButton
						variant='primary'
						className={'ml-1 mr-1 justify-around gap-2 px-4 py-1'}
						// className={`ml-1 mr-1 justify-around gap-2 px-4 py-1 ${disabled && 'opacity-50'}`}
						height={40}
						onClick={() => {
							setOpen(true);
							setAddress(address);
						}}
						disabled={
							!address ||
							!(getEncodedAddress(address, network) || Web3.utils.isAddress(address)) ||
							address === delegationDashboardAddress ||
							getEncodedAddress(address, network) === delegationDashboardAddress
							// disabled
						}
					>
						<DelegatesProfileIcon />
						<span className='text-sm font-medium text-white'>Delegate</span>
					</CustomButton>
				</div>
			</div>

			{getEncodedAddress(address, network) === delegationDashboardAddress && (
				<label className='mt-1 text-sm font-normal text-red-500'>You cannot delegate to your own address. Please enter a different wallet address.</label>
			)}

			{!address || (!(getEncodedAddress(address, network) || Web3.utils.isAddress(address)) && <label className='mt-1 text-sm font-normal text-red-500 '>Invalid Address.</label>)}
			{addressAlert && (
				<Alert
					className='mb-4 mt-4 dark:border-infoAlertBorderDark dark:bg-infoAlertBgDark'
					showIcon
					type='info'
					message={<span className='dark:text-blue-dark-high'>The substrate address has been changed to Kusama address.</span>}
				/>
			)}

			<Spin spinning={loading}>
				<div className='min-h-[200px]'>
					<div className='mt-6 grid grid-cols-2 gap-6 max-lg:grid-cols-1'>
						{[
							...delegatesData.filter((item) => addressess.includes(getSubstrateAddress(item?.address))),
							...delegatesData.filter((item) => ![...addressess].includes(getSubstrateAddress(item?.address))).sort((a, b) => b.active_delegation_count - a.active_delegation_count)
						]
							.slice(startIndex, endIndex)
							.map((delegate, index) => (
								<DelegateCard
									key={index}
									delegate={delegate}
									disabled={!delegationDashboardAddress}
								/>
							))}
					</div>
					{!showMore && delegatesData.length > 6 && (
						<div className='mt-6 flex justify-end'>
							<Pagination
								theme={theme}
								size='large'
								defaultCurrent={1}
								current={currentPage}
								onChange={onChange}
								total={delegatesData.length}
								showSizeChanger={false}
								pageSize={itemsPerPage}
								responsive={true}
								hideOnSinglePage={true}
							/>
						</div>
					)}
				</div>
			</Spin>
			<DelegateModal
				defaultTarget={address}
				open={open}
				setOpen={setOpen}
			/>
		</div>
	);
};

export default TrendingDelegates;
