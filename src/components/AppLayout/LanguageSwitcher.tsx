// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useRouter } from 'next/router';
import { GlobalOutlined } from '@ant-design/icons';
import { Dropdown } from '~src/ui-components/Dropdown';
import classNames from 'classnames';
import { useTheme } from 'next-themes';
import { useState } from 'react';

const languages = [
	{
		code: 'en',
		name: 'English'
	},
	{
		code: 'fr',
		name: 'Français'
	}
];

function LanguageSwitcher() {
	const { resolvedTheme: theme } = useTheme();
	const [isDropdownActive, setIsDropdownActive] = useState(false);
	const router = useRouter();

	const changeLanguage = (locale: string) => {
		router.push(router.pathname, router.asPath, { locale });
	};

	return (
		<div>
			<Dropdown
				disabled={false}
				trigger={['click']}
				className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-solid border-section-light-container ${
					theme === 'dark' ? 'border-none max-md:bg-section-dark-background md:bg-section-dark-overlay' : isDropdownActive ? 'bg-section-light-container' : 'bg-white'
				}`}
				menu={{
					items: languages.map((language) => {
						return {
							key: language.code,
							label: <p className={classNames('flex flex-col text-blue-light-medium dark:text-blue-dark-high')}>{language.name}</p>
						};
					}),
					onClick: (e: any) => {
						console.log(e);
						changeLanguage(e.key);
					}
				}}
				onOpenChange={() => setIsDropdownActive(!isDropdownActive)}
			>
				<span className='flex items-center justify-center text-white'>
					<GlobalOutlined className='text-lg' />
				</span>
			</Dropdown>
		</div>
	);
}

export default LanguageSwitcher;
