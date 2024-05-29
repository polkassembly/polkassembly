// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Switch as AntdSwitch, SwitchProps } from 'antd';
import { FC, PropsWithChildren } from 'react';
import styled from 'styled-components';

interface Props extends SwitchProps {
	className?: string;
}

const StyledSwitch = styled(AntdSwitch)`
	&.ant-switch .ant-switch-inner .ant-switch-inner-unchecked {
		background-color: #d2d8e0;
	}
`;

const Switch: FC<PropsWithChildren<Props>> = (props) => {
	const { className } = props;
	return (
		<StyledSwitch
			{...props}
			className={`${className}`}
		/>
	);
};

export default Switch;
