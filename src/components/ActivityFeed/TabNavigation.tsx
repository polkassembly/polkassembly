// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useRef, useState } from 'react';
import { networkTrackInfo } from 'src/global/post_trackInfo';
import { DiscussionsIcon, FellowshipGroupIcon, GovernanceGroupIcon, OverviewIcon, StakingAdminIcon, TreasuryGroupIcon } from '~src/ui-components/CustomIcons';
import { TabNavigationProps } from './utils/types';

const TabNavigation: React.FC<TabNavigationProps> = ({ currentTab, setCurrentTab, gov2LatestPosts, network }) => {
	const [currentCategory, setCurrentCategory] = useState<string | null>(null);
	const dropdownRef = useRef<HTMLDivElement | null>(null);

	const tabItems = [
		{
			key: 'all',
			label: 'All',
			posts: gov2LatestPosts.allGov2Posts?.data?.posts || []
		},
		{
			key: 'discussions',
			label: 'Discussions',
			posts: gov2LatestPosts.discussionPosts?.data?.posts || []
		}
	];

	if (network) {
		for (const trackName of Object.keys(networkTrackInfo[network])) {
			tabItems.push({
				key: trackName
					.split(/(?=[A-Z])/)
					.join('-')
					.toLowerCase(),
				label: trackName.split(/(?=[A-Z])/).join(' '),
				posts: gov2LatestPosts[trackName]?.data?.posts || []
			});
		}
	}

	const tabIcons: { [key: string]: JSX.Element } = {
		admin: <StakingAdminIcon className='mt-1 scale-90 text-xl font-medium text-lightBlue dark:text-icon-dark-inactive' />,
		all: <OverviewIcon className='mt-1 scale-90 text-xl font-medium text-lightBlue dark:text-icon-dark-inactive' />,
		discussion: <DiscussionsIcon className='mt-1 scale-90 text-xl font-medium text-lightBlue dark:text-icon-dark-inactive' />,
		governance: <GovernanceGroupIcon className='mt-1 scale-90 text-xl font-medium text-lightBlue dark:text-icon-dark-inactive' />,
		treasury: <TreasuryGroupIcon className='mt-1 scale-90 text-xl font-medium text-lightBlue dark:text-icon-dark-inactive' />,
		whitelist: <FellowshipGroupIcon className='mt-1 scale-90 text-xl font-medium text-lightBlue dark:text-icon-dark-inactive' />
	};

	const tabCategories: { [key: string]: string[] } = {
		Admin: tabItems.filter((item) => item.key === 'staking-admin' || item.key === 'auction-admin').map((item) => item.key),
		All: ['all'],
		Discussion: ['discussions'],
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
	};

	return (
		<div className='activityborder mb-5 flex justify-between rounded-lg bg-white pt-3'>
			{Object.keys(tabCategories).map((category) => (
				<div
					key={category}
					className='relative flex px-5'
				>
					<p
						className={`flex cursor-pointer items-center justify-between px-2 text-sm font-medium ${
							currentTab === tabCategories[category][0] ? 'rounded-lg bg-[#F2F4F7] p-1 ' : ''
						}`}
						onClick={() => handleCategoryClick(category)}
					>
						<span className='flex items-center'>
							{tabIcons[category.toLowerCase()]}
							<span className='ml-2'>{category}</span>
						</span>
						{tabCategories[category].length > 1 && (
							<svg
								className='ml-2 h-2.5 w-2.5'
								aria-hidden='true'
								xmlns='http://www.w3.org/2000/svg'
								fill='none'
								viewBox='0 0 10 6'
							>
								<path
									stroke='currentColor'
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth='2'
									d='m1 1 4 4 4-4'
								/>
							</svg>
						)}
					</p>

					{currentCategory === category && tabCategories[category].length > 1 && (
						<div
							ref={dropdownRef}
							id='dropdown'
							className='absolute left-0 top-5 z-50 mt-2 w-44 divide-y divide-gray-100 rounded-lg bg-white shadow dark:bg-gray-700'
						>
							<ul className='py-2 text-sm text-gray-700 dark:text-gray-200'>
								{tabCategories[category].map((tabKey) => {
									const tabItem = tabItems.find((item) => item.key === tabKey);
									return (
										tabItem && (
											<p
												key={tabItem.key}
												className='block cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white'
												onClick={() => handleTabClick(tabItem.key)}
											>
												<span className='flex items-center'>
													{tabIcons[tabItem.key.toLowerCase()]}
													<span className='ml-2'>
														{tabItem.label} ({tabItem.posts.length})
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
		</div>
	);
};

export default TabNavigation;
