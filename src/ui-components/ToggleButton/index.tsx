// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { useTheme } from 'next-themes';
import DarkModeSwitcher from '~assets/icons/darkmodeswitcher.svg';
import LightModeSwitcher from '~assets/icons/lightmodeswitcher.svg';

const ToggleButton = () => {
	const { resolvedTheme: theme, setTheme } = useTheme();

	return (
		<button
			onClick={(e) => {
				e.preventDefault();
				setTheme(theme === 'dark' ? 'light' : 'dark');
			}}
			className='m-0 flex min-w-[200px] cursor-pointer items-center justify-center rounded-full border border-solid border-[#D2D8E0] bg-white p-2 py-1 hover:bg-none dark:border-separatorDark dark:bg-section-dark-overlay'
		>
			{theme === 'dark' ? <LightModeSwitcher /> : <DarkModeSwitcher />}
			<p className='m-0 font-poppins text-xs font-normal leading-[15px] text-bodyBlue dark:text-white'>Switch to</p>
			<p className='m-0 ml-[6px] mr-[11px] font-poppins text-xs font-semibold font-semibold leading-[18px] tracking-[0.02em] text-bodyBlue dark:text-white'>
				{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
			</p>
		</button>
	);
};

export default ToggleButton;
