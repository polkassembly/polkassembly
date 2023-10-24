// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Tabs as AntdTabs } from 'antd';
import styled from 'styled-components';

const StyledTabs = styled(AntdTabs)`
	.ant-tabs-tab:not(.ant-tabs-tab-active) {
		background-color: ${(props) => (props.theme == 'dark' ? 'transparent' : 'white')} !important;
		border-top-color: ${(props) => (props.theme == 'dark' ? 'transparent' : 'white')} !important;
		border-left-color: ${(props) => (props.theme == 'dark' ? 'transparent' : 'white')} !important;
		border-right-color: ${(props) => (props.theme == 'dark' ? 'transparent' : 'white')} !important;
		border-bottom-color: ${(props) => (props.theme == 'dark' ? 'transparent' : '#e1e6eb')} !important;
	}
	.ant-tabs-tab {
		border: ${(props) => (props.theme == 'dark' ? 'none' : '')} !important;
	}
	.ant-tabs-nav::before {
		border-bottom: ${(props) => (props.theme == 'dark' ? '1px #4B4B4B solid' : '')} !important;
	}
	.ant-tabs-tab-active {
		background-color: ${(props) => (props.theme == 'dark' ? '#0D0D0D' : 'white')} !important;
		border: ${(props) => (props.theme == 'dark' ? '1px solid #4B4B4B' : '')} !important;
		border-bottom: ${(props) => (props.theme == 'dark' ? 'none' : '')} !important;
		// background-color: ${(props) => (props.theme == 'dark' ? 'transparent' : 'white')} !important;
		// border-bottom-color: ${(props) => (props.theme == 'dark' ? 'transparent' : 'white')} !important;
	}
`;

export const Tabs = (props: any) => {
	return (
		<StyledTabs
			{...props}
			className={`ant-tabs-tab-bg-white text-sm font-medium text-blue-light-high dark:bg-section-dark-overlay dark:text-blue-dark-high md:px-2 dark:[&<.ant-tabs-tab-bg-white.ant-tabs-tab:not(.ant-tabs-tab-active)]:bg-transparent ${props.className}`}
		>
			{props.children}
		</StyledTabs>
	);
};
