// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { EDelegationAddressFilters, EDelegationSourceFilters, IDelegateAddressDetails } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import DelegateCard from './DelegateCard';
import ImageIcon from '~src/ui-components/ImageIcon';
import { Pagination } from '~src/ui-components/Pagination';
import { useTheme } from 'next-themes';
import { Alert, Button, Radio, Spin, Checkbox } from 'antd';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import getEncodedAddress from '~src/util/getEncodedAddress';
import DelegatesProfileIcon from '~assets/icons/white-delegated-profile.svg';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import DelegateModal from '../Listing/Tracks/DelegateModal';
import Popover from '~src/basic-components/Popover';
import { poppins } from 'pages/_app';
import BN from 'bn.js';
import Image from 'next/image';
import classNames from 'classnames';
import Input from '~src/basic-components/Input';
// import InputClearIcon from '~assets/icons/close-tags.svg';
// import { SearchOutlined } from '@ant-design/icons';

const DELEGATION_LISTING = 10;

const getResultsDataAccordingToFilter = (filterBy: EDelegationAddressFilters, data: IDelegateAddressDetails[]): IDelegateAddressDetails[] => {
	switch (filterBy) {
		case EDelegationAddressFilters.DELEGATED_VOTES:
			return data.sort((a, b) => new BN(b.delegatedBalance).cmp(new BN(a.delegatedBalance)));
		case EDelegationAddressFilters.RECEIVED_DELEGATIONS:
			return data.sort((a, b) => b.receivedDelegationsCount - a.receivedDelegationsCount);
		case EDelegationAddressFilters.VOTED_PROPOSALS:
			return data.sort((a, b) => b.votedProposalsCount - a.votedProposalsCount);
		default:
			return data;
	}
};

const filterDelegatesBySources = (data: IDelegateAddressDetails[], selectedSources: string[]): IDelegateAddressDetails[] => {
	return data.filter((delegate) => {
		if (selectedSources.length === 1 && selectedSources[0] === EDelegationSourceFilters.NA) {
			return !delegate.dataSource || delegate.dataSource.length === 0;
		}

		if (selectedSources.includes(EDelegationSourceFilters.NA)) {
			return !delegate.dataSource || delegate.dataSource.length === 0 || selectedSources.some((source) => delegate.dataSource?.includes(source));
		}

		return selectedSources.some((source) => delegate.dataSource?.includes(source));
	});
};

