// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, PropsWithChildren } from 'react';
import { Checkbox as ANTDCheckbox } from 'antd';
import styled from 'styled-components';

interface ICheckbox {
	className?: string;
	value?: any;
	onChange?: any;
	theme: any;
	checked?: boolean;
	name?: string;
}
const Checkbox: FC<PropsWithChildren<ICheckbox>> = (props) => {
	const { className, value, onChange, checked, name } = props;
	return (
		<ANTDCheckbox
			{...props}
			value={value}
			onChange={onChange}
			className={`${className}`}
			checked={checked}
			name={name}
		/>
	);
};

export default styled(Checkbox)`
	.ant-checkbox .ant-checkbox-inner {
		background-color: transparent !important;
	}

	.ant-checkbox .ant-checkbox-inner {
		border: ${(props: any) => (props.theme === 'dark' ? '1px solid #909090' : '1px solid #D2D8E0')};
	}

	.ant-checkbox-checked .ant-checkbox-inner {
		background-color: #e5007a !important;
		border-color: #e5007a !important;
	}
`;
