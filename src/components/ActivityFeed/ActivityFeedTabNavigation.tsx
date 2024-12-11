// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useRef, useState } from 'react';
import { networkTrackInfo } from 'src/global/post_trackInfo';
import {
	AllPostIcon,
	FellowshipIconNew,
	GovernanceIconNew,
	RootIcon,
	SelectedGovernance,
	SelectedRoot,
	SelectedTreasury,
	SelectedWhitelist,
	SelectedWishForChange,
	StakingAdminIcon,
	TreasuryIconNew,
	WishForChangeIcon
} from '~src/ui-components/CustomIcons';
import ThreeDotsIcon from '~assets/icons/three-dots.svg';
import { ITabItem, ITabNavigationProps } from './types/types';
import Popover from '~src/basic-components/Popover';
import { useGlobalSelector } from '~src/redux/selectors';
import { ArrowDownIcon } from '~src/ui-components/CustomIcons';
import { getSpanStyle } from '~src/ui-components/TopicTag';
import ImageIcon from '~src/ui-components/ImageIcon';
import { useTheme } from 'next-themes';
import { dmSans } from 'pages/_app';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

const ActivityFeedTabNavigation: React.FC<ITabNavigationProps> = ({ currentTab, setCurrentTab, gov2LatestPosts, network }) => {
	const [currentCategory, setCurrentCategory] = useState<string | null>(null);
	const [isTrackDropdownOpen, setIsTrackDropdownOpen] = useState<boolean>(false);
	const { is_sidebar_collapsed } = useGlobalSelector();
	const dropdownRef = useRef<HTMLDivElement | null>(null);
	const { resolvedTheme: theme } = useTheme();
	const { t } = useTranslation('common');

	const tabItems: ITabItem[] = Object.keys(networkTrackInfo[network] || {}).reduce((acc: ITabItem[], trackName) => {
		const trackInfo = networkTrackInfo[network][trackName];
		const trackId = trackInfo.trackId;

		if (!trackInfo?.fellowshipOrigin) {
			const postsCount = gov2LatestPosts.filter((post: { track_no: number }) => post.track_no === trackId).length;

			acc.push({
				group: trackInfo.group || 'Other',
				key: trackName
					.split(/(?=[A-Z])/)
					.join('-')
					.toLowerCase(),
				label: trackName.split(/(?=[A-Z])/).join(' '),
				posts: postsCount
			});
		}

		return acc;
	}, []);

	const dynamicGroups = ['Governance', 'Treasury', 'Whitelist'];
	const filteredGroups = tabItems.reduce(
		(acc: { [key: string]: string[] }, item) => {
			if (dynamicGroups.includes(item.group)) {
				if (!acc[item.group]) {
					acc[item.group] = [];
				}
				acc[item.group].push(item.key);
			}
			return acc;
		},
		{} as { [key: string]: string[] }
	);

	const tabIcons: { [key: string]: JSX.Element } = {
		all: (
			<ImageIcon
				src={`${theme === 'dark' ? '/assets/activityfeed/darkallpost.svg' : '/assets/allpost.svg'}`}
				alt='All Posts'
				className='-mt-0.5 scale-90 text-xl font-medium text-lightBlue dark:text-icon-dark-inactive'
			/>
		),
		root: <RootIcon className=' scale-90 text-xl font-medium text-lightBlue dark:text-icon-dark-inactive' />,
		'wish-for-change': <WishForChangeIcon className=' scale-90 text-xl font-medium text-lightBlue dark:text-icon-dark-inactive' />,
		// eslint-disable-next-line sort-keys
		admin: <StakingAdminIcon className=' scale-90 text-xl font-medium text-lightBlue dark:text-icon-dark-inactive' />,
		governance: <GovernanceIconNew className='-mt-0.5 scale-90 text-2xl font-medium text-lightBlue dark:text-icon-dark-inactive' />,
		treasury: <TreasuryIconNew className='-mt-0.5 scale-90 text-2xl font-medium text-lightBlue dark:text-icon-dark-inactive' />,
		whitelist: <FellowshipIconNew className=' scale-90 text-2xl font-medium text-lightBlue dark:text-icon-dark-inactive' />
	};
	const SelectedAllPostIcon = styled(AllPostIcon)`
		filter: brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7151%) hue-rotate(321deg) brightness(90%) contrast(101%);
	`;
	const SelectedRootIcon = styled(SelectedRoot)`
		filter: brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7151%) hue-rotate(321deg) brightness(90%) contrast(101%);
	`;

	const SelectedWishForChangeIcon = styled(SelectedWishForChange)`
		filter: brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7151%) hue-rotate(321deg) brightness(90%) contrast(101%);
	`;

	const selectedtabIcons: { [key: string]: JSX.Element } = {
		all: (
			<div className='selected-icon mt-0.5 scale-90 text-2xl font-medium '>
				<SelectedAllPostIcon />
			</div>
		),
		root: (
			<div className='selected-icon mt-0.5 scale-90 text-2xl font-medium '>
				<SelectedRootIcon />
			</div>
		),
		// eslint-disable-next-line sort-keys
		'wish-for-change': (
			<div className='selected-icon -mr-1 scale-90 text-2xl font-medium '>
				<SelectedWishForChangeIcon />
			</div>
		),
		// eslint-disable-next-line sort-keys
		admin: (
			<ImageIcon
				src='/assets/selected-icons/Staking Admin.svg'
				alt='Staking Admin'
				className=' selected-icon -mr-1 -mt-1 w-6 scale-90 text-3xl font-medium text-lightBlue dark:text-icon-dark-inactive'
			/>
		),
		governance: <SelectedGovernance className='selected-icon -mt-0.5  scale-90 text-2xl font-medium text-lightBlue dark:text-icon-dark-inactive' />,
		treasury: <SelectedTreasury className='selected-icon -mt-0.5  scale-90 text-2xl font-medium text-lightBlue dark:text-icon-dark-inactive' />,
		whitelist: <SelectedWhitelist className=' selected-icon  -mt-0.5  scale-90 text-2xl font-medium text-lightBlue dark:text-icon-dark-inactive' />
	};

	const tabCategories: { [key: string]: string[] } = {
		All: ['all'],
		Root: ['root'],
		['Wish For Change']: ['wish-for-change'],
		// eslint-disable-next-line sort-keys
		Admin: tabItems.filter((item) => item?.key === 'staking-admin' || item?.key === 'auction-admin')?.map((item) => item?.key),
		...filteredGroups
	};
	const handleCategoryClick = (category: string) => {
		if (tabCategories[category]?.length > 1) {
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
		return tabCategories[category]?.some((tabKey) => tabKey === currentTab);
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef?.current && !dropdownRef?.current?.contains(event.target as Node)) {
				setCurrentCategory(null);
				setIsTrackDropdownOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);
	const popoverContent = (
		<div className='font-dmSams left-2 w-40 py-1 text-sm text-gray-700 dark:text-gray-200'>
			<li className='text-md block pb-2 font-semibold text-[#485F7DB2] text-opacity-[70%] dark:text-white'>{t('tracks')}</li>
			{['Treasury', 'Whitelist']?.map((category) => (
				<React.Fragment key={category}>
					<Popover
						content={
							<div className='w-44 text-sm  text-gray-700 dark:text-gray-200'>
								{tabCategories[category]?.map((tabKey) => {
									const tabItem = tabItems?.find((item) => item.key === tabKey);
									const normalizedLabel = tabItem?.label?.replace(/\s+/g, '');
									return (
										tabItem && (
											<p
												key={tabItem.key}
												className={`m-0 cursor-pointer rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white ${
													currentTab === tabItem?.key ? 'bg-[#F2F4F7] text-[#243A57] dark:bg-[#2E2E2E] dark:text-white' : ''
												}`}
												onClick={() => handleTabClick(tabItem?.key)}
											>
												<span className='flex w-full items-center justify-between'>
													<div>
														{tabIcons[tabItem?.key?.toLowerCase()]}
														<span className={`ml-2 ${dmSans.className} ${dmSans.variable}`}>{tabItem?.label} </span>
													</div>
													{tabItem?.posts > 0 && (
														<span
															className={`w-5 rounded-md p-1 text-center text-[12px] text-[#96A4B6] dark:text-[#595959] ${getSpanStyle(normalizedLabel || '', tabItem?.posts)}`}
														>
															{tabItem?.posts}
														</span>
													)}
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
							className={`m-0 flex cursor-pointer justify-between rounded-lg px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white ${
								isTabSelected(category) ? 'bg-[#ffe6ef] font-medium text-pink_primary dark:bg-[#530d32]' : ''
							}`}
							onClick={() => handleCategoryClick(category)}
						>
							<span className='flex items-center'>
								{isTabSelected(category) ? selectedtabIcons[category?.toLowerCase()?.replace(/\s+/g, '-')] : tabIcons[category?.toLowerCase()?.replace(/\s+/g, '-')]}
								<span className={`ml-2 ${dmSans.className} ${dmSans.variable} whitespace-nowrap`}>{category}</span>
							</span>
							{tabCategories[category].length > 1 && <ArrowDownIcon className={'ml-1 -rotate-90 transform transition-transform'} />}
						</p>
					</Popover>
				</React.Fragment>
			))}
		</div>
	);

	return (
		<div className=' mb-5 flex  justify-between overflow-x-auto rounded-lg border-[1px] border-solid border-[#D2D8E0] bg-white px-4 pt-3 font-dmSans dark:border dark:border-solid dark:border-[#4B4B4B] dark:bg-[#0D0D0D]'>
			{Object?.keys(tabCategories)
				?.filter((category) => !['Treasury', 'Whitelist']?.includes(category))
				?.map((category, index) => (
					<div
						key={category}
						className='relative flex '
						style={{
							display: is_sidebar_collapsed || index <= 2 ? 'flex' : 'none'
						}}
					>
						{tabCategories[category].length > 1 ? (
							<Popover
								content={
									<div className='w-[220px] divide-y divide-gray-100 pb-2 '>
										<div className='w-full pt-2 text-sm text-gray-700 dark:text-gray-200'>
											{tabCategories[category].map((tabKey) => {
												const tabItem = tabItems?.find((item) => item?.key === tabKey);
												const normalizedLabel = tabItem?.label?.replace(/\s+/g, '');

												return (
													tabItem && (
														<div
															key={tabItem.key}
															className={`block cursor-pointer rounded-lg px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white ${
																currentTab === tabItem?.key ? 'bg-[#F2F4F7] text-[#243A57] dark:bg-[#2E2E2E] dark:text-white' : ''
															}`}
															onClick={() => handleTabClick(tabItem?.key)}
														>
															<span className='flex w-full items-center justify-between py-1'>
																<div>
																	{tabIcons[tabItem?.key?.toLowerCase()]}
																	<span className={`ml-2 whitespace-nowrap ${dmSans.className} ${dmSans.variable}`}>{tabItem.label} </span>
																</div>
																{tabItem.posts > 0 && (
																	<span
																		className={`w-5 rounded-md  text-center text-[12px] text-[#96A4B6] dark:text-[#595959] ${getSpanStyle(normalizedLabel || '', tabItem?.posts)}`}
																	>
																		{tabItem?.posts}
																	</span>
																)}
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
									className={`flex h-9 cursor-pointer items-center justify-between rounded-lg px-2 text-sm font-medium hover:bg-[#F2F4F7] dark:hover:bg-[#9E9E9E] dark:hover:bg-opacity-10 ${
										isTabSelected(category) ? 'rounded-lg bg-[#ffe6ef] p-1 font-medium text-pink_primary dark:bg-[#530d32] ' : 'text-blue-light-medium dark:text-[#9E9E9E]'
									}`}
									onClick={() => handleCategoryClick(category)}
								>
									<span className='flex items-center'>
										{isTabSelected(category) ? selectedtabIcons[category.toLowerCase().replace(/\s+/g, '-')] : tabIcons[category.toLowerCase().replace(/\s+/g, '-')]}
										<span className='ml-2 whitespace-nowrap'>{category}</span>
										{tabCategories[category].length > 1 && <ArrowDownIcon className={'ml-1 transform transition-transform'} />}
									</span>
								</p>
							</Popover>
						) : (
							<p
								className={`flex h-9 cursor-pointer items-center justify-between rounded-lg px-2 text-sm font-medium hover:bg-[#F2F4F7] dark:hover:bg-[#9E9E9E] dark:hover:bg-opacity-10 ${
									isTrackDropdownOpen || isTabSelected(category)
										? 'rounded-lg bg-[#ffe6ef] p-1 font-medium text-pink_primary dark:bg-[#530d32] '
										: 'text-blue-light-medium dark:text-[#9E9E9E]'
								}`}
								onClick={() => handleCategoryClick(category)}
							>
								<span className='flex items-center'>
									{isTabSelected(category) ? (
										<span className=''>{selectedtabIcons[category.toLowerCase().replace(/\s+/g, '-')]}</span>
									) : (
										tabIcons[category.toLowerCase().replace(/\s+/g, '-')]
									)}
									<span className='ml-2 whitespace-nowrap'>{category}</span>
								</span>
							</p>
						)}
					</div>
				))}

			{!is_sidebar_collapsed && (
				<div className='relative flex'>
					<Popover
						content={popoverContent}
						placement={'bottomRight'}
						trigger='click'
						arrow={false}
					>
						<div className='relative flex '>
							<p
								className={`flex h-9 cursor-pointer items-center justify-between gap-2 rounded-lg px-2 text-sm font-medium hover:bg-[#F2F4F7] dark:hover:bg-[#9E9E9E] dark:hover:bg-opacity-10 ${
									isTabSelected('Treasury') ? 'rounded-lg bg-[#ffe6ef] p-1 text-pink_primary dark:bg-[#530d32] dark:text-white' : 'text-blue-light-medium dark:text-[#9E9E9E]'
								}`}
								onClick={() => handleCategoryClick('Treasury')}
							>
								{isTabSelected('Treasury') ? selectedtabIcons['treasury'] : tabIcons['treasury']}
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
						className='relative flex flex-col  pt-2'
					>
						<Popover
							content={
								<div className='absolute -left-14 -top-[3px] z-50 w-48 divide-y  divide-gray-100 rounded-lg bg-white  pb-2 shadow dark:bg-gray-700'>
									<div className='w-full pt-2 text-sm text-gray-700 dark:text-gray-200'>
										{tabCategories[category].map((tabKey) => {
											const tabItem = tabItems.find((item) => item.key === tabKey);
											const normalizedLabel = tabItem?.label?.replace(/\s+/g, '');

											return (
												tabItem && (
													<div
														key={tabItem.key}
														className={` block cursor-pointer  px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white ${
															currentTab === tabItem.key ? 'bg-[#F2F4F7] text-[#243A57] dark:bg-[#2E2E2E] dark:text-white' : ''
														}`}
														onClick={() => handleTabClick(tabItem.key)}
													>
														<span className='flex w-full items-center justify-between'>
															<div>
																{tabIcons[tabItem.key.toLowerCase()]}
																<span className={`ml-2 whitespace-nowrap ${dmSans.className} ${dmSans.variable}`}>{tabItem.label} </span>
															</div>
															{tabItem.posts > 0 && (
																<span
																	className={`w-5 rounded-md p-1 text-center text-[12px] text-[#96A4B6] dark:text-[#595959] ${getSpanStyle(normalizedLabel || '', tabItem.posts)}`}
																>
																	{tabItem.posts}
																</span>
															)}
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
								className={`-mt-[6px] flex h-9 cursor-pointer items-center justify-between rounded-lg px-2 text-sm font-medium hover:bg-[#F2F4F7] dark:hover:bg-[#9E9E9E] dark:hover:bg-opacity-10 ${
									isTabSelected(category)
										? ' rounded-lg bg-[#ffe6ef] font-medium text-pink_primary dark:bg-[#530d32] dark:text-white'
										: 'text-blue-light-medium dark:text-[#9E9E9E]'
								}`}
								onClick={() => handleCategoryClick(category)}
							>
								<span className='flex items-center'>
									{isTabSelected(category) ? selectedtabIcons[category.toLowerCase().replace(/\s+/g, '-')] : tabIcons[category.toLowerCase().replace(/\s+/g, '-')]}
									<span className='ml-2 whitespace-nowrap'>{category}</span>
									{tabCategories[category].length > 1 && <ArrowDownIcon className={'ml-1 transform transition-transform'} />}
								</span>
							</p>
						</Popover>
					</div>
				))}
		</div>
	);
};

export default ActivityFeedTabNavigation;
