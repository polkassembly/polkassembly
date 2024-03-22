// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Pagination as AntdPagination } from 'antd';
import styled from 'styled-components';

export const Pagination = styled(AntdPagination)`
	a {
		color: ${(props: any) => (props.theme === 'dark' ? '#fff' : '#212121')} !important;
	}
	.ant-pagination-item-active {
		background-color: ${(props: any) => (props.theme === 'dark' ? 'black' : 'white')} !important;
	}
	.anticon-right {
		color: ${(props: any) => (props.theme === 'dark' ? 'white' : '')} !important;
	}
	.anticon-left {
		color: ${(props: any) => (props.theme === 'dark' ? 'white' : '')} !important;
	}
`;
