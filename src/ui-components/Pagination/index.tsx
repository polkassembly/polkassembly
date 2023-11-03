// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Pagination as AntdPagination } from 'antd';
import styled from 'styled-components';

const StyledPagination = styled(AntdPagination)`
	a {
		color: ${(props) => (props.theme === 'dark' ? '#fff' : '#212121')} !important;
	}
	.ant-pagination-item-active {
		background-color: ${(props) => (props.theme === 'dark' ? 'black' : 'white')} !important;
	}
	.anticon-right {
		color: ${(props) => (props.theme === 'dark' ? 'white' : '')} !important;
	}
	.anticon-left {
		color: ${(props) => (props.theme === 'dark' ? 'white' : '')} !important;
	}
	.ant-pagination-item-ellipsis {
		color: ${(props) => (props.theme === 'dark' ? 'white' : '')} !important;
	}
`;

export const Pagination = (props: any) => {
	return <StyledPagination {...props}>{props.children}</StyledPagination>;
};
