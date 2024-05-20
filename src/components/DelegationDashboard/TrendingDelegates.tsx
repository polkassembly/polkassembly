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
import { Alert, Button, Checkbox, Spin } from 'antd';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import Input from '~src/basic-components/Input';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import getEncodedAddress from '~src/util/getEncodedAddress';
import DelegatesProfileIcon from '~assets/icons/white-delegated-profile.svg';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import DelegateModal from '../Listing/Tracks/DelegateModal';
import { useApiContext } from '~src/context';
import Popover from '~src/basic-components/Popover';
import { poppins } from 'pages/_app';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import { CheckboxChangeEvent } from 'antd/es/checkbox';

const TrendingDelegates = () => {
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const { delegationDashboardAddress } = useUserDetailsSelector();
	const [loading, setLoading] = useState<boolean>(false);
	const [delegatesData, setDelegatesData] = useState<IDelegate[]>([]);
	const [filteredDelegates, setFilteredDelegates] = useState<IDelegate[]>([]);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [showMore, setShowMore] = useState<boolean>(false);
	const [addressAlert, setAddressAlert] = useState<boolean>(false);
	const [open, setOpen] = useState<boolean>(false);
	const { resolvedTheme: theme } = useTheme();
	const [address, setAddress] = useState<string>('');
	const [checkedList, setCheckedList] = useState<CheckboxValueType[]>([]);
	const [checkAll, setCheckAll] = useState(true);

	useEffect(() => {
		if (!address) return;
		if (getEncodedAddress(address, network) && address !== getEncodedAddress(address, network)) {
			setAddressAlert(true);
		}
		setTimeout(() => {
			setAddressAlert(false);
		}, 5000);
	}, [network, address]);

	useEffect(() => {
		// Modify to set checkedList based on allDataSource after fetching data
		const allDataSource = [...new Set(delegatesData?.map((data) => data?.dataSource).flat())];
		setCheckedList(allDataSource);
		setCheckAll(true); // Ensure check all is always true initially
	}, [delegatesData]);

	useEffect(() => {
		// Adjusted to consider checkAll state
		if (checkAll) {
			setFilteredDelegates(delegatesData);
		} else {
			const filtered = delegatesData?.filter((delegate) => delegate?.dataSource?.some((dataSource) => checkedList.includes(dataSource)));
			setFilteredDelegates(filtered);
		}
	}, [delegatesData, checkedList, checkAll]);

	const getData = async () => {
		if (!api || !apiReady) return;

		if (!getEncodedAddress(address, network) && address.length > 0) return;
		setLoading(true);

		const { data, error } = await nextApiClientFetch<IDelegate[]>('api/v1/delegations/delegates', {
			address: address
		});
		if (data) {
			setDelegatesData(data);
			console.log(data?.length, data);
			setLoading(false);
		} else {
			console.log(error);
			setLoading(false);
		}
	};

	useEffect(() => {
		console.log('heree', address, delegationDashboardAddress);
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, delegationDashboardAddress]);

	const itemsPerPage = showMore ? filteredDelegates.length : 6;
	const totalPages = Math.ceil(delegatesData.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = showMore ? delegatesData.length : startIndex + itemsPerPage;

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
		getSubstrateAddress('13mZThJSNdKUyVUjQE9ZCypwJrwdvY8G5cUCpS9Uw4bodh4t'),
		getSubstrateAddress('1wpTXaBGoyLNTDF9bosbJS3zh8V8D2ta7JKacveCkuCm7s6'),
		getSubstrateAddress('F1wAMxpzvjWCpsnbUMamgKfqFM7LRvNdkcQ44STkeVbemEZ'),
		getSubstrateAddress('5CJX6PHkedu3LMdYqkHtGvLrbwGJustZ78zpuEAaxhoW9KbB')
	];

	const allDataSource = [...new Set(delegatesData?.map((data) => data?.dataSource).flat())];

	const onChange = (list: CheckboxValueType[]) => {
		setCheckedList(list);
		setCheckAll(list.length === allDataSource.length);
		setCurrentPage(1);
	};

	const onCheckAllChange = (e: CheckboxChangeEvent) => {
		const list = e.target.checked ? allDataSource.map((source) => source) : [];
		setCheckedList(list);
		setCheckAll(e.target.checked);
	};

	const content = (
		<div className='flex flex-col'>
			<Checkbox.Group
				className='flex max-h-[200px] flex-col overflow-y-auto'
				onChange={onChange}
				value={checkedList}
			>
				{allDataSource?.map((source, index) => (
					<div
						className={`${poppins.variable} ${poppins.className} flex gap-[8px] p-[4px] text-sm tracking-[0.01em] text-bodyBlue dark:text-blue-dark-high`}
						key={index}
					>
						<Checkbox
							className='cursor-pointer text-pink_primary'
							value={source}
							onChange={onCheckAllChange}
						/>
						<span className='mt-[3px] text-xs'>{source.charAt(0).toUpperCase() + source.slice(1)}</span>
					</div>
				))}
			</Checkbox.Group>
		</div>
	);

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

			<h4 className={'mb-4 mt-4 text-sm font-normal text-bodyBlue dark:text-white '}>Enter an address or Select from the list below to delegate your voting power</h4>

			<div className='flex items-center gap-2'>
				<div className='dark:placeholder:white flex h-[48px] w-full items-center justify-between rounded-md border-[1px] border-solid border-[#D2D8E0] text-[14px] font-normal text-[#576D8BCC] dark:border-[#3B444F] dark:border-separatorDark dark:text-white'>
					{/* Input Component */}
					<Input
						// disabled={disabled}
						placeholder='Enter address to Delegate vote'
						onChange={(e) => setAddress(e.target.value)}
						value={address}
						className='h-[44px] border-none dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
					/>

					<CustomButton
						variant='primary'
						className={'ml-1 mr-1 justify-around gap-2 px-4 py-1'}
						height={40}
						onClick={() => {
							setOpen(true);
							setAddress(address);
						}}
						disabled={
							!address || !getEncodedAddress(address, network) || address === delegationDashboardAddress || getEncodedAddress(address, network) === delegationDashboardAddress
						}
					>
						<DelegatesProfileIcon />
						<span className='text-sm font-medium text-white'>Delegate</span>
					</CustomButton>
				</div>
				<Popover
					content={content}
					placement='bottomRight'
					zIndex={1056}
				>
					<Button className='border-1 flex h-12 w-12 items-center justify-center rounded-md border-solid border-[#D2D8E0] dark:border-borderColorDark dark:bg-section-dark-overlay'>
						<ImageIcon
							src='/assets/icons/filter-icon-delegates.svg'
							alt='filter icon'
						/>
					</Button>
				</Popover>
			</div>

			{getEncodedAddress(address, network) === delegationDashboardAddress && (
				<label className='mt-1 text-sm font-normal text-red-500'>You cannot delegate to your own address. Please enter a different wallet address.</label>
			)}

			{!address || (!getEncodedAddress(address, network) && <label className='mt-1 text-sm font-normal text-red-500 '>Invalid Address.</label>)}
			{addressAlert && (
				<Alert
					className='mb-4 mt-4 dark:border-infoAlertBorderDark dark:bg-infoAlertBgDark'
					showIcon
					type='info'
					message={<span className='dark:text-blue-dark-high'>The substrate address has been changed to {network} address.</span>}
				/>
			)}

			<Spin spinning={loading}>
				<div className='min-h-[200px]'>
					{filteredDelegates.length < 1 ? (
						<ImageIcon
							src='/assets/icons/empty-state-image.svg'
							alt='empty icon'
							imgWrapperClassName='h-40 w-40 mx-auto mt-[60px]'
						/>
					) : (
						<>
							<div className='mt-6 grid grid-cols-2 gap-6 max-lg:grid-cols-1'>
								{[
									...filteredDelegates.filter((item) => addressess.includes(getSubstrateAddress(item?.address))),
									...filteredDelegates
										.filter((item) => ![...addressess].includes(getSubstrateAddress(item?.address)))
										.sort((a, b) => b.active_delegation_count - a.active_delegation_count)
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
										onChange={(page: number) => {
											setCurrentPage(page);
										}}
										total={filteredDelegates.length}
										showSizeChanger={false}
										pageSize={itemsPerPage}
										responsive={true}
										hideOnSinglePage={true}
									/>
								</div>
							)}
						</>
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
