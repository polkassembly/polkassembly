// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { useTheme } from 'next-themes';
import DarkModeSwitcher from '~assets/icons/darkmodeswitcher.svg';
import LightModeSwitcher from '~assets/icons/lightmodeswitcher.svg';
import classNames from 'classnames';

const ToggleButton = () => {
	const { resolvedTheme: theme, setTheme } = useTheme();

	return (
		<div className='flex items-center justify-center pb-[15px]'>
			<button
				onClick={(e) => {
					e.preventDefault();
					setTheme(theme === 'dark' ? 'light' : 'dark');
				}}
				className={classNames(
					'flex cursor-pointer items-center justify-center rounded-full border border-solid border-[#D2D8E0] bg-transparent p-2 outline-none dark:border-[#3B444F]',
					{
						'border-[#3B444F]': theme === 'dark',
						'border-[#D2D8E0] dark:border-[#3B444F]': theme === 'light'
					}
				)}
			>
				{theme === 'dark' ? <LightModeSwitcher /> : <DarkModeSwitcher />}
			</button>
		</div>
	);
};

export default ToggleButton;
