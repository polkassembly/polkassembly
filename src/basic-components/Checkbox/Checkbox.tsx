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
	value?: string;
	onChange?: any;
}
const Checkbox: FC<PropsWithChildren<ICheckbox>> = (props) => {
	const { className, value, onChange } = props;
	return (
		<ANTDCheckbox
			{...props}
			value={value}
			onChange={onChange}
			className={`${className}`}
		/>
	);
};

export default styled(Checkbox)`
	.ant-checkbox .ant-checkbox-inner {
		background-color: transparent !important;
	}
	.ant-checkbox-checked .ant-checkbox-inner {
		background-color: #e5007a !important;
		border-color: #e5007a !important;
	}
`;
