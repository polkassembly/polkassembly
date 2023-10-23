// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Dropdown as AntdDropdown } from 'antd';

export const Dropdown = (props: any) => {
	return (
		<AntdDropdown
			{...props}
			overlayClassName={`dark:bg-section-dark-overlay dark:text-white ${props.theme == 'dark' ? '[&>ul]:bg-section-dark-overlay [&>ul>li]:text-white' : ''}`}
		>
			{props.children}
		</AntdDropdown>
	);
};
