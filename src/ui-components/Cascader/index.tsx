// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Cascader as AntdCascader } from 'antd';
import { useTheme } from 'next-themes';
import React, { FC } from 'react';
import { styled } from 'styled-components';

const StyledCascader = styled(AntdCascader)`
	.ant-select-selector {
		&:hover {
			border-color: ${(props: any) => (props.theme === 'dark' ? 'none' : 'none')};
		}
	}
	.ant-select-selector {
		border-color: ${(props: any) => (props.theme === 'dark' ? '#4B4B4B' : '#D2D8E0')} !important;
	}
	.ant-select-selection-placeholder {
		color: ${(props: any) => (props.theme === 'dark' ? '#909090' : '#485F7D')} !important;
	}

	.ant-select-arrow {
		.anticon.anticon-down.ant-select-suffix {
			color: ${(props: any) => (props.theme === 'dark' ? '#909090' : '#485F7D')} !important;
		}
	}

	.ant-cascader-menu {
		li {
			color: purple;
		}
	}
`;

const Cascader: FC<any> = (props) => {
	const { resolvedTheme: theme } = useTheme();
	const { className } = props;

	return (
		<StyledCascader
			{...props}
			theme={theme as any}
			className={`${className}`}
		/>
	);
};

export default Cascader;