const TrendingDelegates = ({ className }: { className?: string }) => {
	const { network } = useNetworkSelector();
	const { delegationDashboardAddress } = useUserDetailsSelector();
	const [loading, setLoading] = useState<boolean>(false);
	const [delegatesData, setDelegatesData] = useState<IDelegateAddressDetails[]>([]);
	const [filteredDelegates, setFilteredDelegates] = useState<IDelegateAddressDetails[]>([]);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [addressAlert, setAddressAlert] = useState<boolean>(false);
	const [open, setOpen] = useState<boolean>(false);
	const { resolvedTheme: theme } = useTheme();
	const [address, setAddress] = useState<string>('');
	const [selectedSources, setSelectedSources] = useState<EDelegationSourceFilters[]>(Object.values(EDelegationSourceFilters));
	const [sortOption, setSortOption] = useState<EDelegationAddressFilters | null>(null);

	useEffect(() => {
		if (!address) return;
		if (getEncodedAddress(address, network) && address !== getEncodedAddress(address, network)) {
			setAddressAlert(true);
		}
		setTimeout(() => {
			setAddressAlert(false);
		}, 5000);
	}, [network, address]);

	const getData = async () => {
		if (!getEncodedAddress(address, network) && !!address.length) return;
		setLoading(true);

		const { data, error } = await nextApiClientFetch<IDelegateAddressDetails[]>('api/v1/delegations/getAllDelegates', {
			address: address
		});

		if (data) {
			//putting polkassembly Delegate first;
			const updatedDelegates = data || [];
			if (!address.length) {
				updatedDelegates.sort((a: any, b: any) => {
					const addressess = [getSubstrateAddress('13mZThJSNdKUyVUjQE9ZCypwJrwdvY8G5cUCpS9Uw4bodh4t')];
					const aIndex = addressess.indexOf(getSubstrateAddress(a.address));
					const bIndex = addressess.indexOf(getSubstrateAddress(b.address));

					if (aIndex !== -1 && bIndex !== -1) {
						return aIndex - bIndex;
					}

					if (aIndex !== -1) return -1;
					if (bIndex !== -1) return 1;
					return 0;
				});
			}

			setDelegatesData(updatedDelegates);
			setFilteredDelegates(updatedDelegates);
			setLoading(false);
		} else {
			console.log(error);
			setLoading(false);
		}
	};

	useEffect(() => {
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, network]);

	const handleCheckboxChange = (sources: EDelegationSourceFilters[]) => {
		setLoading(true);
		setSelectedSources(sources);
		const data = filterDelegatesBySources(delegatesData, sources);
		setFilteredDelegates(data || []);
		setLoading(false);
	};

	const handleRadioChange = (e: any) => {
		setLoading(true);
		const selectedOption = e.target.value;
		const updatedSortOption = sortOption === selectedOption ? null : selectedOption;
		setSortOption(updatedSortOption);
		const data = getResultsDataAccordingToFilter(selectedOption, delegatesData);
		setFilteredDelegates(data || []);
		setLoading(false);
	};

	const renderSourceIcon = (source: any) => {
		switch (source) {
			case 'parity':
				return '/assets/icons/polkadot-logo.svg';
			case 'polkassembly':
				return '/assets/delegation-tracks/pa-logo-small-delegate.svg';
			case 'w3f':
				return '/assets/profile/w3f.svg';
			case 'nova':
				return '/assets/delegation-tracks/nova-wallet.svg';
			default:
				return '/assets/icons/individual-filled.svg';
		}
	};

	const filterContent = (
		<div className='flex flex-col'>
			<span
				className={classNames(
					'-mx-3 flex cursor-pointer justify-end border-0 border-b-[1px] border-solid border-x-section-light-container px-3 pb-0.5 pt-1 text-xs text-pink_primary dark:border-separatorDark',
					poppins.className,
					poppins.variable
				)}
				onClick={() => {
					setSelectedSources([]);
					handleCheckboxChange([]);
				}}
			>
				Clear All
			</span>
			<Checkbox.Group
				onChange={(checked) => handleCheckboxChange(checked as any)}
				value={selectedSources}
				className={classNames('mt-1 flex flex-col', poppins.className, poppins.variable)}
				disabled={loading}
			>
				<div className='flex flex-col gap-1'>
					{Object.values(EDelegationSourceFilters).map((source, index) => {
						return (
							<div
								key={index}
								className={`${poppins.variable} ${poppins.className} flex gap-2 p-0.5 text-sm font-medium tracking-[0.01em] text-bodyBlue dark:text-blue-dark-high`}
							>
								<Checkbox
									checked={selectedSources.includes(source)}
									className='cursor-pointer text-pink_primary'
									value={source}
								/>
								<div className='flex items-center '>
									<span className='w-[25px]'>
										<Image
											src={renderSourceIcon(source)}
											height={20}
											width={20}
											alt=''
											className={source == EDelegationSourceFilters.NA ? (theme == 'dark' ? 'dark-icons' : '') : ''}
										/>
									</span>
									<span className='text-xs tracking-wide'>{source.charAt(0).toUpperCase() + source.slice(1)}</span>
								</div>
							</div>
						);
					})}
				</div>
			</Checkbox.Group>
		</div>
	);
	const sortContent = (
		<div className='flex flex-col'>
			<Radio.Group
				className='flex flex-col overflow-y-auto'
				onChange={handleRadioChange}
				value={sortOption || null}
				disabled={loading}
			>
				<Radio
					value={EDelegationAddressFilters.DELEGATED_VOTES}
					className={`${poppins.variable} ${poppins.className} my-[1px] flex gap-2 p-1 text-xs font-medium text-bodyBlue dark:text-blue-dark-high`}
				>
					Voting Power
				</Radio>
				<Radio
					value={EDelegationAddressFilters.VOTED_PROPOSALS}
					className={`${poppins.variable} ${poppins.className} my-[1px] flex gap-2 p-1 text-xs font-medium text-bodyBlue dark:text-blue-dark-high`}
				>
					Voted proposals (past 30 days)
				</Radio>
				<Radio
					value={EDelegationAddressFilters.RECEIVED_DELEGATIONS}
					className={`${poppins.variable} ${poppins.className} my-[1px] flex gap-2 p-1 text-xs font-medium text-bodyBlue dark:text-blue-dark-high`}
				>
					Received Delegation(s)
				</Radio>
			</Radio.Group>
		</div>
	);
	return (
		<div className={classNames(className, 'mt-[32px] rounded-xxl bg-white p-5 drop-shadow-md dark:bg-section-dark-overlay md:p-6')}>
			<div className='flex items-center space-x-3'>
				<ImageIcon
					src='/assets/delegation-tracks/trending-icon.svg'
					alt='trending icon'
					imgClassName='h-6 w-6 mt-[2.5px]'
				/>
				<span className='text-xl font-semibold'>Trending Delegates</span>
			</div>

			<h4 className={'mb-4 mt-4 text-sm font-normal text-bodyBlue dark:text-white '}>Enter an address or Select from the list below to delegate your voting power</h4>

			<div className='flex items-center gap-3'>
				<div className='dark:placeholder:white flex h-[48px] w-full items-center justify-between rounded-md text-sm font-normal text-[#576D8BCC] dark:text-white'>
					{/* Input Component */}
					<Input
						placeholder='Enter address to Delegate vote'
						onChange={(e) => setAddress(e.target.value)}
						value={address}
						className='h-10 border-section-light-container dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
					/>

					<CustomButton
						variant='primary'
						className={'ml-1 mr-1 h-10 justify-around gap-2 px-4 py-1'}
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
					content={filterContent}
					placement='bottomRight'
					zIndex={1056}
				>
					<Button className='border-1 flex h-10 w-10 items-center justify-center rounded-md border-solid border-section-light-container dark:border-borderColorDark dark:bg-section-dark-overlay'>
						<ImageIcon
							src='/assets/icons/filter-icon-delegates.svg'
							alt='filter icon'
						/>
					</Button>
				</Popover>

				<Popover
					content={sortContent}
					placement='topRight'
					zIndex={1056}
				>
					<Button className='border-1 flex h-10 w-10 items-center justify-center rounded-md border-solid border-section-light-container dark:border-borderColorDark dark:bg-section-dark-overlay'>
						<ImageIcon
							src='/assets/icons/sort-icon-delegates.svg'
							alt='sort icon'
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
					{filteredDelegates?.length < 1 && !loading ? (
						//empty state
						<ImageIcon
							src='/assets/icons/empty-state-image.svg'
							alt='empty icon'
							imgWrapperClassName='h-40 w-40 mx-auto mt-[60px]'
						/>
					) : (
						<>
							<div className='mt-6 grid grid-cols-2 items-end gap-6 max-lg:grid-cols-1'>
								{filteredDelegates.slice((currentPage - 1) * DELEGATION_LISTING, (currentPage - 1) * DELEGATION_LISTING + DELEGATION_LISTING).map((delegate, index) => (
									<DelegateCard
										key={index}
										delegate={delegate}
										disabled={!delegationDashboardAddress}
									/>
								))}
							</div>
							{delegatesData?.length > DELEGATION_LISTING && (
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
										pageSize={DELEGATION_LISTING}
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
