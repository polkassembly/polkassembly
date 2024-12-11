// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState } from 'react';
import { RightOutlined } from '@ant-design/icons';
import Image from 'next/image';
import CuratorProfile from './CuratorProfile';
import BountiesCuratorInfo from './BountiesCuratorInfo';
import { useRouter } from 'next/router';
import { spaceGrotesk } from 'pages/_app';
import CuratorPendingRequestManager from './PendingRequestManager';
import { useTheme } from 'next-themes';
import classNames from 'classnames';
import { useTranslation } from 'next-i18next';

interface Props {
	handleClick: () => void;
}

enum ECuratorDashboardTabs {
	GENERAL = 'general',
	CURATED = 'curated',
	PENDING_REQUESTS = 'pending-requests'
}

const CuratorDashboardTabItems = ({ handleClick }: Props) => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const { resolvedTheme: theme } = useTheme();
	const [activeTab, setActiveTab] = useState<ECuratorDashboardTabs>((router?.query?.tab as ECuratorDashboardTabs) || ECuratorDashboardTabs.GENERAL);

	const tabs = [
		{
			children: <CuratorProfile />,
			description: t('curator_general_tab_description'),
			icon: '/assets/icons/curator-dashboard/general.svg',
			key: ECuratorDashboardTabs.GENERAL,
			title: t('curator_general_tab_title')
		},
		{
			children: <BountiesCuratorInfo handleClick={handleClick} />,
			description: t('curator_curated_tab_description'),
			icon: '/assets/icons/curator-dashboard/bounties-curated.svg',
			key: ECuratorDashboardTabs.CURATED,
			title: t('curator_curated_tab_title')
		},
		{
			children: <CuratorPendingRequestManager />,
			description: t('curator_pending_requests_tab_description'),
			icon: '/assets/icons/curator-dashboard/pending-request.svg',
			key: ECuratorDashboardTabs.PENDING_REQUESTS,
			title: t('curator_pending_requests_tab_title')
		}
	];

	const handleTabClick = (tabKey: ECuratorDashboardTabs) => {
		setActiveTab(tabKey);
		router.push({
			pathname: router.pathname,
			query: { tab: tabKey }
		});
	};

	return (
		<div className='flex w-full gap-5'>
			<div className='h-[175px] w-1/3'>
				<div className='mt-3 flex flex-col gap-2 rounded-xl border-[0.7px] border-solid border-section-light-container bg-white p-5 dark:border-[#494b4d] dark:bg-[#0d0d0d]'>
					{tabs.map((tab) => (
						<div
							key={tab.key}
							className={`flex cursor-pointer items-center justify-between px-3 py-2 transition-colors duration-300 ${
								activeTab === tab.key ? 'rounded-lg border-[1.2px] border-solid border-pink_primary text-pink_primary' : 'border-none text-black dark:text-white'
							}`}
							onClick={() => handleTabClick(tab.key)}
						>
							<div className='flex items-start gap-3'>
								<div className={`flex-shrink-0 rounded-full ${activeTab === tab.key ? 'bg-[#FCE5F2] dark:bg-[#540E33]' : 'bg-[#F0F2F5] dark:bg-[#303030]'} p-2`}>
									<Image
										src={tab.icon}
										alt={t('curator_dashboard_icon_alt', { tab: tab.title })}
										width={24}
										height={24}
										className={activeTab !== tab.key && theme === 'dark' ? 'dark-icons' : ''}
										style={{
											filter:
												activeTab === tab.key ? 'brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7151%) hue-rotate(321deg) brightness(90%) contrast(101%)' : 'none'
										}}
									/>
								</div>
								<div className='flex flex-col'>
									<span
										className={`${spaceGrotesk.className} ${spaceGrotesk.variable} text-base font-medium ${
											activeTab === tab.key ? 'font-extrabold text-pink_primary dark:text-[#FF4098]' : 'text-blue-light-medium dark:text-icon-dark-inactive'
										}`}
									>
										{tab.title}
									</span>
									<span
										className={`${spaceGrotesk.className} ${spaceGrotesk.variable} mt-1 text-sm ${
											activeTab === tab.key ? 'text-pink_primary dark:text-[#FF4098]' : 'text-blue-light-medium dark:text-icon-dark-inactive'
										}`}
									>
										{tab.description}
									</span>
								</div>
							</div>
							<RightOutlined className={classNames('ml-5', theme === 'dark' ? 'dark-icons' : '')} />
						</div>
					))}
				</div>
			</div>
			<div className='mt-3 w-2/3 flex-grow'>{tabs.find((tab) => tab.key === activeTab)?.children}</div>
		</div>
	);
};

export default CuratorDashboardTabItems;
