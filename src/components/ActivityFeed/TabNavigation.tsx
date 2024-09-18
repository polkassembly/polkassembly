// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useRef, useState } from 'react';
import { networkTrackInfo } from 'src/global/post_trackInfo';
import { DiscussionsIcon, FellowshipGroupIcon, GovernanceGroupIcon, OverviewIcon, StakingAdminIcon, TreasuryGroupIcon } from '~src/ui-components/CustomIcons';
import ThreeDotsIcon from '~assets/icons/three-dots.svg';
import { TabNavigationProps } from './utils/types';
import Popover from '~src/basic-components/Popover';
import { useGlobalSelector } from '~src/redux/selectors';

const TabNavigation: React.FC<TabNavigationProps> = ({ currentTab, setCurrentTab, gov2LatestPosts, network }) => {
	const [currentCategory, setCurrentCategory] = useState<string | null>(null);
	const [isTrackDropdownOpen, setIsTrackDropdownOpen] = useState<boolean>(false);
	const { is_sidebar_collapsed } = useGlobalSelector();
	const dropdownRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setCurrentCategory(null);
				setIsTrackDropdownOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const tabItems = [
		{
			key: 'all',
			label: 'All',
			posts: gov2LatestPosts.filter((post: any) => post.trackName).length
		},
		{
			key: 'discussions',
			label: 'Discussions',
			posts: gov2LatestPosts.filter((post: any) => post.trackName === 'Discussions').length
		}
	];

	if (network && networkTrackInfo[network]) {
		Object.keys(networkTrackInfo[network]).forEach((trackName) => {
			tabItems.push({
				key: trackName
					.split(/(?=[A-Z])/)
					.join('-')
					.toLowerCase(),
				label: trackName.split(/(?=[A-Z])/).join(' '),
				posts: gov2LatestPosts.filter((post: any) => post.trackName === trackName).length
			});
		});
	}

	const tabIcons: { [key: string]: JSX.Element } = {
		all: <OverviewIcon className='mt-1 scale-90 text-xl font-medium text-lightBlue dark:text-icon-dark-inactive' />,
		discussion: <DiscussionsIcon className='mt-1 scale-90 text-xl font-medium text-lightBlue dark:text-icon-dark-inactive' />,
		// eslint-disable-next-line sort-keys
		admin: <StakingAdminIcon className='mt-1 scale-90 text-xl font-medium text-lightBlue dark:text-icon-dark-inactive' />,
		governance: <GovernanceGroupIcon className='mt-1 scale-90 text-xl font-medium text-lightBlue dark:text-icon-dark-inactive' />,
		treasury: <TreasuryGroupIcon className='mt-1 scale-90 text-xl font-medium text-lightBlue dark:text-icon-dark-inactive' />,
		whitelist: <FellowshipGroupIcon className='mt-1 scale-90 text-xl font-medium text-lightBlue dark:text-icon-dark-inactive' />
	};

	const tabCategories: { [key: string]: string[] } = {
		All: ['all'],
		Discussion: ['discussions'],
		// eslint-disable-next-line sort-keys
		Admin: tabItems.filter((item) => item.key === 'staking-admin' || item.key === 'auction-admin').map((item) => item.key),
		Governance: tabItems.filter((item) => ['lease-admin', 'general-admin', 'referendum-canceller', 'referendum-killer'].includes(item.key)).map((item) => item.key),
		Treasury: tabItems
			.filter((item) => ['big-spender', 'medium-spender', 'small-spender', 'big-tipper', 'small-tipper', 'treasurer', 'on-chain-bounties', 'child-bounties'].includes(item.key))
			.map((item) => item.key),
		Whitelist: ['members', 'whitelisted-caller', 'fellowship-admin']
	};

	const handleCategoryClick = (category: string) => {
		if (tabCategories[category].length > 1) {
			setCurrentCategory(currentCategory === category ? null : category);
		} else {
			setCurrentTab(tabCategories[category][0]);
			setCurrentCategory(null);
		}
	};

	const handleTabClick = (tabKey: string) => {
		setCurrentTab(tabKey);
		setCurrentCategory(null);
		setIsTrackDropdownOpen(false);
	};

	const isTabSelected = (category: string) => {
		return tabCategories[category].some((tabKey) => tabKey === currentTab);
	};

	const popoverContent = (
		<div className='left-2 w-40 pt-1 text-sm text-gray-700 dark:text-gray-200'>
			<li className='block pb-2 text-lg font-semibold text-[#485F7DB2] text-opacity-[70%] dark:text-white'>Tracks</li>
			{['Treasury', 'Whitelist'].map((category) => (
				<>
					<Popover
						content={
							<div className='pt-2 text-sm text-gray-700 dark:text-gray-200'>
								{tabCategories[category].map((tabKey) => {
									const tabItem = tabItems.find((item) => item.key === tabKey);
									return (
										tabItem && (
											<p
												key={tabItem.key}
												className={` cursor-pointer rounded-lg  hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white ${
													currentTab === tabItem.key ? 'bg-[#F2F4F7] text-[#243A57] dark:bg-[#2E2E2E] dark:text-white' : ''
												}`}
												onClick={() => handleTabClick(tabItem.key)}
											>
												<span className='flex items-center'>
													{tabIcons[tabItem.key.toLowerCase()]}
													<span className='pl-2'>
														{tabItem.label} ({tabItem.posts})
													</span>
												</span>
											</p>
										)
									);
								})}
							</div>
						}
						placement={'right'}
						trigger='hover'
						arrow={true}
					>
						<p
							key={category}
							className={`block cursor-pointer rounded-lg px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white ${
								isTabSelected(category) ? 'bg-[#F2F4F7] text-[#243A57] dark:bg-[#2E2E2E] dark:text-white' : ''
							}`}
						>
							<span className='flex items-center'>
								{tabIcons[category.toLowerCase()]}
								<span className='ml-2'>
									{category} ({tabItems.find((item) => tabCategories[category].includes(item.key))?.posts || 0})
								</span>
							</span>
						</p>
					</Popover>
				</>
			))}
		</div>
	);

	return (
		<div className='activityborder mb-5 flex justify-between rounded-lg bg-white pt-3 dark:border dark:border-solid dark:border-[#4B4B4B] dark:bg-[#0D0D0D]'>
			{Object.keys(tabCategories)
				.filter((category) => !['Treasury', 'Whitelist'].includes(category))
				.map((category, index) => (
					<div
						key={category}
						className='relative flex px-[10px]'
						style={{
							display: is_sidebar_collapsed || index <= 2 ? 'flex' : 'none'
						}}
					>
						<p
							className={`flex cursor-pointer items-center justify-between px-2 text-sm font-medium ${
								isTabSelected(category) ? 'rounded-lg bg-[#F2F4F7] p-1 text-[#243A57] dark:bg-[#2E2E2E] dark:text-white' : 'text-[#485F7D] dark:text-[#9E9E9E]'
							}`}
						>
							<span className='flex items-center'>
								{tabIcons[category.toLowerCase()]}
								<span
									onClick={() => handleCategoryClick(category)}
									className='ml-2 whitespace-nowrap'
								>
									{category} <span className='ml-1'>({tabItems.find((item) => tabCategories[category].includes(item.key))?.posts || 0})</span>
								</span>
							</span>
						</p>

						{currentCategory === category && tabCategories[category].length > 1 && (
							<div
								ref={dropdownRef}
								id='dropdown'
								className='absolute left-0 top-5 z-50 mt-2 w-44 divide-y divide-gray-100 rounded-lg bg-white shadow dark:bg-gray-700'
							>
								<ul className='pt-2 text-sm text-gray-700 dark:text-gray-200'>
									{tabCategories[category].map((tabKey) => {
										const tabItem = tabItems.find((item) => item.key === tabKey);
										return (
											tabItem && (
												<p
													key={tabItem.key}
													className={`block cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white ${
														currentTab === tabItem.key ? 'bg-[#F2F4F7] text-[#243A57] dark:bg-[#2E2E2E] dark:text-white' : ''
													}`}
													onClick={() => handleTabClick(tabItem.key)}
												>
													<span className='flex items-center'>
														{tabIcons[tabItem.key.toLowerCase()]}
														<span className='ml-2'>
															{tabItem.label} ({tabItem.posts})
														</span>
													</span>
												</p>
											)
										);
									})}
								</ul>
							</div>
						)}
					</div>
				))}

			{!is_sidebar_collapsed && (
				<div className='relative flex px-[10px]'>
					<Popover
						content={popoverContent}
						placement={'bottomRight'}
						trigger='click'
						arrow={false}
					>
						<div className='relative flex px-[10px]'>
							<p
								className={`flex cursor-pointer items-center justify-between gap-2 px-2 text-sm font-medium ${
									isTrackDropdownOpen ? 'rounded-lg bg-[#F2F4F7] p-1 text-[#243A57] dark:bg-[#2E2E2E] dark:text-white' : 'text-[#485F7D] dark:text-[#9E9E9E]'
								}`}
							>
								{tabIcons['treasury']}
								Treas <ThreeDotsIcon />
							</p>
						</div>
					</Popover>
				</div>
			)}
			{is_sidebar_collapsed &&
				['Treasury', 'Whitelist'].map((category) => (
					<div
						key={category}
						className='relative flex flex-col px-[10px] pt-1'
					>
						<Popover
							content={
								<div className='absolute -left-14 -top-[3px] z-50 w-44 divide-y  divide-gray-100 rounded-lg bg-white  pb-2 shadow dark:bg-gray-700'>
									<div className='pt-2 text-sm text-gray-700 dark:text-gray-200'>
										{tabCategories[category].map((tabKey) => {
											const tabItem = tabItems.find((item) => item.key === tabKey);
											return (
												tabItem && (
													<div
														key={tabItem.key}
														className={`block cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white ${
															currentTab === tabItem.key ? 'bg-[#F2F4F7] text-[#243A57] dark:bg-[#2E2E2E] dark:text-white' : ''
														}`}
														onClick={() => handleTabClick(tabItem.key)}
													>
														<span className='flex items-center'>
															{tabIcons[tabItem.key.toLowerCase()]}
															<span className='ml-2'>
																{tabItem.label} ({tabItem.posts})
															</span>
														</span>
													</div>
												)
											);
										})}
									</div>
								</div>
							}
							placement='bottom'
							trigger='click'
							arrow={false}
						>
							<p
								className={`flex cursor-pointer items-center justify-between px-2 text-sm font-medium ${
									isTabSelected(category) ? 'rounded-lg bg-[#F2F4F7] p-1 text-[#243A57] dark:bg-[#2E2E2E] dark:text-white' : 'text-[#485F7D] dark:text-[#9E9E9E]'
								}`}
							>
								<span className='flex items-center'>
									{tabIcons[category.toLowerCase()]}
									<span className='ml-2 whitespace-nowrap'>
										{category} <span className='ml-1'>({tabItems.find((item) => tabCategories[category].includes(item.key))?.posts || 0})</span>
									</span>
								</span>
							</p>
						</Popover>
					</div>
				))}
		</div>
	);
};

export default TabNavigation;
