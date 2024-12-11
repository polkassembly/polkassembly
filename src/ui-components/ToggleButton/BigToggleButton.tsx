// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { useTheme } from 'next-themes';
import DarkModeSwitcher from '~assets/icons/darkmodeswitcher.svg';
import LightModeSwitcher from '~assets/icons/lightmodeswitcher.svg';
import classNames from 'classnames';
import { trackEvent } from 'analytics';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { useTranslation } from 'next-i18next';

const BigToggleButton = () => {
	const { resolvedTheme: theme, setTheme } = useTheme();
	const currentUser = useUserDetailsSelector();
	const { t } = useTranslation('common');

	return (
		<div className='flex w-full items-center justify-center'>
			<button
				onClick={(e) => {
					e.preventDefault();
					setTheme(theme === 'dark' ? 'light' : 'dark');
					// GAEvent for theme change
					trackEvent('theme_preference_change', 'switched_theme', {
						isWeb3Login: currentUser?.web3signup,
						theme: theme === 'dark' ? 'light' : 'dark',
						userId: currentUser?.id || '',
						userName: currentUser?.username || ''
					});
				}}
				className={classNames('mx-1 flex w-full cursor-pointer items-center justify-center gap-x-2 rounded-[26px] border border-solid bg-transparent px-2 py-2 outline-none', {
					'border-[#3B444F]': theme === 'dark',
					'border-section-light-container dark:border-[#3B444F]': theme === 'light'
				})}
			>
				{theme === 'dark' ? <LightModeSwitcher /> : <DarkModeSwitcher />}
				<p className='m-0 flex items-center justify-center gap-x-1'>
					<span className='text-xs font-normal tracking-[0.24px] text-bodyBlue dark:text-white'>{t('switch_to')}</span>
					<span className='text-xs font-semibold tracking-[0.24px] text-bodyBlue dark:text-white'>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
				</p>
			</button>
		</div>
	);
};

export default BigToggleButton;
