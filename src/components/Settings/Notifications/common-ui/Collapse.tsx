// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import styled from 'styled-components';
import { Collapse as AntDCollapse } from 'antd';
export const Collapse = styled(AntDCollapse)`
	.channel-header {
		svg {
			width: 24px;
			height: 24px;
		}
	}

	.ant-collapse-header {
		padding: 16px 20px !important;
	}

	.ant-collapse-header {
		padding: 16px 20px !important;
	}

	.ant-collapse-content-box {
		background-color: ${(props: any) => (props.theme === 'dark' ? '#0D0D0D' : '#fff')} !important;
	}

	.ant-collapse-item {
		border-bottom: 1px solid ${(props: any) => (props.theme === 'dark' ? '#90909060' : 'none')} !important;
	}

	.ant-collapse .ant-collapse-content {
		background-color: ${(props: any) => (props.theme === 'dark' ? '#0D0D0D' : '')} !important;
		border-top: ${(props: any) => (props.theme === 'dark' ? '1px solid #4B4B4B' : '')} !important;
	}

	@media (max-width: 768px) {
		&.ant-collapse-large > .ant-collapse-item > .ant-collapse-header {
			padding: 8px 12px !important;
		}
	}
	@media (max-width: 640px) {
		.ant-collapse-content-box {
			padding: 16px 8px !important;
		}
	}
`;
