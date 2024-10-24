// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useRouter } from 'next/router';
import { GlobalOutlined } from '@ant-design/icons';
import { Dropdown } from '~src/ui-components/Dropdown';
import classNames from 'classnames';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { poppins } from 'pages/_app';
const languages = [
	{
		code: 'en',
		name: 'English'
	},
	{
		code: 'fr',
		name: 'Français'
	},
	{
		code: 'zh',
		name: '中文'
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
				theme={theme}
				trigger={['click']}
				className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-solid border-section-light-container bg-[#F6F7F9] ${
					theme === 'dark'
						? 'border border-solid border-separatorDark max-md:bg-section-dark-background md:bg-section-dark-overlay'
						: isDropdownActive
						? 'bg-section-light-container'
						: ''
				}`}
				menu={{
					items: languages.map((language) => {
						return {
							key: language.code,
							label: (
								<div className={classNames(`${poppins.className} ${poppins.variable} flex w-[100px] flex-col pt-1 text-blue-light-high dark:text-blue-dark-high`)}>
									{language.name}
								</div>
							)
						};
					}),
					onClick: (e: any) => {
						changeLanguage(e.key);
					}
				}}
				onOpenChange={() => setIsDropdownActive(!isDropdownActive)}
			>
				<span className='flex items-center justify-center text-white'>
					<GlobalOutlined className='text-lg text-pink_primary' />
				</span>
			</Dropdown>
		</div>
	);
}
export default LanguageSwitcher;
