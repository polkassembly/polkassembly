// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Tabs } from 'antd';
import styled from 'styled-components';

const StyledTabs = styled(Tabs)`
	.ant-tabs-tab:not(.ant-tabs-tab-active) {
		border-bottom-color: ${(props) => (props.theme == 'dark' ? '#4B4B4B' : '#e1e6eb')} !important;
		font-weight: 400;
	}
	.ant-tabs-tab {
		background-color: transparent !important;
		font-weight: 600;
		font-size: 14px;
		padding: 10px 15px;
	}
	.ant-tabs-tab-btn {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.ant-tabs-nav::before {
		border-bottom: ${(props) => (props.theme == 'dark' ? '1px #4B4B4B solid' : '')} !important;
	}
	.ant-tabs-tab svg {
		fill: ${(props) => (props.theme == 'dark' ? '#FF60B5' : '#e5007a')} !important;
	}
	.ant-tabs-nav-list::after {
		content: '';
		width: 100%;
		border-bottom: ${(props) => (props.theme == 'dark' ? '1px #4B4B4B solid' : '1px solid #e1e6eb')} !important;
	}
	.ant-tabs-tab:not(.ant-tabs-tab-active) svg {
		fill: ${(props) => (props.theme == 'dark' ? '#FF60B5' : '#485F7D')} !important;
	}

	.ant-tabs-tab-active {
		border: none !important;
		border-bottom: ${(props) => (props.theme == 'dark' ? 'none' : '')} !important;
		color: #e5007a !important;
	}
	.ant-tabs .ant-tabs-tab .ant-tabs-tab-active .ant-tabs-tab-btn {
		color: #e5007a !important;
	}
`;

export const StatTabs = (props: any) => {
	return (
		<StyledTabs
			{...props}
			className={`${props.className}`}
		>
			{props.children}
		</StyledTabs>
	);
};
