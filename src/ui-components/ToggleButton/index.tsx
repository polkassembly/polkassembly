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
		<div className='-ml-2 flex  w-full items-center '>
			<div
				onClick={(e) => {
					e.preventDefault();
					setTheme(theme === 'dark' ? 'light' : 'dark');
				}}
				className={classNames('flex w-full cursor-pointer items-center  gap-2  bg-transparent px-4   ', {
					'border-[#3B444F]': theme === 'dark',
					'border-section-light-container dark:border-[#3B444F]': theme === 'light'
				})}
			>
				<span>{theme === 'dark' ? <LightModeSwitcher /> : <DarkModeSwitcher />}</span>
				<p className='pt-2'>{theme === 'dark' ? <>Light</> : <>Dark</>}</p>
			</div>
		</div>
	);
};

export default ToggleButton;
