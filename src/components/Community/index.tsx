// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Radio, Spin } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import Popover from '~src/basic-components/Popover';
import Input from '~src/basic-components/Input';
import InputClearIcon from '~assets/icons/close-tags.svg';
import ImageIcon from '~src/ui-components/ImageIcon';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import classNames from 'classnames';
import { SearchOutlined } from '@ant-design/icons';
import TabButtons from './TabButtons';
import DelegatesTab from './Tabs/Delegations/DelegatesTab';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { ECuratorsSortFilters, EDelegationAddressFilters, EDelegationSourceFilters, EExpertsSortFilters, EMembersSortFilters, IDelegateAddressDetails } from '~src/types';
import getIdentityInformation from '~src/auth/utils/getIdentityInformation';
import { poppins } from 'pages/_app';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { BN } from 'bn.js';
import { useCommunityTabSelector, useNetworkSelector } from '~src/redux/selectors';
import { useApiContext, usePeopleChainApiContext } from '~src/context';
import { ECommunityTabs } from '~src/redux/communityTab/@types';
import { useDispatch } from 'react-redux';
import { communityTabActions } from '~src/redux/communityTab';
import ExpertsTab from './Tabs/Experts/ExpertsTab';
import { FollowersResponse } from 'pages/api/v1/fetch-follows/followersAndFollowingInfo';
import { defaultIdentityInfo } from './utils';
import { User } from '~src/auth/types';
import MembersTab from './Tabs/Members/MembersTab';
import { ExpertRequestResponse } from 'pages/api/v1/communityTab/getAllExperts';
import { UsersResponse } from 'pages/api/v1/communityTab/getAllUsers';
import CuratorsTab from './Tabs/Curators/CuratorsTab';
import { curatorsResponse } from 'pages/api/v1/communityTab/getAllCurators';

