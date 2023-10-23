// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Tabs as AntdTabs } from 'antd';

export const Tabs = (props: any) => {
	return (
		<AntdTabs
			{...props}
			className='ant-tabs-tab-bg-white text-sm font-medium text-blue-light-high dark:bg-section-dark-overlay dark:text-blue-dark-high md:px-2 dark:[&<.ant-tabs-tab-bg-white.ant-tabs-tab:not(.ant-tabs-tab-active)]:bg-transparent'
		>
			{props.children}
		</AntdTabs>
	);
};
