// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button } from 'antd';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import React from 'react';
import { useDispatch } from 'react-redux';
import { communityTabActions } from '~src/redux/communityTab';
import { ECommunityTabs } from '~src/redux/communityTab/@types';
import { useCommunityTabSelector } from '~src/redux/selectors';

const TabButtons = () => {
	const { resolvedTheme: theme } = useTheme();
	const dispatch = useDispatch();
	const { selectedTab } = useCommunityTabSelector();

	return (
		<article className='flex items-center justify-start gap-x-3'>
			<Button
				className={`border-grey_primary_transparent flex h-[48px] items-center justify-center gap-x-2 rounded-xl border border-solid px-6 text-base font-semibold ${
					selectedTab === ECommunityTabs.MEMBERS ? 'text-green_tertiary' : 'text-bodyBlue dark:text-blue-dark-medium'
				}`}
				style={{
					backdropFilter: 'blur(10px)',
					background: `${
						selectedTab === ECommunityTabs.MEMBERS
							? theme === 'dark'
								? 'linear-gradient(0deg, #0D0D0D 0%, #0D0D0D 100%), linear-gradient(135deg, rgba(248, 251, 255, 0.04) 0%, rgba(255, 255, 255, 0.00) 100%)'
								: 'linear-gradient(0deg, #FFF 0%, #FFF 100%), linear-gradient(135deg, rgba(248, 251, 255, 0.04) 0%, rgba(255, 255, 255, 0.00) 100%)'
							: theme === 'dark'
							? 'linear-gradient(135deg, rgba(248, 251, 255, 0.04) 0%, rgba(255, 255, 255, 0.00) 100%)'
							: 'linear-gradient(0deg, rgba(255, 255, 255, 0.60) 0%, rgba(255, 255, 255, 0.60) 100%), linear-gradient(135deg, rgba(248, 251, 255, 0.04) 0%, rgba(255, 255, 255, 0.00) 100%)'
					}`,
					boxShadow: `${
						selectedTab === ECommunityTabs.MEMBERS
							? theme === 'dark'
								? '0px 0px 8px 0px rgba(43, 217, 105, 0.32) inset'
								: '0px 0px 8px 0px rgba(43, 217, 105, 0.32) inset'
							: theme === 'dark'
							? '0px 0px 8px 0px rgba(69, 74, 71, 0.32) inset'
							: '0px 0px 8px 0px rgba(69, 74, 71, 0.32) inset'
					}`
				}}
				onClick={() => {
					dispatch(communityTabActions.setSelectedTab(ECommunityTabs.MEMBERS));
				}}
			>
				<Image
					src={selectedTab === ECommunityTabs.MEMBERS ? '/assets/icons/community-tab/members-tab-green.svg' : '/assets/icons/community-tab/members-tab-grey.svg'}
					alt='members-tab'
					width={24}
					height={24}
					className={selectedTab !== ECommunityTabs.MEMBERS && theme == 'dark' ? 'dark-icons' : ''}
				/>
				Members
			</Button>
			<Button
				className={`border-grey_primary_transparent flex h-[48px] items-center justify-center gap-x-2 rounded-xl border border-solid px-6 text-base font-semibold ${
					selectedTab === ECommunityTabs.DELEGATES ? 'text-[#6214FF]' : 'text-bodyBlue dark:text-blue-dark-medium'
				}`}
				style={{
					backdropFilter: 'blur(10px)',
					background: `${
						selectedTab === ECommunityTabs.DELEGATES
							? theme === 'dark'
								? 'linear-gradient(0deg, #0D0D0D 0%, #0D0D0D 100%), linear-gradient(135deg, rgba(248, 251, 255, 0.04) 0%, rgba(255, 255, 255, 0.00) 100%)'
								: 'linear-gradient(0deg, rgba(255, 255, 255, 0.60) 0%, rgba(255, 255, 255, 0.60) 100%), linear-gradient(135deg, rgba(248, 251, 255, 0.04) 0%, rgba(255, 255, 255, 0.00) 100%)'
							: theme === 'dark'
							? 'linear-gradient(135deg, rgba(248, 251, 255, 0.04) 0%, rgba(255, 255, 255, 0.00) 100%)'
							: 'linear-gradient(0deg, rgba(255, 255, 255, 0.60) 0%, rgba(255, 255, 255, 0.60) 100%), linear-gradient(135deg, rgba(248, 251, 255, 0.04) 0%, rgba(255, 255, 255, 0.00) 100%)'
					}`,
					boxShadow: `${
						selectedTab === ECommunityTabs.DELEGATES
							? '0px 0px 8px 0px rgba(98, 20, 255, 0.32) inset'
							: theme === 'dark'
							? '0px 0px 8px 0px rgba(69, 74, 71, 0.32) inset'
							: '0px 0px 8px 0px rgba(69, 74, 71, 0.32) inset'
					}`
				}}
				onClick={() => {
					dispatch(communityTabActions.setSelectedTab(ECommunityTabs.DELEGATES));
				}}
			>
				<Image
					src={selectedTab === ECommunityTabs.DELEGATES ? '/assets/icons/community-tab/delegates-tab-green.svg' : '/assets/icons/community-tab/delegates-tab-grey.svg'}
					alt='members-tab'
					width={24}
					height={24}
					className={selectedTab !== ECommunityTabs.DELEGATES && theme == 'dark' ? 'dark-icons' : ''}
				/>
				Delegates
			</Button>
			<Button
				className={`border-grey_primary_transparent flex h-[48px] items-center justify-center gap-x-2 rounded-xl border border-solid px-6 text-base font-semibold ${
					selectedTab === ECommunityTabs.CURATORS ? 'text-[#044CE0]' : 'text-bodyBlue dark:text-blue-dark-medium'
				}`}
				style={{
					backdropFilter: 'blur(10px)',
					background: `${
						selectedTab === ECommunityTabs.CURATORS
							? theme === 'dark'
								? 'linear-gradient(0deg, #0D0D0D 0%, #0D0D0D 100%), linear-gradient(135deg, rgba(248, 251, 255, 0.04) 0%, rgba(255, 255, 255, 0.00) 100%)'
								: 'linear-gradient(0deg, rgba(255, 255, 255, 0.60) 0%, rgba(255, 255, 255, 0.60) 100%), linear-gradient(135deg, rgba(248, 251, 255, 0.04) 0%, rgba(255, 255, 255, 0.00) 100%)'
							: theme === 'dark'
							? 'linear-gradient(135deg, rgba(248, 251, 255, 0.04) 0%, rgba(255, 255, 255, 0.00) 100%)'
							: 'linear-gradient(0deg, rgba(255, 255, 255, 0.60) 0%, rgba(255, 255, 255, 0.60) 100%), linear-gradient(135deg, rgba(248, 251, 255, 0.04) 0%, rgba(255, 255, 255, 0.00) 100%)'
					}`,
					boxShadow: `${
						selectedTab === ECommunityTabs.CURATORS
							? '0px 0px 8px 0px rgba(20, 96, 249, 0.32) inset'
							: theme === 'dark'
							? '0px 0px 8px 0px rgba(69, 74, 71, 0.32) inset'
							: '0px 0px 8px 0px rgba(69, 74, 71, 0.32) inset'
					}`
				}}
				onClick={() => {
					dispatch(communityTabActions.setSelectedTab(ECommunityTabs.CURATORS));
				}}
			>
				<Image
					src={selectedTab === ECommunityTabs.CURATORS ? '/assets/icons/community-tab/curators-tab-green.svg' : '/assets/icons/community-tab/curators-tab-grey.svg'}
					alt='members-tab'
					width={24}
					height={24}
					className={selectedTab !== ECommunityTabs.CURATORS && theme == 'dark' ? 'dark-icons' : ''}
				/>
				Curators
			</Button>
			<Button
				className={`border-grey_primary_transparent flex h-[48px] items-center justify-center gap-x-2 rounded-xl border border-solid px-6 text-base font-semibold ${
					selectedTab === ECommunityTabs.EXPERTS ? 'text-[#EA0815]' : 'text-bodyBlue dark:text-blue-dark-medium'
				}`}
				style={{
					backdropFilter: 'blur(10px)',
					background: `${
						selectedTab === ECommunityTabs.EXPERTS
							? theme === 'dark'
								? 'linear-gradient(0deg, #0D0D0D 0%, #0D0D0D 100%), linear-gradient(135deg, rgba(248, 251, 255, 0.04) 0%, rgba(255, 255, 255, 0.00) 100%)'
								: 'linear-gradient(0deg, rgba(255, 255, 255, 0.60) 0%, rgba(255, 255, 255, 0.60) 100%), linear-gradient(135deg, rgba(248, 251, 255, 0.04) 0%, rgba(255, 255, 255, 0.00) 100%)'
							: theme === 'dark'
							? 'linear-gradient(135deg, rgba(248, 251, 255, 0.04) 0%, rgba(255, 255, 255, 0.00) 100%)'
							: 'linear-gradient(0deg, rgba(255, 255, 255, 0.60) 0%, rgba(255, 255, 255, 0.60) 100%), linear-gradient(135deg, rgba(248, 251, 255, 0.04) 0%, rgba(255, 255, 255, 0.00) 100%)'
					}`,
					boxShadow: `${
						selectedTab === ECommunityTabs.EXPERTS
							? '0px 0px 8px 0px rgba(252, 13, 27, 0.32) inset'
							: theme === 'dark'
							? '0px 0px 8px 0px rgba(69, 74, 71, 0.32) inset'
							: '0px 0px 8px 0px rgba(69, 74, 71, 0.32) inset'
					}`
				}}
				onClick={() => {
					dispatch(communityTabActions.setSelectedTab(ECommunityTabs.EXPERTS));
				}}
			>
				<Image
					src={selectedTab === ECommunityTabs.EXPERTS ? '/assets/icons/community-tab/experts-tab-green.svg' : '/assets/icons/community-tab/experts-tab-grey.svg'}
					alt='members-tab'
					width={24}
					height={24}
					className={selectedTab !== ECommunityTabs.EXPERTS && theme == 'dark' ? 'dark-icons' : ''}
				/>
				Experts
			</Button>
		</article>
	);
};

export default TabButtons;