const Community = () => {
	const { network } = useNetworkSelector();
	const { selectedTab, searchedUserName } = useCommunityTabSelector();
	const { api, apiReady } = useApiContext();
	const { peopleChainApi, peopleChainApiReady } = usePeopleChainApiContext();
	const [loading, setLoading] = useState<boolean>(false);
	const [filteredDelegates, setFilteredDelegates] = useState<IDelegateAddressDetails[]>([]);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const delegatesData = useRef<IDelegateAddressDetails[]>([]);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [searchInput, setSearchInput] = useState<string>('');
	const { resolvedTheme: theme } = useTheme();
	const [membersData, setMembersData] = useState<any>();
	const [totalMembers, setTotalMembers] = useState<number>();
	const [expertsData, setExpertsData] = useState<any>();
	const [totalExperts, setTotalExperts] = useState<number>();
	const [curatorsData, setCuratorsData] = useState<any>();
	const [totalCurators, setTotalCurators] = useState<number>();
	const [totalDelegates, setTotalDelegates] = useState<number>();
	const [sortOption, setSortOption] = useState<EDelegationAddressFilters | null>(null);
	const [membersSortOption, setMembersSortOption] = useState<EMembersSortFilters | null>(null);
	const [expertsSortOption, setExpertsSortOption] = useState<EExpertsSortFilters | null>(null);
	const [curatorsSortOption, setCuratorsSortOption] = useState<ECuratorsSortFilters | null>(null);
	const [selectedSources, setSelectedSources] = useState<string[]>(
		selectedTab === ECommunityTabs?.MEMBERS ? ['All', 'Verified', 'Non-Verified'] : Object?.values(EDelegationSourceFilters)
	);
	const dispatch = useDispatch();

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

		await Promise?.allSettled(identityInfoPromises);
		const updatedData = delegates?.map((delegate: IDelegateAddressDetails) => {
			return {
				...delegate,
				identityInfo: identityInfo?.[delegate?.address] || null,
				username: identityInfo?.[delegate?.address]?.display || identityInfo?.[delegate?.address]?.legal || ''
			};
		});

		delegatesData.current = updatedData;
		setFilteredDelegates(updatedData || delegatesData?.current);
	};

	const getData = async () => {
		if (!(api && peopleChainApiReady) || !network) return;
		setLoading(true);

		const { data, error } = await nextApiClientFetch<IDelegateAddressDetails[]>('api/v1/delegations/getAllDelegates');
		if (data) {
			//putting polkassembly Delegate first;
			const updatedDelegates = data || [];
			setTotalDelegates(data?.length);

			updatedDelegates?.sort((a: any, b: any) => {
				const addressess = [getSubstrateAddress('13mZThJSNdKUyVUjQE9ZCypwJrwdvY8G5cUCpS9Uw4bodh4t')];
				const aIndex = addressess?.indexOf(getSubstrateAddress(a?.address));
				const bIndex = addressess?.indexOf(getSubstrateAddress(b?.address));

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
			console?.log(error);
			setLoading(false);
		}
	};

	const handleBeneficiaryIdentityInfo = async (user: User) => {
		if (!api || !apiReady || !user?.addresses?.length) return;

		const promiseArr = user?.addresses?.map((address) => getIdentityInformation({ address, api: peopleChainApi ?? api, network }));

		try {
			const resolved = await Promise.all(promiseArr);
			user.identityInfo = resolved[0] || defaultIdentityInfo;
		} catch (err) {
			console?.error('Error fetching identity info:', err);
			user.identityInfo = defaultIdentityInfo;
		}
	};

	const getFollowersData = async (userId: number) => {
		const { data, error } = await nextApiClientFetch<FollowersResponse>('api/v1/fetch-follows/followersAndFollowingInfo', { userId });
		if (!data && error) {
			return { followers: 0, followings: 0 };
		}
		return { followers: data?.followers?.length || 0, followings: data?.following?.length || 0 };
	};

	const getMembersData = async () => {
		if (!(api && peopleChainApiReady) || !network) return;
		setLoading(true);
		let body = {};
		if (searchedUserName) {
			body = {
				username: searchedUserName
			};
		} else {
			body = {
				page: currentPage || 1
			};
		}

		const { data, error } = await nextApiClientFetch<UsersResponse>('api/v1/communityTab/getAllUsers', body);
		if (data) {
			let updatedUserData = await Promise.all(
				data.data.map(async (user) => {
					await handleBeneficiaryIdentityInfo(user);
					const followersData = await getFollowersData(user.id);
					return { ...user, followers: followersData.followers, followings: followersData.followings };
				})
			);

			if (membersSortOption === EMembersSortFilters.ALPHABETICAL) {
				updatedUserData = updatedUserData.sort((a, b) => a?.username?.toLowerCase().localeCompare(b.username.toLocaleLowerCase()));
			}

			if (membersSortOption === EMembersSortFilters.FOLLOWERS) {
				updatedUserData = updatedUserData.sort((a, b) => b.followers - a.followers);
			}

			if (membersSortOption === EMembersSortFilters.FOLLOWINGS) {
				updatedUserData = updatedUserData.sort((a, b) => b.followings - a.followings);
			}

			setMembersData(updatedUserData);
			setTotalMembers(data?.count);
		} else {
			console?.log(error);
		}
		setLoading(false);
	};

	const getExpertsData = async () => {
		if (!(api && peopleChainApiReady) || !network) return;
		setLoading(true);
		let body = {};
		if (searchedUserName) {
			body = {
				username: searchedUserName
			};
		}
		const { data, error } = await nextApiClientFetch<ExpertRequestResponse>('api/v1/communityTab/getAllExperts', body);
		if (data) {
			let usersWithFollowers = await Promise.all(
				data.data.map(async (user) => {
					const followersData = await getFollowersData(user.userId);
					return { ...user, followers: followersData?.followers || 0, followings: followersData?.followings || 0 };
				})
			);

			if (expertsSortOption === EExpertsSortFilters.FOLLOWERS) {
				usersWithFollowers = usersWithFollowers.sort((a, b) => b.followers - a.followers);
			}
			if (expertsSortOption === EExpertsSortFilters.FOLLOWINGS) {
				usersWithFollowers = usersWithFollowers.sort((a, b) => b.followings - a.followings);
			}
			if (expertsSortOption === EExpertsSortFilters.REVIEWS_COUNT) {
				usersWithFollowers = usersWithFollowers.sort((a, b) => b?.review_count - a?.review_count);
			}

			setExpertsData(usersWithFollowers);
			setTotalExperts(data.count);
		} else {
			console?.log(error);
		}
		setLoading(false);
	};

	const getCuratorsData = async () => {
		if (!(api && peopleChainApiReady) || !network) return;

		let body = {};
		if (searchedUserName) {
			body = {
				username: searchedUserName
			};
		} else {
			body = {
				page: currentPage || 1
			};
		}
		setLoading(true);
		const { data, error } = await nextApiClientFetch<curatorsResponse>('api/v1/communityTab/getAllCurators', body);
		if (data?.curators) {
			let sortedData = data?.curators;
			if (curatorsSortOption === ECuratorsSortFilters.ACTIVE_BOUNTIES) {
				sortedData = sortedData.sort((a, b) => b.active - a.active);
			}
			if (curatorsSortOption === ECuratorsSortFilters.CHILD_BOUNTIES_DISBURSED) {
				sortedData = sortedData.sort((a, b) => b.disbursedChildBounty - a.disbursedChildBounty);
			}
			setCuratorsData(sortedData);
			setTotalCurators(data?.count);
			setLoading(false);
		} else {
			console?.log(error);
		}
		setLoading(false);
	};

	useEffect(() => {
		getData();
		getExpertsData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, peopleChainApi, peopleChainApiReady, apiReady, network, currentPage, membersSortOption]);

	useEffect(() => {
		getMembersData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, peopleChainApi, peopleChainApiReady, apiReady, network, currentPage, searchedUserName]);

	useEffect(() => {
		getCuratorsData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, peopleChainApi, peopleChainApiReady, apiReady, network, currentPage, searchedUserName]);

	const getResultsDataAccordingToFilter = (filterBy: EDelegationAddressFilters, data: IDelegateAddressDetails[]): IDelegateAddressDetails[] => {
		switch (filterBy) {
			case EDelegationAddressFilters?.DELEGATED_VOTES:
				return data?.sort((a, b) => new BN(b?.delegatedBalance)?.cmp(new BN(a?.delegatedBalance)));
			case EDelegationAddressFilters?.RECEIVED_DELEGATIONS:
				return data?.sort((a, b) => b?.receivedDelegationsCount - a?.receivedDelegationsCount);
			case EDelegationAddressFilters?.VOTED_PROPOSALS:
				return data?.sort((a, b) => b?.votedProposalsCount - a?.votedProposalsCount);
			default:
				return data;
		}
	};

	const handleRadioChange = (e: any) => {
		setLoading(true);
		setCurrentPage(1);
		const selectedOption = e?.target?.value;
		const updatedSortOption = sortOption === selectedOption ? null : selectedOption;
		setSortOption(updatedSortOption);
		setMembersSortOption(updatedSortOption);
		setExpertsSortOption(updatedSortOption);
		setCuratorsSortOption(updatedSortOption);
		const searchOutput = searchInput?.length
			? delegatesData?.current?.filter((delegate: any) => delegate?.address?.match(searchInput) || delegate?.username?.toLowerCase()?.match(searchInput?.toLowerCase()))
			: null;

		const fromFilterContent = searchOutput?.length ? searchOutput : delegatesData?.current;
		const data = getResultsDataAccordingToFilter(selectedOption, fromFilterContent);
		setFilteredDelegates(data || []);
		setLoading(false);
	};

	const handleSearchSubmit = () => {
		if (selectedTab === ECommunityTabs?.DELEGATES) {
			if (!searchInput?.length) {
				setFilteredDelegates(delegatesData?.current);
				return;
			}
			setCurrentPage(1);
			setLoading(true);
			const searchOutput = delegatesData?.current?.filter(
				(delegate: any) => delegate?.address?.match(searchInput) || delegate?.username?.toLowerCase()?.match(searchInput?.toLowerCase())
			);
			setFilteredDelegates(searchOutput || []);
			setLoading(false);
		} else {
			dispatch(communityTabActions?.setSearchedUsername(searchInput));
		}
	};

	const filterDelegatesBySources = (data: IDelegateAddressDetails[], selectedSources: string[]): IDelegateAddressDetails[] => {
		return data?.filter((delegate) => {
			if (selectedSources?.length === 1 && selectedSources[0] === EDelegationSourceFilters?.NA) {
				return !delegate?.dataSource || delegate?.dataSource?.length === 0;
			}

			if (selectedSources?.includes(EDelegationSourceFilters?.NA)) {
				return !delegate?.dataSource || delegate?.dataSource?.length === 0 || selectedSources?.some((source) => delegate?.dataSource?.includes(source));
			}

			return selectedSources?.some((source) => delegate?.dataSource?.includes(source));
		});
	};

	const handleCheckboxChange = (sources: EDelegationSourceFilters[]) => {
		setLoading(true);
		setCurrentPage(1);
		setSelectedSources(sources);
		const searchOutput = searchInput?.length
			? delegatesData?.current?.filter((delegate: any) => delegate?.address?.match(searchInput) || delegate?.username?.toLowerCase()?.match(searchInput?.toLowerCase()))
			: null;

		const fromFilterContent = searchOutput?.length ? searchOutput : delegatesData?.current;
		const data = filterDelegatesBySources(fromFilterContent, sources);
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
		<>
			{selectedTab === ECommunityTabs?.DELEGATES && (
				<div className='flex flex-col'>
					<div className='flex items-center justify-between'>
						<p className='m-0 mb-1 p-0 text-base font-medium text-lightBlue dark:text-blue-dark-medium'>Filter By</p>
						<span
							className={classNames(
								'pb-0?.5 m-0 -mx-3 flex cursor-pointer justify-end p-0 px-3 pt-1 text-sm text-pink_primary dark:border-separatorDark',
								poppins?.className,
								poppins?.variable
							)}
							onClick={() => {
								setSelectedSources([]);
								handleCheckboxChange([]);
							}}
						>
							Clear All
						</span>
					</div>
					<Radio.Group
						onChange={(e) => handleCheckboxChange([e?.target?.value])}
						value={selectedSources[0] || null}
						className={classNames('mt-1 flex flex-col', poppins?.className, poppins?.variable)}
						disabled={loading}
					>
						<div className='flex flex-col gap-1'>
							{Object?.values(EDelegationSourceFilters)?.map((source, index) => {
								return (
									<div
										key={index}
										className={`${poppins?.variable} ${poppins?.className} p-0?.5 flex gap-2 text-sm font-medium tracking-[0?.01em] text-bodyBlue dark:text-blue-dark-high`}
									>
										<Radio
											checked={selectedSources?.includes(source)}
											className='cursor-pointer text-pink_primary'
											value={source}
										/>
										<div className='flex items-center'>
											<span className='w-[25px]'>
												<Image
													src={renderSourceIcon(source)}
													height={20}
													width={20}
													alt=''
													className={source === EDelegationSourceFilters?.NA ? (theme === 'dark' ? 'dark-icons' : '') : ''}
												/>
											</span>
											<span className='text-sm tracking-wide'>{source?.charAt(0)?.toUpperCase() + source?.slice(1)}</span>
										</div>
									</div>
								);
							})}
						</div>
					</Radio.Group>
				</div>
			)}
			{selectedTab === ECommunityTabs?.MEMBERS && (
				<div className='flex flex-col'>
					<div className='flex items-center justify-between'>
						<p className='m-0 mb-1 p-0 text-base font-medium text-lightBlue dark:text-blue-dark-medium'>Filter By</p>
						<span
							className={classNames(
								'pb-0?.5 m-0 -mx-3 flex cursor-pointer justify-end p-0 px-3 pt-1 text-sm text-pink_primary dark:border-separatorDark',
								poppins?.className,
								poppins?.variable
							)}
							onClick={() => {
								setSelectedSources([]);
								handleCheckboxChange([]);
							}}
						>
							Clear All
						</span>
					</div>
					<Radio.Group
						onChange={(e) => handleCheckboxChange([e?.target?.value])}
						value={selectedSources[0] || null}
						className={classNames('mt-1 flex flex-col', poppins?.className, poppins?.variable)}
						disabled={loading}
					>
						<div className='flex flex-col gap-1'>
							{['All', 'Verified', 'Non-Verified']?.map((filterOption, index) => (
								<div
									key={index}
									className={`${poppins?.variable} ${poppins?.className} p-0?.5 flex gap-2 text-sm font-medium tracking-[0?.01em] text-bodyBlue dark:text-blue-dark-high`}
								>
									<Radio
										checked={selectedSources?.includes(filterOption)}
										className='cursor-pointer text-pink_primary'
										value={filterOption}
									/>
									<span className='text-sm tracking-wide'>{filterOption}</span>
								</div>
							))}
						</div>
					</Radio.Group>
				</div>
			)}
		</>
	);

	const sortContent = (
		<>
			<div className='flex flex-col'>
				<div className='flex items-center justify-between'>
					<p className='m-0 mb-1 p-0 text-base font-medium text-lightBlue dark:text-blue-dark-medium'>Sort By</p>
					<span
						className={classNames(
							'pb-0?.5 m-0 -mx-3 flex cursor-pointer justify-end p-0 px-3 pt-1 text-sm text-pink_primary dark:border-separatorDark',
							poppins?.className,
							poppins?.variable
						)}
						onClick={() => {
							setSortOption(null);
						}}
					>
						Clear
					</span>
				</div>
				{selectedTab === ECommunityTabs?.DELEGATES && (
					<Radio.Group
						className='flex flex-col overflow-y-auto'
						onChange={handleRadioChange}
						value={sortOption || null}
						disabled={loading}
					>
						<Radio
							value={EDelegationAddressFilters?.DELEGATED_VOTES}
							className={`${poppins?.variable} ${poppins?.className} my-[1px] flex gap-2 p-1 text-sm font-medium text-bodyBlue dark:text-blue-dark-high`}
						>
							Voting Power
						</Radio>
						<Radio
							value={EDelegationAddressFilters?.VOTED_PROPOSALS}
							className={`${poppins?.variable} ${poppins?.className} my-[1px] flex gap-2 p-1 text-sm font-medium text-bodyBlue dark:text-blue-dark-high`}
						>
							Voted proposals (past 30 days)
						</Radio>
						<Radio
							value={EDelegationAddressFilters?.RECEIVED_DELEGATIONS}
							className={`${poppins?.variable} ${poppins?.className} my-[1px] flex gap-2 p-1 text-sm font-medium text-bodyBlue dark:text-blue-dark-high`}
						>
							Received Delegation(s)
						</Radio>
					</Radio.Group>
				)}
				{selectedTab === ECommunityTabs?.MEMBERS && (
					<Radio.Group
						className='flex flex-col overflow-y-auto'
						onChange={handleRadioChange}
						value={membersSortOption || null}
						disabled={loading}
					>
						<Radio
							value={EMembersSortFilters?.ALPHABETICAL}
							className={`${poppins?.variable} ${poppins?.className} my-[1px] flex gap-2 p-1 text-sm font-medium text-bodyBlue dark:text-blue-dark-high`}
						>
							Alphabetical (Username)
						</Radio>
						<Radio
							value={EMembersSortFilters?.FOLLOWERS}
							className={`${poppins?.variable} ${poppins?.className} my-[1px] flex gap-2 p-1 text-sm font-medium text-bodyBlue dark:text-blue-dark-high`}
						>
							Followers
						</Radio>
						<Radio
							value={EMembersSortFilters?.FOLLOWINGS}
							className={`${poppins?.variable} ${poppins?.className} my-[1px] flex gap-2 p-1 text-sm font-medium text-bodyBlue dark:text-blue-dark-high`}
						>
							Followings
						</Radio>
						<Radio
							value={EMembersSortFilters?.MULTI_SIGNATORY}
							className={`${poppins?.variable} ${poppins?.className} my-[1px] flex gap-2 p-1 text-sm font-medium text-bodyBlue dark:text-blue-dark-high`}
						>
							Multi Signatory
						</Radio>
						<Radio
							value={EMembersSortFilters?.SINGLE_SIGNATORY}
							className={`${poppins?.variable} ${poppins?.className} my-[1px] flex gap-2 p-1 text-sm font-medium text-bodyBlue dark:text-blue-dark-high`}
						>
							Single Signatory
						</Radio>
					</Radio.Group>
				)}
				{selectedTab === ECommunityTabs?.EXPERTS && (
					<Radio.Group
						className='flex flex-col overflow-y-auto'
						onChange={handleRadioChange}
						value={expertsSortOption || null}
						disabled={loading}
					>
						<Radio
							value={EExpertsSortFilters?.FOLLOWERS}
							className={`${poppins?.variable} ${poppins?.className} my-[1px] flex gap-2 p-1 text-sm font-medium text-bodyBlue dark:text-blue-dark-high`}
						>
							Followers
						</Radio>
						<Radio
							value={EExpertsSortFilters?.FOLLOWINGS}
							className={`${poppins?.variable} ${poppins?.className} my-[1px] flex gap-2 p-1 text-sm font-medium text-bodyBlue dark:text-blue-dark-high`}
						>
							Followings
						</Radio>
						<Radio
							value={EExpertsSortFilters?.REVIEWS_COUNT}
							className={`${poppins?.variable} ${poppins?.className} my-[1px] flex gap-2 p-1 text-sm font-medium text-bodyBlue dark:text-blue-dark-high`}
						>
							Review Count
						</Radio>
					</Radio.Group>
				)}
				{selectedTab === ECommunityTabs?.CURATORS && (
					<Radio.Group
						className='flex flex-col overflow-y-auto'
						onChange={handleRadioChange}
						value={curatorsSortOption || null}
						disabled={loading}
					>
						<Radio
							value={ECuratorsSortFilters?.ACTIVE_BOUNTIES}
							className={`${poppins?.variable} ${poppins?.className} my-[1px] flex gap-2 p-1 text-sm font-medium text-bodyBlue dark:text-blue-dark-high`}
						>
							Active bounties
						</Radio>
						<Radio
							value={ECuratorsSortFilters?.CHILD_BOUNTIES_DISBURSED}
							className={`${poppins?.variable} ${poppins?.className} my-[1px] flex gap-2 p-1 text-sm font-medium text-bodyBlue dark:text-blue-dark-high`}
						>
							Child Bounties Disbursed
						</Radio>
					</Radio.Group>
				)}
			</div>
		</>
	);

	return (
		<section>
			<header className='flex flex-col md:flex-row md:items-center md:justify-between md:gap-x-4'>
				<TabButtons
					totalMembers={totalMembers}
					totalExperts={totalExperts}
					totalDelegates={totalDelegates}
					totalCurators={totalCurators}
				/>
				<div className='flex w-full items-center gap-3'>
					<div className='dark:placeholder:white hidden h-12 w-full items-center justify-between rounded-md text-sm font-normal text-[#576D8BCC] dark:text-white sm:flex'>
						<Input
							type='search'
							allowClear={{ clearIcon: <InputClearIcon /> }}
							placeholder='Enter username or address to Delegate vote'
							onChange={(e) => {
								if (selectedTab === ECommunityTabs?.DELEGATES) {
									if (!e?.target?.value?.length) {
										setFilteredDelegates(delegatesData?.current || []);
									}
								}
								setSearchInput(e?.target?.value?.trim());
							}}
							onPressEnter={handleSearchSubmit}
							value={searchInput}
							className='placeholderColor h-10 rounded-none rounded-s-md border-0 border-b-[1px] border-l-[1px] border-t-[1px] border-section-light-container dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
						/>

						<CustomButton
							variant='primary'
							className={classNames('mr-1 h-11 justify-around gap-2 rounded-none rounded-e-md px-4 py-1', loading || !searchInput?.length ? 'opacity-50' : '')}
							height={40}
							onClick={() => {
								handleSearchSubmit();
							}}
							disabled={loading || !searchInput?.length}
						>
							<SearchOutlined />
						</CustomButton>
					</div>

					{selectedTab === ECommunityTabs?.DELEGATES && (
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
					)}

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
			</header>
			{selectedTab === ECommunityTabs?.DELEGATES && (
				<Spin spinning={loading}>
					<DelegatesTab
						currentPage={currentPage}
						setCurrentPage={setCurrentPage}
						filteredDelegates={filteredDelegates}
						loading={loading}
						delegatesData={delegatesData}
					/>
				</Spin>
			)}
			{selectedTab === ECommunityTabs?.MEMBERS && (
				<MembersTab
					totalUsers={totalMembers}
					userData={membersData}
					loading={loading}
					currentPage={currentPage}
					setCurrentPage={setCurrentPage}
				/>
			)}
			{selectedTab === ECommunityTabs?.EXPERTS && (
				<ExpertsTab
					totalUsers={totalExperts}
					userData={expertsData}
					loading={loading}
					currentPage={currentPage}
					setCurrentPage={setCurrentPage}
				/>
			)}
			{selectedTab === ECommunityTabs?.CURATORS && (
				<CuratorsTab
					totalUsers={totalCurators}
					userData={curatorsData}
					loading={loading}
					currentPage={currentPage}
					setCurrentPage={setCurrentPage}
				/>
			)}
		</section>
	);
};

export default Community;
