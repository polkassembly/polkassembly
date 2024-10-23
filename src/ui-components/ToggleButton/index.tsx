// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { useTheme } from 'next-themes';
// import DarkModeSwitcher from '~assets/icons/darkmodeswitcher.svg';
// import LightModeSwitcher from '~assets/icons/lightmodeswitcher.svg';
import classNames from 'classnames';
import Image from 'next/image';

const ToggleButton = () => {
	const { resolvedTheme: theme, setTheme } = useTheme();

	return (
		<div>
			<button
				onClick={(e) => {
					e.preventDefault();
					setTheme(theme === 'dark' ? 'light' : 'dark');
				}}
				className={classNames('flex w-full cursor-pointer items-center gap-2 rounded-full border-none bg-transparent px-2 py-2 pt-[6px] ')}
			>
				{/* {theme === 'dark' ? <LightModeSwitcher /> : <DarkModeSwitcher />}{' '} */}
				<Image
					src={theme === 'dark' ? '/assets/Gifs/dark-mode-icon.png' : '/assets/Gifs/light-mode-icon.png'}
					alt='theme logo'
					// width={theme === 'dark' ? 40 : 50}
					// height={theme === 'dark' ? 40 : 50}
					width={40}
					height={40}
				/>
			</button>
		</div>
	);
};

export default ToggleButton;
