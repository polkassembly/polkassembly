// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { useTheme } from 'next-themes';
import LightModeSwitcher from '~assets/Gifs/light-mode-icon.svg';
import DarkModeSwitcher from '~assets/Gifs/dark-mode-icon.svg';

import classNames from 'classnames';

const ToggleButton = () => {
	const { resolvedTheme: theme, setTheme } = useTheme();

	return (
		<div>
			<button
				onClick={(e) => {
					e.preventDefault();
					setTheme(theme === 'dark' ? 'light' : 'dark');
				}}
				className={classNames('flex w-full cursor-pointer items-center gap-2 rounded-full border-none bg-transparent')}
			>
				{theme === 'dark' ? <DarkModeSwitcher /> : <LightModeSwitcher />}
			</button>
		</div>
	);
};

export default ToggleButton;
