// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Switch as AntdSwitch, SwitchProps } from 'antd';
import { FC, PropsWithChildren } from 'react';

interface Props extends SwitchProps {
	className?: string;
}

const Switch: FC<PropsWithChildren<Props>> = (props) => {
	const { className } = props;
	return (
		<AntdSwitch
			{...props}
			className={`${className}`}
		/>
	);
};

export default Switch;
