// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useRef, useState } from 'react';
import { EDelegationAddressFilters, EDelegationSourceFilters, IDelegateAddressDetails } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import DelegateCard from './DelegateCard';
import ImageIcon from '~src/ui-components/ImageIcon';
import { Pagination } from '~src/ui-components/Pagination';
import { Button, Radio, Spin, Checkbox } from 'antd';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import Popover from '~src/basic-components/Popover';
import { poppins } from 'pages/_app';
import BN from 'bn.js';
import Image from 'next/image';
import classNames from 'classnames';
import Input from '~src/basic-components/Input';
import { useApiContext, usePeopleChainApiContext } from '~src/context';
import getIdentityInformation from '~src/auth/utils/getIdentityInformation';
import InputClearIcon from '~assets/icons/close-tags.svg';
import { SearchOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useTheme } from 'next-themes';
import { DelegateDelegationIcon } from '~src/ui-components/CustomIcons';
import getEncodedAddress from '~src/util/getEncodedAddress';
import DelegateModal from '../Listing/Tracks/DelegateModal';

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

const TrendingDelegates = ({ className, theme }: { className?: string; theme: any }) => {
	const { network } = useNetworkSelector();
	const { delegationDashboardAddress } = useUserDetailsSelector();
	const { api, apiReady } = useApiContext();
	const { peopleChainApi, peopleChainApiReady } = usePeopleChainApiContext();
	const [loading, setLoading] = useState<boolean>(false);
	const [filteredDelegates, setFilteredDelegates] = useState<IDelegateAddressDetails[]>([]);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const delegatesData = useRef<IDelegateAddressDetails[]>([]);
	const [selectedSources, setSelectedSources] = useState<EDelegationSourceFilters[]>(Object.values(EDelegationSourceFilters));
	const [sortOption, setSortOption] = useState<EDelegationAddressFilters | null>(null);
	const [searchInput, setSearchInput] = useState<string>('');
	const { resolvedTheme } = useTheme();
	const [open, setOpen] = useState<boolean>(false);

	const handleIdentity = async (delegates: IDelegateAddressDetails[]) => {
		if (!api || !apiReady) return;

		const identityInfo: { [key: string]: any | null } = {};
		const identityInfoPromises = delegates?.map(async (delegate: IDelegateAddressDetails) => {
			if (delegate?.address) {
				const info = await getIdentityInformation({
					address: delegate?.address,
					api: peopleChainApi ?? api,
					network: network
				});

				identityInfo[delegate?.address] = info || null;
			}
		});

		await Promise.allSettled(identityInfoPromises);

		const updatedData = delegates?.map((delegate: IDelegateAddressDetails) => {
			return {
				...delegate,
				identityInfo: identityInfo?.[delegate?.address] || null,
				username: identityInfo?.[delegate?.address]?.display || identityInfo?.[delegate?.address]?.legal || ''
			};
		});
		delegatesData.current = updatedData;
		setFilteredDelegates(updatedData || delegatesData.current);
	};

	const handleSearchSubmit = () => {
		if (!searchInput.length) {
			setFilteredDelegates(delegatesData.current);
			return;
		}
		setCurrentPage(1);
		setLoading(true);
		const searchOutput = delegatesData.current.filter((delegate) => delegate?.address.match(searchInput) || delegate?.username?.toLowerCase().match(searchInput.toLowerCase()));
		setFilteredDelegates(searchOutput || []);
		setLoading(false);
	};

	const getData = async () => {
		if (!(api && peopleChainApiReady) || !network) return;
		setLoading(true);

		const { data, error } = await nextApiClientFetch<IDelegateAddressDetails[]>('api/v1/delegations/getAllDelegates');
		if (data) {
			//putting polkassembly Delegate first;
			const updatedDelegates = data || [];

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

			delegatesData.current = updatedDelegates;
			setFilteredDelegates(updatedDelegates);
			setLoading(false);
			handleIdentity(updatedDelegates);
		} else {
			console.log(error);
			setLoading(false);
		}
	};

	useEffect(() => {
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, peopleChainApi, peopleChainApiReady, apiReady, network]);

	const handleCheckboxChange = (sources: EDelegationSourceFilters[]) => {
		setLoading(true);
		setCurrentPage(1);
		setSelectedSources(sources);
		const searchOutput = searchInput?.length
			? delegatesData.current.filter((delegate) => delegate?.address.match(searchInput) || delegate?.username?.toLowerCase().match(searchInput.toLowerCase()))
			: null;

		const fromFilterContent = searchOutput?.length ? searchOutput : delegatesData?.current;
		const data = filterDelegatesBySources(fromFilterContent, sources);
		setFilteredDelegates(data || []);
		setLoading(false);
	};

	const handleRadioChange = (e: any) => {
		setLoading(true);
		setCurrentPage(1);
		const selectedOption = e.target.value;
		const updatedSortOption = sortOption === selectedOption ? null : selectedOption;
		setSortOption(updatedSortOption);
		const searchOutput = searchInput?.length
			? delegatesData.current.filter((delegate) => delegate?.address.match(searchInput) || delegate?.username?.toLowerCase().match(searchInput.toLowerCase()))
			: null;

		const fromFilterContent = searchOutput?.length ? searchOutput : delegatesData?.current;
		const data = getResultsDataAccordingToFilter(selectedOption, fromFilterContent);
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
											className={source == EDelegationSourceFilters.NA ? (theme == 'dark ' ? 'dark-icons' : '') : ''}
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
		<div className={classNames(className, 'mt-4 rounded-xxl bg-white p-3 drop-shadow-md dark:bg-section-dark-overlay sm:mt-8 sm:p-5 md:p-6')}>
			<div className='flex items-center gap-1 sm:space-x-3'>
				<ImageIcon
					src='/assets/delegation-tracks/trending-icon.svg'
					alt='trending icon'
					imgClassName='h-5 w-6 sm:h-6 sm:w-6 mt-[2.5px]'
				/>
				<span className={`${poppins.variable} ${poppins.className} text-sm font-semibold sm:text-xl`}>Trending Delegates</span>
			</div>

			<h4
				className={`${poppins.variable} ${poppins.className} my-[4px] text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium sm:my-4 sm:text-sm sm:text-bodyBlue dark:sm:text-white `}
			>
				Enter an address or Select from the list below to delegate your voting power
			</h4>

			<div className='flex items-center gap-3'>
				{/* For small screen */}
				<div className=' mt-1 flex w-full items-center gap-[3px] sm:hidden'>
					<Input
						type='search'
						allowClear={{ clearIcon: <InputClearIcon /> }}
						placeholder='Enter username or address to Delegate vote'
						onChange={(e) => {
							if (!e.target.value?.length) {
								setFilteredDelegates(delegatesData?.current || []);
							}
							setSearchInput(e.target.value.trim());
						}}
						onPressEnter={handleSearchSubmit}
						value={searchInput}
						className=' border-1 h-8 w-full rounded-[6px] rounded-s-md border-section-light-container bg-white dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
					/>
					<Popover
						content={filterContent}
						placement='bottomRight'
						zIndex={1056}
					>
						<Button className='border-1 flex h-8 w-8 items-center justify-center rounded-md border-solid border-section-light-container hover:bg-[#FEF5FA] dark:border-borderColorDark dark:bg-section-dark-overlay hover:dark:bg-[#48092A]'>
							<ImageIcon
								src='/assets/icons/filter-icon-delegates.svg'
								alt='filter icon'
								imgClassName='h-4 w-4'
							/>
						</Button>
					</Popover>

					<Popover
						content={sortContent}
						placement='topRight'
						zIndex={1056}
					>
						<Button className='border-1 flex h-8 w-8 items-center justify-center rounded-md border-solid border-section-light-container hover:bg-[#FEF5FA] dark:border-borderColorDark dark:bg-section-dark-overlay hover:dark:bg-[#48092A]'>
							<ImageIcon
								src='/assets/icons/sort-icon-delegates.svg'
								alt='sort icon'
								imgClassName='h-4 w-4'
							/>
						</Button>
					</Popover>
				</div>

				{/* For Large screen */}
				<div className='dark:placeholder:white hidden h-12 w-full items-center justify-between rounded-md text-sm font-normal text-[#576D8BCC] dark:text-white sm:flex'>
					{/* Input Component */}
					<Input
						type='search'
						allowClear={{ clearIcon: <InputClearIcon /> }}
						placeholder='Enter username or address to Delegate vote'
						onChange={(e) => {
							if (!e.target.value?.length) {
								setFilteredDelegates(delegatesData?.current || []);
							}
							setSearchInput(e.target.value.trim());
						}}
						onPressEnter={handleSearchSubmit}
						value={searchInput}
						className='placeholderColor h-10 rounded-none rounded-s-md border-0 border-b-[1px] border-l-[1px] border-t-[1px] border-section-light-container dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
					/>

					<CustomButton
						variant='primary'
						className={classNames('mr-1 h-11 justify-around gap-2 rounded-none rounded-e-md px-4 py-1', loading || !searchInput.length ? 'opacity-50' : '')}
						height={40}
						onClick={() => {
							handleSearchSubmit();
						}}
						disabled={loading || !searchInput.length}
					>
						<SearchOutlined />
					</CustomButton>
				</div>

				<Popover
					content={filterContent}
					placement='bottomRight'
					zIndex={1056}
					className='hidden sm:flex'
				>
					<Button className='border-1 flex h-10 w-10 items-center justify-center rounded-md border-solid border-section-light-container hover:bg-[#FEF5FA] dark:border-borderColorDark dark:bg-section-dark-overlay hover:dark:bg-[#48092A]'>
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
					className='hidden sm:flex'
				>
					<Button className='border-1 flex h-10 w-10 items-center justify-center rounded-md border-solid border-section-light-container hover:bg-[#FEF5FA] dark:border-borderColorDark dark:bg-section-dark-overlay hover:dark:bg-[#48092A]'>
						<ImageIcon
							src='/assets/icons/sort-icon-delegates.svg'
							alt='sort icon'
						/>
					</Button>
				</Popover>
			</div>

			<Spin spinning={loading}>
				<div className='min-h-[250px]'>
					{!filteredDelegates?.length && !loading ? (
						//empty state
						<div className='mt-14 flex flex-col items-center justify-center gap-4'>
							<DelegateDelegationIcon className='text-[200px]' />
							<div className='flex items-center gap-1'>
								<span className='text-lightBlue dark:text-blue-dark-high '>No results found</span>
								{searchInput.length > 10 && !!getEncodedAddress(searchInput, network) && !!delegationDashboardAddress?.length && (
									<span className='flex gap-1 text-lightBlue dark:text-blue-dark-high'>
										<div
											className={`flex cursor-pointer items-center gap-1 border-none text-pink_primary ${!api || (!apiReady && 'opacity-50')}`}
											onClick={() => {
												setOpen(true);
											}}
										>
											<Image
												src={'assets/icons/delegate-profile.svg'}
												width={16}
												height={16}
												alt=''
											/>
											<span>Delegate</span>
										</div>
										to this address
									</span>
								)}
							</div>
						</div>
					) : (
						<>
							<div className='mt-3 grid grid-cols-2 items-end gap-6 max-lg:grid-cols-1 sm:mt-6'>
								{filteredDelegates?.slice((currentPage - 1) * DELEGATION_LISTING, (currentPage - 1) * DELEGATION_LISTING + DELEGATION_LISTING)?.map((delegate, index) => (
									<DelegateCard
										key={index}
										delegate={delegate}
										disabled={!delegationDashboardAddress}
										// handleUsername={(objWithUsername) => handleUsernameUpdateInDelegate(objWithUsername)}
									/>
								))}
							</div>
							{delegatesData?.current?.length > DELEGATION_LISTING && (
								<div className='mt-6 flex justify-end'>
									<Pagination
										theme={resolvedTheme as any}
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
					<DelegateModal
						defaultTarget={searchInput}
						open={open}
						setOpen={setOpen}
					/>
				</div>
			</Spin>
		</div>
	);
};

export default styled(TrendingDelegates)`
	.placeholderColor .ant-input-group-addon {
		background: var(--pink_primary);
		color: white !important;
		font-size: 12px;
		border: 1px solid var(--pink_primary);
	}
	.ant-input-affix-wrapper > input.ant-input {
		background: #edeff3;
		color: ${(props: any) => (props.theme === 'dark' ? 'white' : 'var(--lightBlue)')} !important;
		font-size: 14px !important;
	}
	@media (max-width: 640px) {
		.ant-input-affix-wrapper > input.ant-input {
			background: #edeff3;
			color: ${(props: any) => (props.theme === 'dark' ? 'white' : 'var(--lightBlue)')} !important;
			font-size: 10px !important;
		}
	}
`;
