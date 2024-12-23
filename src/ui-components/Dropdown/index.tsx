// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Dropdown as AntdDropdown } from 'antd';

export const Dropdown = (props: any) => {
	return (
		<AntdDropdown
			{...props}
			overlayClassName={`dark:bg-section-dark-overlay dark:border-separatorDark dark:rounded-lg dark:text-white hover:[&>ul>li]:text-pink_primary ${
				props.theme == 'dark'
					? '[&>ul]:bg-section-dark-garyBackground [&>ul>li]:text-white [&>ul>.ant-dropdown-menu-item-selected]:bg-section-dark-garyBackground [&>ul>.ant-dropdown-menu-item-selected]:text-pink_primary hover:[&>ul>li]:bg-section-dark-garyBackground hover:[&>ul>li]:text-pink_secondary'
					: ''
			} z-[2000] ${props.hideOverflow ? '[&>ul]:overflow-hidden' : ''}`}
		>
			{props.children}
		</AntdDropdown>
	);
};
