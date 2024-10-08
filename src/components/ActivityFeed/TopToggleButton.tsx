// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Tab } from './types/types';

interface TopToggleButtonProps {
	activeTab: Tab;
	setActiveTab: (tab: Tab) => void;
}

const TopToggleButton: React.FC<TopToggleButtonProps> = ({ activeTab, setActiveTab }) => {
	return (
		<div className='mt-2 flex h-9 items-center gap-1 rounded-lg bg-[#ECECEC] p-2 dark:bg-white dark:bg-opacity-[12%] md:gap-2 md:p-2  md:pt-5'>
			<p
				onClick={() => setActiveTab(Tab.Explore)}
				className={`mt-4 cursor-pointer rounded-md px-2 py-[3px] text-[15px] font-semibold  md:mt-1 md:px-4 md:py-[5px] md:text-[16px] ${
					activeTab === Tab.Explore ? 'bg-[#FFFFFF] text-[#E5007A] dark:bg-[#0D0D0D]' : 'text-[#485F7D] dark:text-[#DADADA]'
				}`}
			>
				Explore
			</p>
			<p
				onClick={() => setActiveTab(Tab.Following)}
				className={`mt-4 cursor-pointer rounded-lg px-2 py-[3px] text-[15px] font-semibold md:mt-1 md:px-4 md:py-[5px] md:text-[16px] ${
					activeTab === Tab.Following ? 'bg-[#FFFFFF] text-[#E5007A] dark:bg-[#0D0D0D]' : 'text-[#485F7D] dark:text-[#DADADA]'
				}`}
			>
				Subscribed
			</p>
		</div>
	);
};

export default TopToggleButton;
