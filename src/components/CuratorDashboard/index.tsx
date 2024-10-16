// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useState } from 'react';
import { RightOutlined } from '@ant-design/icons';
import Image from 'next/image';
import CuratorProfile from './CuratorProfile';
// import CuratorPendingRequestManager from './PendingRequestManager';

import BountiesCuratorInfo from './BountiesCuratorInfo';
import { useRouter } from 'next/router';

const CuratorDashboardTabItems: FC<{ handleClick: (num: number) => void }> = ({ handleClick }) => {
	const [activeTab, setActiveTab] = useState<string>('general');
	const router = useRouter();

	const tabs = [
		{
			children: <CuratorProfile />,
			description: 'Track your bounty via notifications',
			icon: '/assets/icons/curator-dashboard/general.svg',
			key: 'general',
			title: 'General'
		},
		{
			children: <BountiesCuratorInfo handleClick={handleClick} />,
			description: 'Review and Reward submissions on curated bounties',
			icon: '/assets/icons/curator-dashboard/bounties-curated.svg',
			key: 'bounties-curated',
			title: 'Bounties Curated'
		}
		// {
		// children: <CuratorPendingRequestManager />,
		// description: 'Review curator and child bounty requests',
		// icon: '/assets/icons/curator-dashboard/pending-request.svg',
		// key: 'pending-requests',
		// title: 'Pending Requests'
		// }
	];

	const handleTabClick = (tabKey: string) => {
		setActiveTab(tabKey);
		router.push({
			pathname: router.pathname,
			query: { tab: tabKey }
		});
	};

	return (
		<div className='flex gap-5'>
			<div className='h-[175px]'>
				<div className='mt-3 flex w-[400px] flex-col gap-2   rounded-xl border-[0.7px] border-solid border-[#D2D8E0] bg-white p-5 dark:border-[#494b4d] dark:bg-[#0d0d0d]'>
					{tabs.map((tab) => (
						<div
							key={tab.key}
							className={`flex cursor-pointer items-center justify-between px-3 py-2  transition-colors duration-300 ${
								activeTab === tab.key ? 'rounded-lg border-[0.7px] border-solid border-[text-pink_primary] text-pink_primary  ' : 'border-none text-black dark:text-white'
							}`}
							onClick={() => handleTabClick(tab.key)}
						>
							<div className='flex items-start gap-3'>
								<div className={`flex-shrink-0 rounded-full ${activeTab === tab.key ? 'bg-[#FCE5F2] dark:bg-[#540E33]' : 'bg-[#F0F2F5]'} p-2`}>
									<Image
										src={tab.icon}
										alt={`Curator Dashboard Icon ${tab.key}`}
										width={24}
										height={24}
										style={{
											filter:
												activeTab === tab.key ? 'brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7151%) hue-rotate(321deg) brightness(90%) contrast(101%)' : 'none'
										}}
									/>
								</div>
								<div className='flex flex-col'>
									<span
										className={`${
											activeTab === tab.key && 'font-bold text-pink_primary dark:text-[#FF4098]'
										} whitespace-normal break-words text-[16px] font-medium dark:text-icon-dark-inactive`}
									>
										{tab.title}
									</span>
									<span className={`${activeTab === tab.key && 'text-pink_primary dark:text-[#FF4098]'} mt-1 whitespace-normal break-words text-sm dark:text-icon-dark-inactive`}>
										{tab.description}
									</span>
								</div>
							</div>

							<RightOutlined className='ml-5' />
						</div>
					))}
				</div>
			</div>
			<div className='mt-3 flex-grow'>{activeTab && tabs.find((tab) => tab.key === activeTab)?.children}</div>
		</div>
	);
};

export default CuratorDashboardTabItems;
