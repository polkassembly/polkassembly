// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Tabs as AntdTabs } from 'antd';
import styled from 'styled-components';

const StyledTabs = styled(AntdTabs)`
	.ant-tabs-tab:not(.ant-tabs-tab-active) {
		background-color: ${(props) => (props.theme == 'dark' ? 'transparent' : 'white')} !important;
		border-top: ${(props) => (props.theme == 'dark' ? 'none' : 'white')} !important;
		border-left: ${(props) => (props.theme == 'dark' ? 'none' : 'white')} !important;
		border-right: ${(props) => (props.theme == 'dark' ? 'none' : 'white')} !important;
		border-bottom-color: ${(props) => (props.theme == 'dark' ? '#4B4B4B' : '#e1e6eb')} !important;
	}
	.ant-tabs-tab {
		border-bottom-color: ${(props) => (props.theme == 'dark' ? 'red' : '')} !important;
		margin-left: 0px !important;
	}
	.ant-tabs-nav::before {
		border-bottom: ${(props) => (props.theme == 'dark' ? '1px #4B4B4B solid' : '')} !important;
	}

	.ant-tabs-tab-active {
		background-color: ${(props) => (props.theme == 'dark' ? '#0D0D0D' : 'white')} !important;
		border: ${(props) => (props.theme == 'dark' ? '1px solid #4B4B4B' : '')} !important;
		border-bottom: ${(props) => (props.theme == 'dark' ? 'none' : '')} !important;
		color: ${(props) => (props.theme == 'dark' ? '#FF60B5' : '#e5007a')} !important;
	}
	.ant-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
		color: ${(props) => (props.theme == 'dark' ? '#FF60B5' : '#e5007a')} !important;
	}
	.ant-tabs-card > .ant-tabs-nav .ant-tabs-tab-active,
	.ant-tabs-card > div > .ant-tabs-nav .ant-tabs-tab-active {
		color: ${(props) => (props.theme == 'dark' ? '#FF60B5' : '#e5007a')} !important;
	}

	.ant-tabs-tab-bg-white .ant-tabs-nav:before {
		border-bottom: 1px solid #e1e6eb;
	}
	.ant-tabs-nav-operations > button {
		color: ${(props) => (props.theme == 'dark' ? '#fff' : '#e5007a')} !important;
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
